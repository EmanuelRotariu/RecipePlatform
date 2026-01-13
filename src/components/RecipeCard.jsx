import { useState } from "react"; /* Hook pentru a gestiona indexul imaginii curente în slider */
import Link from "next/link"; /* Componentă pentru link-uri interne */
import { auth } from "../lib/firebase"; /* Importăm instanța auth pentru a verifica cine este la tastatură */

export default function RecipeCard({ recipe, isFavorite, toggleFavorite }) {
  /* Normalizăm imaginile: acceptăm și formatul nou (array) și cel vechi (string) */
  const images = Array.isArray(recipe.images)
    ? recipe.images
    : recipe.image
    ? [recipe.image]
    : [];

  const [currentImage, setCurrentImage] = useState(0); /* Starea pentru indexul imaginii afișate în card */

  /* Funcție pentru imaginea următoare (previne accesarea link-ului de sub imagine) */
  const nextImage = (e) => {
    e.preventDefault(); /* Oprim navigarea către pagina rețetei când se apasă pe săgeată */
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  /* Funcție pentru imaginea anterioară */
  const prevImage = (e) => {
    e.preventDefault(); /* Oprim navigarea către pagina rețetei */
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow hover:shadow-lg transition">
      {/* Întregul conținut de sus este un link către pagina detaliată a rețetei */}
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative w-full h-48 mb-2 overflow-hidden rounded">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImage]}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded"
              />
              {/* Afișăm butoanele de navigare doar dacă rețeta are mai mult de o imagine */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded"
                  >
                    ◀
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded"
                  >
                    ▶
                  </button>
                </>
              )}
            </>
          ) : (
            /* Placeholder în cazul în care rețeta nu are nicio imagine */
            <div className="w-full h-48 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500 rounded">
              No image
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-black dark:text-white">
          {recipe.title}
        </h2>
        {/* Afișăm rating-ul mediu și numărul de recenzii calculate în pagina index.js */}
        <p className="text-gray-700 dark:text-gray-300">
          {recipe.averageRating}/5 ({recipe.ratingsCount})
        </p>
      </Link>

      {/* BUTON FAVORITE: Schimbă culoarea și textul în funcție de starea isFavorite */}
      <button
        onClick={() => toggleFavorite(recipe)}
        className={`mt-2 w-full p-2 rounded ${
          isFavorite
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } transition`}
      >
        {isFavorite ? "Șterge din favorite" : "Adaugă la favorite"}
      </button>

      {/* BUTON EDITARE: Apare doar dacă utilizatorul logat este creatorul rețetei */}
      {auth.currentUser && auth.currentUser.uid === recipe.userId && (
        <Link href={`/edit-recipe/${recipe.id}`}>
          <button className="mt-2 w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition">
            Editează rețeta
          </button>
        </Link>
      )}
    </div>
  );
}
