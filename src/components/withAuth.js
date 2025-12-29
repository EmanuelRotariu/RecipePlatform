import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function withAuth(Component) {
  return function AuthWrapped(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login"); // redirecționează dacă nu e logat
      }
    }, [loading, user]);

    if (loading || !user) return <p className="text-center mt-10">Se verifică autentificarea...</p>;

    return <Component {...props} />;
  };
}
