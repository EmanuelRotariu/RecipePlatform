import { useState } from "react"; /* Hook pentru stare */
import { useRouter } from "next/router"; /* Hook pentru navigare */
import { signInWithEmailAndPassword } from "firebase/auth"; /* Funcția Firebase pentru logare */
import { auth } from "../lib/firebase"; /* Instanța Firebase */

export default function Login() {
  const [email, setEmail] = useState(""); /* Stare email */
  const [password, setPassword] = useState(""); /* Stare parolă */
  const [error, setError] = useState(""); /* Stare eroare */
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); /* Stop refresh pagină */
    setError(""); /* Reset eroare */

    if (!email || !password) {
      setError("Email și parola sunt obligatorii.");
      return;
    }

    try {
      /* Încercăm autentificarea utilizatorului */
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); /* Redirecționare la dashboard în caz de succes */
    } catch (err) {
      setError(err.message); /* Afișăm eroarea (ex: utilizator negăsit) */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}