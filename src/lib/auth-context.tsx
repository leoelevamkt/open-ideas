import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/lib/types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

async function loadProfile(userId: string, fallbackEmail: string): Promise<User | null> {
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("id,name,email,avatar_label").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
  ]);
  if (!profile) return null;
  return {
    id: profile.id as string,
    name: (profile as any).name ?? fallbackEmail,
    email: (profile as any).email ?? fallbackEmail,
    role: ((roleRow as any)?.role ?? "cliente") as User["role"],
    avatar_label: (profile as any).avatar_label ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        const u = await loadProfile(data.session.user.id, data.session.user.email ?? "");
        if (mounted) setUser(u);
      }
      if (mounted) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) { setUser(null); return; }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        const u = await loadProfile(session.user.id, session.user.email ?? "");
        setUser(u);
      }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };
  const signUp: AuthCtx["signUp"] = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { name } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, name, email });
    }
    return {};
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
