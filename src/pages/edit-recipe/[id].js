import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function EditRecipe() {
  const router = useRouter();
  const { id } = router.query; /* Extragem ID-ul rețetei din URL-ul paginii (ex: /edit-recipe/123) */

  const [loading, setLoading] = useState(true); /* Stare pentru a afișa un mesaj până când se încarcă datele */
  const [recipe, setRecipe] = useState(null); /* Starea pentru a stoca datele originale ale rețetei */

  /* Stări pentru fiecare câmp editabil al formularului */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [images, setImages] = useState([""]);

  /* Efect pentru a încărca datele rețetei imediat ce avem ID-ul și utilizatorul este logat */
  useEffect(() => {
    if (!id || !auth.currentUser) return; /* Dacă nu avem ID sau utilizatorul nu e logat, oprim execuția */

    const fetchRecipe = async () => {
      const ref = doc(db, "recipes", id); /* Creăm referința către documentul rețetei în Firestore */
      const snap = await getDoc(ref); /* Încercăm să citim documentul */

      if (!snap.exists()) { /* Verificăm dacă rețeta chiar există în baza de date */
        alert("Rețeta nu există");
        router.push("/"); /* Redirecționăm la prima pagină dacă rețeta este inexistentă */
        return;
      }

      const data = snap.data(); /* Extragem datele efective ale documentului */

      //  securitate: doar autorul poate edita
      if (data.userId !== auth.currentUser.uid) {
        alert("Nu ai dreptul să editezi această rețetă");
        router.push(`/recipes/${id}`);
        return;
      }
/* Populăm stările formularului cu datele primite de la Firebase */
      setRecipe(data);
      setTitle(data.title);
      setDescription(data.description);
      setIngredients(data.ingredients);
      setSteps(data.steps);
      /* Dacă rețeta are imagini, le folosim, altfel punem un câmp gol */
      setImages(data.images?.length ? data.images : [""]);
      setLoading(false);
    };

    fetchRecipe();
  }, [id]); /* Re-rulăm efectul dacă ID-ul din URL se schimbă */

  /* Funcția care salvează modificările în baza de date */
  const handleSave = async () => {
    const ref = doc(db, "recipes", id); /* Referința către documentul ce trebuie actualizat */
/* Actualizăm documentul în Firestore cu noile valori din formular */
    await updateDoc(ref, {
      title,
      description,
      ingredients,
      steps,
      /* Eliminăm URL-urile care conțin doar spații goale înainte de salvare */
      images: images.filter((img) => img.trim() !== "")
    });

    alert("Rețeta a fost actualizată");
    router.push(`/recipes/${id}`); /* Redirecționăm utilizatorul la pagina detaliată a rețetei actualizate */
  };

  if (loading) return <p className="p-6">Se încarcă...</p>; /* Afișat doar în timpul preluării datelor */

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editează rețeta</h1>
    {/* Input pentru Titlu */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titlu"
        className="w-full border p-2 mb-2"
      />
  {/* Textarea pentru Descriere */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descriere"
        className="w-full border p-2 mb-2"
      />
    {/* Textarea pentru Ingrediente */}
      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Ingrediente (separate prin ;)"
        className="w-full border p-2 mb-2"
      />
    {/* Textarea pentru Pași */}
      <textarea
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        placeholder="Pași (separați prin ;)"
        className="w-full border p-2 mb-4"
      />

      <h3 className="font-semibold mb-2">Imagini</h3>
      {/* Generăm input-uri pentru fiecare imagine din array */}
      {images.map((img, index) => (
        <input
          key={index}
          value={img}
          onChange={(e) => {
            const newImgs = [...images];
            newImgs[index] = e.target.value;
            setImages(newImgs);
          }}
          placeholder={`Imagine ${index + 1}`}
          className="w-full border p-2 mb-2"
        />
      ))}

      <button
        onClick={() => setImages([...images, ""])}
        className="bg-gray-300 p-2 rounded mb-4"
      >
        + Adaugă imagine
      </button>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Salvează modificările
      </button>
    </div>
  );
}
