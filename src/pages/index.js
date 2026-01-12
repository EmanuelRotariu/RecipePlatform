import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import RecipeCard from "../components/RecipeCard"; // componenta card

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoritesIds, setFavoritesIds] = useState([]);
  const [sortBy, setSortBy] = useState("recent"); // recent | popular
  const [tagFilters, setTagFilters] = useState([]); // filtre pentru tag-uri

  // Fetch rețete
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "recipes"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(data);
      } catch (error) {
        console.error("Eroare la citire:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Fetch favorites
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchFavorites = async () => {
      try {
        const favCol = collection(db, "favorites", auth.currentUser.uid, "recipes");
        const snapshot = await getDocs(favCol);
        const ids = snapshot.docs.map(doc => doc.id);
        setFavoritesIds(ids);
      } catch (err) {
        console.error("Eroare la citire favorites:", err);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (recipe) => {
    if (!auth.currentUser) return alert("Trebuie să fii logat!");
    const favRef = doc(db, "favorites", auth.currentUser.uid, "recipes", recipe.id);
    try {
      if (favoritesIds.includes(recipe.id)) {
        await deleteDoc(favRef);
        setFavoritesIds(favoritesIds.filter(id => id !== recipe.id));
      } else {
        await setDoc(favRef, { ...recipe });
        setFavoritesIds([...favoritesIds, recipe.id]);
      }
    } catch (err) {
      console.error("Eroare la toggle favorite:", err);
    }
  };

  // Filtrare rețete după search și tag-uri
  const filteredRecipes = recipes
    .filter(recipe =>
      (recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       recipe.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (tagFilters.length === 0 || 
       (recipe.tags && tagFilters.every(tag => recipe.tags.includes(tag))))
    )
    .map(recipe => {
      const validRatings = recipe.comments?.filter(c => typeof c.rating === "number") || [];
      const averageRating = validRatings.length
        ? (validRatings.reduce((acc, c) => acc + c.rating, 0) / validRatings.length).toFixed(1)
        : 0;
      return { ...recipe, averageRating, ratingsCount: validRatings.length };
    });

  // Sortare
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "popular") return b.averageRating - a.averageRating;
    if (sortBy === "recent") return b.createdAt?.seconds - a.createdAt?.seconds || 0;
    return 0;
  });

  if (loading) return <p className="text-center mt-10">Se încarcă rețetele...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Rețete</h1>

      {/* Search și Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Caută după titlu sau ingrediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border p-2 rounded text-black"
        />
        <div className="flex gap-2">
          <button
            className={`p-2 rounded ${sortBy === "recent" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-zinc-700"}`}
            onClick={() => setSortBy("recent")}
          >
            Cele mai recente
          </button>
          <button
            className={`p-2 rounded ${sortBy === "popular" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-zinc-700"}`}
            onClick={() => setSortBy("popular")}
          >
            Cele mai populare
          </button>
        </div>
      </div>

      {/* Filtre tag-uri */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["vegetarian", "gluten-free", "quick", "italian"].map(tag => (
          <label key={tag} className="flex items-center gap-1">
            <input
              type="checkbox"
              value={tag}
              checked={tagFilters.includes(tag)}
              onChange={(e) => {
                if (e.target.checked) {
                  setTagFilters([...tagFilters, tag]);
                } else {
                  setTagFilters(tagFilters.filter(t => t !== tag));
                }
              }}
              className="accent-blue-600"
            />
            {tag}
          </label>
        ))}
      </div>

      {/* Card-uri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorite={favoritesIds.includes(recipe.id)}
            toggleFavorite={toggleFavorite}
          />
        ))}

        {sortedRecipes.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            Nicio rețetă găsită.
          </p>
        )}
      </div>
    </div>
  );
}
