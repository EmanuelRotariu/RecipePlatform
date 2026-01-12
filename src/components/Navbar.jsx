import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-black dark:text-white">
        Recipe Platform
      </div>

      <div className="flex gap-4 items-center">
        <Link href="/" className="text-black dark:text-white hover:underline">
          Home
        </Link>

        {user && (
          <>
            <Link
              href="/dashboard"
              className="text-black dark:text-white hover:underline"
            >
              Dashboard
            </Link>

            <Link
              href="/favorites"
              className="text-black dark:text-white hover:underline"
            >
              Favorites
            </Link>
          </>
        )}

        {!loading && !user && (
          <>
            <Link
              href="/login"
              className="text-black dark:text-white hover:underline"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-black dark:text-white hover:underline"
            >
              Register
            </Link>
          </>
        )}

        {!loading && user && (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
