import { useState } from "react";
import Link from "next/link";

export default function RecipeCard({ recipe, isFavorite, toggleFavorite }) {
  // Array de imagini
  const images = Array.isArray(recipe.images)
    ? recipe.images
    : recipe.image
    ? [recipe.image]
    : [];

  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow hover:shadow-lg transition">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative w-full h-48 mb-2 overflow-hidden rounded">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImage]}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded"
              />
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
            <div className="w-full h-48 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500 rounded">
              No image
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-black dark:text-white">{recipe.title}</h2>
        <p className="text-gray-700 dark:text-gray-300">{recipe.averageRating}/5 ({recipe.ratingsCount})</p>
      </Link>

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
    </div>
  );
}
