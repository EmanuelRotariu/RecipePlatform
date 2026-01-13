import { useState } from "react"; /* Importăm hook-ul pentru gestionarea stării locale */
import { useRouter } from "next/router"; /* Importăm router-ul pentru a putea redirecționa utilizatorul */
import { createUserWithEmailAndPassword } from "firebase/auth"; /* Funcția Firebase pentru crearea utilizatorului */
import { auth } from "../lib/firebase"; /* Importăm instanța de autentificare configurată anterior */

export default function Register() {
  const [email, setEmail] = useState(""); /* Starea pentru stocarea adresei de email introduse */
  const [password, setPassword] = useState(""); /* Starea pentru stocarea parolei introduse */
  const [error, setError] = useState(""); /* Starea pentru capturarea și afișarea eventualelor erori */
  const router = useRouter(); /* Inițializăm router-ul Next.js */

  const handleSubmit = async (e) => {
    e.preventDefault(); /* Prevenim reîncărcarea paginii la trimiterea formularului */
    setError(""); /* Resetăm eroarea înainte de o nouă încercare */

    if (!email || !password) { /* Verificare de bază pentru câmpuri goale */
      setError("Email și parola sunt obligatorii."); /* Setăm mesaj de eroare dacă lipsesc date */
      return; /* Oprim execuția funcției */
    }

    try {
      /* Apelăm Firebase pentru a crea contul cu email și parolă */
      await createUserWithEmailAndPassword(auth, email, password); 
      router.push("/login"); /* Dacă reușește, trimitem utilizatorul la pagina de autentificare */
    } catch (err) {
      setError(err.message); /* Dacă apare o eroare (ex: parola prea scurtă), o salvăm în stare */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100"> {/* Container centrat pe tot ecranul */}
      <form
        onSubmit={handleSubmit} /* Legăm funcția de tratare la evenimentul de submit */
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Register</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>} {/* Afișăm eroarea doar dacă există */}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          value={email} /* Valoarea input-ului este legată de starea email */
          onChange={(e) => setEmail(e.target.value)} /* Actualizăm starea la fiecare tasta apăsată */
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
          value={password} /* Valoarea input-ului este legată de starea password */
          onChange={(e) => setPassword(e.target.value)} /* Actualizăm starea parolei */
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Create Account
        </button>
      </form>
    </div>
  );
}