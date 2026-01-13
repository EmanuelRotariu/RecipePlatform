import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"; /* Importăm metodele Firestore */
import { useEffect, useState } from "react"; /* Hook-uri React */
import { db, auth } from "../lib/firebase"; /* Baza de date și autentificarea */
import RecipeCard from "../components/RecipeCard"; /* Componenta care afișează o singură rețetă */

export default function Home() {
  const [recipes, setRecipes] = useState([]); /* Lista completă de rețete din baza de date */
  const [searchTerm, setSearchTerm] = useState(""); /* Termenul de căutare introdus de utilizator */
  const [loading, setLoading] = useState(true); /* Stare pentru a afișa un indicator de încărcare */
  const [favoritesIds, setFavoritesIds] = useState([]); /* Lista ID-urilor rețetelor marcate ca favorite */
  const [sortBy, setSortBy] = useState("recent"); /* Criteriul de sortare: 'recent' sau 'popular' */
  const [tagFilters, setTagFilters] = useState([]); /* Array cu tag-urile active pentru filtrare */

  /* Efect pentru a descărca toate rețetele la încărcarea paginii */
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "recipes")); /* Preluăm documentele din colecția 'recipes' */
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); /* Formatăm datele și adăugăm ID-ul */
        setRecipes(data); /* Salvăm rețetele în stare */
      } catch (error) {
        console.error("Eroare la citire:", error);
      } finally {
        setLoading(false); /* Oprim indicatorul de încărcare */
      }
    };
    fetchRecipes();
  }, []);

  /* Efect pentru a prelua lista de favorite a utilizatorului logat */
  useEffect(() => {
    if (!auth.currentUser) return; /* Dacă nu e nimeni logat, nu facem nimic */
    const fetchFavorites = async () => {
      try {
        /* Accesăm sub-colecția de favorite a utilizatorului curent */
        const favCol = collection(db, "favorites", auth.currentUser.uid, "recipes"); 
        const snapshot = await getDocs(favCol);
        const ids = snapshot.docs.map(doc => doc.id); /* Extragem doar ID-urile */
        setFavoritesIds(ids); /* Salvăm ID-urile favoritelor */
      } catch (err) {
        console.error("Eroare la citire favorites:", err);
      }
    };
    fetchFavorites();
  }, []);

  /* Funcție pentru a adăuga/șterge o rețetă de la favorite */
  const toggleFavorite = async (recipe) => {
    if (!auth.currentUser) return alert("Trebuie să fii logat!"); /* Verificare autentificare */
    const favRef = doc(db, "favorites", auth.currentUser.uid, "recipes", recipe.id); /* Referință către document */
    try {
      if (favoritesIds.includes(recipe.id)) {
        await deleteDoc(favRef); /* Ștergem din Firebase dacă era deja favorit */
        setFavoritesIds(favoritesIds.filter(id => id !== recipe.id)); /* Actualizăm starea locală */
      } else {
        await setDoc(favRef, { ...recipe }); /* Adăugăm în Firebase dacă nu era favorit */
        setFavoritesIds([...favoritesIds, recipe.id]); /* Actualizăm starea locală */
      }
    } catch (err) {
      console.error("Eroare la toggle favorite:", err);
    }
  };

  /* Logică pentru filtrare: combină căutarea text cu tag-urile selectate */
  const filteredRecipes = recipes
    .filter(recipe =>
      /* Verificăm dacă titlul sau ingredientele conțin textul căutat */
      (recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       recipe.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      /* Verificăm dacă rețeta conține TOATE tag-urile selectate în filtre */
      (tagFilters.length === 0 || 
       (recipe.tags && tagFilters.every(tag => recipe.tags.includes(tag))))
    )
    .map(recipe => {
      /* Calculăm rating-ul mediu pentru fiecare rețetă pe baza comentariilor */
      const validRatings = recipe.comments?.filter(c => typeof c.rating === "number") || [];
      const averageRating = validRatings.length
        ? (validRatings.reduce((acc, c) => acc + c.rating, 0) / validRatings.length).toFixed(1)
        : 0;
      return { ...recipe, averageRating, ratingsCount: validRatings.length }; /* Returnăm obiectul cu datele de rating incluse */
    });

  /* Logică pentru sortare */
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "popular") return b.averageRating - a.averageRating; /* Sortare după rating descrescător */
    if (sortBy === "recent") return b.createdAt?.seconds - a.createdAt?.seconds || 0; /* Sortare după data creării */
    return 0;
  });

  if (loading) return <p className="text-center mt-10">Se încarcă rețetele...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Rețete</h1>

      {/* Secțiunea de Search și Butoane de Sortare */}
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

      {/* Secțiunea de filtre după Tag-uri */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["vegetarian", "gluten-free", "quick", "italian"].map(tag => (
          <label key={tag} className="flex items-center gap-1">
            <input
              type="checkbox"
              value={tag}
              checked={tagFilters.includes(tag)}
              onChange={(e) => {
                if (e.target.checked) {
                  setTagFilters([...tagFilters, tag]); /* Adaugă tag în filtru */
                } else {
                  setTagFilters(tagFilters.filter(t => t !== tag)); /* Elimină tag din filtru */
                }
              }}
              className="accent-blue-600"
            />
            {tag}
          </label>
        ))}
      </div>

      {/* Grid-ul unde se afișează cardurile de rețete */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorite={favoritesIds.includes(recipe.id)} /* Verificăm dacă este la favorite */
            toggleFavorite={toggleFavorite} /* Pasăm funcția de toggle */
          />
        ))}

        {/* Mesaj în cazul în care nu există rezultate */}
        {sortedRecipes.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            Nicio rețetă găsită.
          </p>
        )}
      </div>
    </div>
  );
}