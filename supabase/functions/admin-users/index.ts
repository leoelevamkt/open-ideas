import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AppRole = "advogado" | "cliente" | "estagiario";

type Action =
  | { action: "list" }
  | { action: "create"; email: string; password: string; name: string; role: AppRole }
  | { action: "update"; user_id: string; name?: string; email?: string; password?: string; role?: AppRole }
  | { action: "delete"; user_id: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const admin = createClient(url, service);
  const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "advogado").maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let body: Action;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400, headers: corsHeaders }); }

  try {
    if (body.action === "list") {
      const { data: usersList, error } = await admin.auth.admin.listUsers({ perPage: 200 });
      if (error) throw error;
      const ids = usersList.users.map((u) => u.id);
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        admin.from("profiles").select("id,name,email,avatar_label").in("id", ids),
        admin.from("user_roles").select("user_id,role").in("user_id", ids),
      ]);
      const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const rMap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
      const users = usersList.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        name: pMap.get(u.id)?.name ?? u.email,
        role: rMap.get(u.id) ?? "cliente",
      }));
      return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "create") {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { name: body.name, role: body.role },
      });
      if (error) throw error;
      const uid = created.user!.id;
      await admin.from("profiles").upsert({ id: uid, name: body.name, email: body.email, avatar_label: body.name.slice(0, 2).toUpperCase() });
      await admin.from("user_roles").delete().eq("user_id", uid);
      await admin.from("user_roles").insert({ user_id: uid, role: body.role });
      return new Response(JSON.stringify({ ok: true, id: uid }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "update") {
      const updates: any = {};
      if (body.email) updates.email = body.email;
      if (body.password) updates.password = body.password;
      if (Object.keys(updates).length) {
        const { error } = await admin.auth.admin.updateUserById(body.user_id, updates);
        if (error) throw error;
      }
      const profilePatch: any = {};
      if (body.name) profilePatch.name = body.name;
      if (body.email) profilePatch.email = body.email;
      if (Object.keys(profilePatch).length) {
        await admin.from("profiles").update(profilePatch).eq("id", body.user_id);
      }
      if (body.role) {
        await admin.from("user_roles").delete().eq("user_id", body.user_id);
        await admin.from("user_roles").insert({ user_id: body.user_id, role: body.role });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "delete") {
      if (body.user_id === userData.user.id) {
        return new Response(JSON.stringify({ error: "Você não pode remover a si mesmo" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { error } = await admin.auth.admin.deleteUser(body.user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Erro" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
