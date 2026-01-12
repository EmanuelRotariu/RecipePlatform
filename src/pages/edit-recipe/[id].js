import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function EditRecipe() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [images, setImages] = useState([""]);

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const fetchRecipe = async () => {
      const ref = doc(db, "recipes", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Rețeta nu există");
        router.push("/");
        return;
      }

      const data = snap.data();

      // 🔒 securitate: doar autorul poate edita
      if (data.userId !== auth.currentUser.uid) {
        alert("Nu ai dreptul să editezi această rețetă");
        router.push(`/recipes/${id}`);
        return;
      }

      setRecipe(data);
      setTitle(data.title);
      setDescription(data.description);
      setIngredients(data.ingredients);
      setSteps(data.steps);
      setImages(data.images?.length ? data.images : [""]);
      setLoading(false);
    };

    fetchRecipe();
  }, [id]);

  const handleSave = async () => {
    const ref = doc(db, "recipes", id);

    await updateDoc(ref, {
      title,
      description,
      ingredients,
      steps,
      images: images.filter((img) => img.trim() !== "")
    });

    alert("Rețeta a fost actualizată");
    router.push(`/recipes/${id}`);
  };

  if (loading) return <p className="p-6">Se încarcă...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editează rețeta</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titlu"
        className="w-full border p-2 mb-2"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descriere"
        className="w-full border p-2 mb-2"
      />

      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Ingrediente (separate prin ;)"
        className="w-full border p-2 mb-2"
      />

      <textarea
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        placeholder="Pași (separați prin ;)"
        className="w-full border p-2 mb-4"
      />

      <h3 className="font-semibold mb-2">Imagini</h3>

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
