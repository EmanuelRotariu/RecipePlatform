import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import withAuth from "@/components/withAuth";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !ingredients || !steps) {
      setMessage("Title, Ingredients și Steps sunt obligatorii!");
      return;
    }

    try {
      await addDoc(collection(db, "recipes"), {
        title,
        description,
        ingredients,
        steps,
        image,
        createdAt: serverTimestamp(),
      });

      setMessage("Rețeta a fost adăugată cu succes!");
      setTitle(""); setDescription(""); setIngredients(""); setSteps(""); setImage("");
    } catch (err) {
      setMessage("Eroare la adăugarea rețetei: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        Dashboard – Adaugă o rețetă
      </h1>

      {message && <p className="mb-4 text-center text-red-500">{message}</p>}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 p-6 rounded shadow flex flex-col gap-4"
      >
        <input type="text" placeholder="Titlu" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded"/>
        <textarea placeholder="Descriere" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded"/>
        <textarea placeholder="Ingrediente (separate prin ; )" value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="border p-2 rounded"/>
        <textarea placeholder="Pași (separați prin ; )" value={steps} onChange={(e) => setSteps(e.target.value)} className="border p-2 rounded"/>
        <input type="text" placeholder="URL imagine" value={image} onChange={(e) => setImage(e.target.value)} className="border p-2 rounded"/>
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Adaugă rețeta</button>
      </form>
    </div>
  );
}

// Protejăm pagina cu withAuth
export default withAuth(Dashboard);
