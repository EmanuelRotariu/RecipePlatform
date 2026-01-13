import { useAuth } from "@/context/AuthContext"; /* Importăm contextul pentru a verifica dacă utilizatorul este logat */
import { useEffect } from "react"; /* Importăm hook-ul pentru a executa logica de redirecționare */
import { useRouter } from "next/router"; /* Importăm router-ul pentru a trimite utilizatorul la pagina de login */

export default function withAuth(Component) {
  return function AuthWrapped(props) {
    const { user, loading } = useAuth(); /* Extragem starea utilizatorului și starea de încărcare din context */
    const router = useRouter(); /* Inițializăm router-ul */

    useEffect(() => {
      /* Dacă procesul de verificare s-a terminat și nu avem un utilizator logat... */
      if (!loading && !user) {
        router.push("/login"); /* ...îl redirecționăm automat către pagina de autentificare */
      }
    }, [loading, user]); /* Re-executăm verificarea ori de câte ori se schimbă starea user-ului sau a loading-ului */
    /* În timp ce verificăm sau dacă utilizatorul nu este logat, afișăm un mesaj temporar */
    if (loading || !user) return <p className="text-center mt-10">Se verifică autentificarea...</p>;

    /* Dacă totul este în regulă, afișăm componenta/pagina originală cu toate proprietățile sale */
    return <Component {...props} />;
  };
}
