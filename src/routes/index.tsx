import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { SplashScreen } from "@/components/splash-screen";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (session) navigate({ to: "/dashboard" });
      else navigate({ to: "/auth" });
    }, 1200);
    return () => clearTimeout(t);
  }, [loading, session, navigate]);

  return <SplashScreen />;
}
