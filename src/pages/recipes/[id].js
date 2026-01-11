import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipe(docSnap.data());
        } else {
          setRecipe(null);
        }
      } catch (error) {
        console.error("Eroare la citire rețetă:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Se încarcă rețeta...</p>;
  if (!recipe)
    return <p className="text-center mt-10 text-red-500">Rețeta nu a fost găsită.</p>;

  const images = recipe.images || [];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleAddReview = async () => {
    if (userRating === 0) {
      alert("Trebuie să dai rating înainte de a adăuga review!");
      return;
    }

    const newReview = {
      userId: user.uid,
      userName: user.displayName || user.email || "Anonim",
      rating: userRating,
      text: commentText.trim() || "",
    };

    try {
      const docRef = doc(db, "recipes", id);
      await updateDoc(docRef, {
        comments: arrayUnion(newReview),
      });

      setRecipe({
        ...recipe,
        comments: recipe.comments
          ? [...recipe.comments, newReview]
          : [newReview],
      });

      setUserRating(0);
      setCommentText("");
    } catch (err) {
      console.error("Eroare la adăugarea review-ului:", err);
    }
  };

  const validRatings =
    recipe.comments?.filter((c) => typeof c.rating === "number") || [];

  const averageRating = validRatings.length
    ? (
        validRatings.reduce((acc, c) => acc + c.rating, 0) /
        validRatings.length
      ).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">
          {recipe.title}
        </h1>

        <p className="mb-4 text-lg text-yellow-600">
          {averageRating}/5 ({validRatings.length} review-uri)
        </p>

        {/* IMAGE SLIDER */}
        {images.length > 0 ? (
          <div className="relative mb-6">
            <img
              src={images[currentImage]}
              alt={`Imagine ${currentImage + 1}`}
              className="w-full h-64 object-cover rounded"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded"
                >
                  ›
                </button>
              </>
            )}

            <p className="text-center text-sm text-gray-500 mt-1">
              {currentImage + 1} / {images.length}
            </p>
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-200 dark:bg-zinc-700 rounded mb-6 flex items-center justify-center text-gray-500">
            No images
          </div>
        )}

        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {recipe.description}
        </p>

        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">
          Ingrediente
        </h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300">
          {recipe.ingredients.split(";").map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">
          Pași
        </h2>
        <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6">
          {recipe.steps.split(";").map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>

        {/* REVIEW */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
            Adaugă un review
          </h3>

          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setUserRating(n)}
                className={`px-3 py-1 rounded border ${
                  userRating === n
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-200 dark:bg-zinc-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Scrie comentariul tău (opțional)"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full border p-2 rounded mb-2 dark:bg-zinc-800 dark:text-white"
          />

          <button
            onClick={handleAddReview}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Adaugă review
          </button>
        </div>

        {/* COMMENTS */}
        <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
          Comentarii
        </h3>

        {recipe.comments?.length ? (
          recipe.comments.map((c, idx) => (
            <div
              key={idx}
              className="mb-2 p-2 border rounded bg-gray-100 dark:bg-zinc-800"
            >
              <p className="font-semibold">
                {c.userName} – {c.rating}/5
              </p>
              {c.text && (
                <p className="text-gray-700 dark:text-gray-300">{c.text}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Niciun comentariu încă.
          </p>
        )}
      </div>
    </div>
  );
}
