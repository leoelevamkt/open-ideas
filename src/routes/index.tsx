import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SplashScreen } from "@/components/splash-screen";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      navigate({ to: data.session ? "/dashboard" : "/auth" });
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigate]);
  return <SplashScreen />;
}
