import { createContext, useContext, useEffect, useState } from "react"; /* Importăm uneltele React pentru context și stări */
import { auth } from "@/lib/firebase"; /* Importăm instanța Firebase Auth configurată în proiect */
import { onAuthStateChanged } from "firebase/auth"; /* Funcția Firebase care ascultă schimbările de stare (login/logout) */

/* Creăm contextul de autentificare cu o valoare inițială nulă */
const AuthContext = createContext(null);

/* Provider-ul este componenta care "împachetează" întreaga aplicație pentru a oferi acces la date */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); /* Starea pentru obiectul de utilizator de la Firebase */
  const [loading, setLoading] = useState(true); /* Stare pentru a știi dacă Firebase a terminat verificarea sesiunii */
  const [favorites, setFavorites] = useState([]); /* O stare locală pentru a gestiona ID-urile rețetelor favorite */

  useEffect(() => {
    /* onAuthStateChanged rulează automat când aplicația pornește și ori de câte ori utilizatorul se loghează sau se deloghează */
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); /* Setăm utilizatorul (va fi obiectul de user sau null) */
      setLoading(false); /* Odată ce am primit răspuns de la Firebase, marcăm încărcarea ca finalizată */

      if (currentUser) {
        setFavorites([]); /* Dacă utilizatorul este logat, aici se pot încărca inițial favoritele din Firestore */
      } else {
        /* Dacă utilizatorul se deloghează, resetăm lista de favorite */
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  /* Funcție pentru a adăuga un ID de rețetă în lista locală de favorite */
  const addFavorite = (recipeId) => {
    setFavorites((prev) => [...prev, recipeId]);
  };
  /* Funcție pentru a elimina un ID de rețetă din lista locală de favorite */
  const removeFavorite = (recipeId) => {
    setFavorites((prev) => prev.filter((id) => id !== recipeId));
  };

  return (
    /* Pasăm valorile prin Provider pentru a fi accesibile în orice componentă (Navbar, Dashboard, etc.) */
    <AuthContext.Provider
      value={{ user, loading, favorites, addFavorite, removeFavorite }}
    >
      {children} 
    </AuthContext.Provider> /* Aici va fi randată restul aplicației (vezi _app.js) */
  );
};
/* Hook personalizat pentru a consuma mai ușor contextul în componente */
export const useAuth = () => useContext(AuthContext);
