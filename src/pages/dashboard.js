import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import withAuth from "@/components/withAuth";
import { auth } from "../lib/firebase";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [images, setImages] = useState([""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !ingredients || !steps) {
      setMessage("Title, Ingredients și Steps sunt obligatorii!");
      return;
    }

    setLoading(true);
    setMessage("Se salvează rețeta...");

    try {
      await addDoc(collection(db, "recipes"), {
        title,
        description,
        ingredients,
        steps,
        images: images.filter((img) => img.trim() !== ""),
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
      });

      setMessage("✅ Rețeta a fost adăugată cu succes!");
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
