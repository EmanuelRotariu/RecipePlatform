import { useEffect, useState } from "react"; /* Hook-uri React */
import { db, auth } from "../lib/firebase"; /* Firebase config */
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore"; /* Funcții Firestore */
import withAuth from "@/components/withAuth";
import Link from "next/link"; /* Navigare */

//  funcție pentru a lua prima imagine
const getFirstImage = (recipe) => {
  if (Array.isArray(recipe.images) && recipe.images.length > 0) /* Dacă e array, ia prima */
    return recipe.images[0];
  if (typeof recipe.image === "string") return recipe.image; /* Dacă e string vechi, ia imaginea */
  return null; /* Altfel, returnează null */
}; 

function Favorites() {
  const [favorites, setFavorites] = useState([]); /* Lista de rețete favorite */
  const [loading, setLoading] = useState(true); /* Stare încărcare */
/* Funcție pentru preluarea datelor din sub-colecția de favorite a utilizatorului */
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const favCol = collection(db, "favorites", auth.currentUser.uid, "recipes");
      const snapshot = await getDocs(favCol);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(data);
    } catch (err) {
      console.error("Eroare la citire favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(); /* Se execută la încărcarea paginii */
  }, []);
/* Funcție pentru a elimina o rețetă de la favorite */
  const handleRemove = async (id) => {
    try {
      /* Ștergem documentul din Firestore */
      await deleteDoc(doc(db, "favorites", auth.currentUser.uid, "recipes", id));
      /* Actualizăm starea locală instant pentru a elimina cardul din UI */
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (err) {
      console.error("Eroare la ștergerea favorite:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Se încarcă favoritele...</p>;
  if (favorites.length === 0)
    return <p className="text-center mt-10 text-gray-500">Nu ai nicio rețetă favorită.</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Favorite</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(fav => {
          const validRatings = fav.comments?.filter(c => typeof c.rating === "number") || [];
          const averageRating = validRatings.length
            ? (validRatings.reduce((acc, c) => acc + c.rating, 0) / validRatings.length).toFixed(1)
            : 0;

          const firstImage = getFirstImage(fav);

          return (
            <div
              key={fav.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded shadow hover:shadow-lg transition"
            >
              {firstImage ? (
                <img
                  src={firstImage}
                  alt={fav.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 dark:bg-zinc-700 rounded mb-2 flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}

              <h2 className="text-xl font-semibold text-black dark:text-white">{fav.title}</h2>
              <p className="text-gray-700 dark:text-gray-300">{averageRating}/5 ({validRatings.length})</p>

              <div className="flex gap-2 mt-2">
                <Link
                  href={`/recipes/${fav.id}`}
                  className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition"
                >
                  Vezi
                </Link>
                <button
                  onClick={() => handleRemove(fav.id)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition"
                >
                  Șterge
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default withAuth(Favorites);
