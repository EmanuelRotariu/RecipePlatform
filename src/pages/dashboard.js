import { useState } from "react"; /* Importăm hook-ul pentru starea locală a formularului */
import { db } from "../lib/firebase"; /* Importăm baza de date Firestore */
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; /* Importăm funcțiile de scriere în DB */
import withAuth from "@/components/withAuth"; /* Protejăm pagina pentru utilizatori logați */
import { auth } from "../lib/firebase"; /* Importăm instanța de autentificare */

function Dashboard() {
  const [title, setTitle] = useState(""); /* Titlul rețetei */
  const [description, setDescription] = useState(""); /* O scurtă descriere */
  const [ingredients, setIngredients] = useState(""); /* Lista de ingrediente */
  const [steps, setSteps] = useState(""); /* Instrucțiunile de preparare */
  const [images, setImages] = useState([""]); /* Un array care începe cu un câmp gol pentru URL-ul imaginii */
  const [message, setMessage] = useState(""); /* Mesaj de feedback (succes sau eroare) */
  const [loading, setLoading] = useState(false); /* Stare pentru a dezactiva butonul în timpul salvării */

  const handleSubmit = async (e) => {
    e.preventDefault(); /* Prevenim reîncărcarea paginii */
 /* Validare: verificăm dacă câmpurile esențiale sunt completate */
    if (!title || !ingredients || !steps) {
      setMessage("Title, Ingredients și Steps sunt obligatorii!");
      return;
    }

    setLoading(true); /* Activăm starea de încărcare */
    setMessage("Se salvează rețeta...");

    try {
      /* Adăugăm un document nou în colecția "recipes" */
      await addDoc(collection(db, "recipes"), {
        title,
        description,
        ingredients,
        steps,
        /* Filtrăm URL-urile goale pentru a nu salva string-uri inutile în baza de date */
        images: images.filter((img) => img.trim() !== ""),
        createdAt: serverTimestamp(), /* Timestamp generat de serverul Firebase */
        userId: auth.currentUser.uid, /* Asociem rețeta cu ID-ul utilizatorului logat */
      });

      setMessage("✅ Rețeta a fost adăugată cu succes!");
      /* Resetăm toate câmpurile formularului după succes */
      setTitle("");
      setDescription("");
      setIngredients("");
      setSteps("");
      setImages([""]);
    } catch (err) {
      setMessage("❌ Eroare la adăugarea rețetei: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        {/* Afișăm mesajul de stare dacă acesta există */}
        Dashboard – Adaugă o rețetă
      </h1>

      {message && (
        <p className="mb-4 text-center text-blue-600 dark:text-blue-400">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 p-6 rounded shadow flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Titlu"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Descriere"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Ingrediente (separate prin ; )"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Pași (separați prin ; )"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          className="border p-2 rounded"
        />

        {/* IMAGINI DINAMICE */}
        <h3 className="font-semibold text-black dark:text-white">
          Imagini (URL)
        </h3>

        {images.map((img, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Imagine ${index + 1}`}
            value={img}
            onChange={(e) => {
              const newImages = [...images];
              newImages[index] = e.target.value;
              setImages(newImages);
            }}
            className="border p-2 rounded"
          />
        ))}

        <button
          type="button"
          onClick={() => setImages([...images, ""])}
          className="bg-gray-300 p-2 rounded hover:bg-gray-400 transition"
        >
          + Adaugă imagine
        </button>

        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Se salvează..." : "Adaugă rețeta"}
        </button>
      </form>
    </div>
  );
}

export default withAuth(Dashboard);
