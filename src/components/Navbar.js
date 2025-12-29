import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-black dark:text-white">
        Recipe Platform
      </div>
      <div className="flex gap-4">
        {/* Eliminăm tag-ul <a> și punem clasele direct pe Link */}
        <Link href="/" className="text-black dark:text-white hover:underline">
          Home
        </Link>
        <Link href="/dashboard" className="text-black dark:text-white hover:underline">
          Dashboard
        </Link>
        <Link href="/favorites" className="text-black dark:text-white hover:underline">
          Favorites
        </Link>
      </div>
    </nav>
  );
}