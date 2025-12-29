import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Într-un proiect real aici am încărca favorite din Firestore
      if (currentUser) {
        setFavorites([]); // placeholder
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addFavorite = (recipeId) => {
    setFavorites(prev => [...prev, recipeId]);
  };

  const removeFavorite = (recipeId) => {
    setFavorites(prev => prev.filter(id => id !== recipeId));
  };

  return (
    <AuthContext.Provider value={{ user, loading, favorites, addFavorite, removeFavorite }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
