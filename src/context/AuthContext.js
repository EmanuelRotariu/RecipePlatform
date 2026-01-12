import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        setFavorites([]); // aici poți încărca din Firestore
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addFavorite = (recipeId) => {
    setFavorites((prev) => [...prev, recipeId]);
  };

  const removeFavorite = (recipeId) => {
    setFavorites((prev) => prev.filter((id) => id !== recipeId));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, favorites, addFavorite, removeFavorite }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
