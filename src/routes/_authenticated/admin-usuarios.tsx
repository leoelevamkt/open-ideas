import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, UserPlus, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "advogado" | "cliente";
  created_at: string;
  last_sign_in_at: string | null;
};

export const Route = createFileRoute("/_authenticated/admin-usuarios")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    const { data: role } = await supabase
      .from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "advogado").maybeSingle();
    if (!role) throw redirect({ to: "/dashboard" });
  },
  component: AdminUsersPage,
});

async function callAdmin(body: any) {
  const { data: s } = await supabase.auth.getSession();
  const token = s.session?.access_token;
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

function AdminUsersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await callAdmin({ action: "list" })).users as AdminUser[],
  });

  const del = useMutation({
    mutationFn: async (id: string) => callAdmin({ action: "delete", user_id: id }),
    onSuccess: () => { toast.success("Usuário removido"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <PageHero title="Gestão de Usuários" subtitle="Crie, edite e remova usuários administradores e clientes do portal." />
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)} className="gap-2">
              <UserPlus className="size-4" /> Novo usuário
            </Button>
          </DialogTrigger>
          <UserFormDialog
            editing={editing}
            onClose={() => { setOpen(false); setEditing(null); }}
            onSaved={() => qc.invalidateQueries({ queryKey: ["admin-users"] })}
          />
        </Dialog>
      </div>


      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
        ) : (
          (data ?? []).map((u) => (
            <Card key={u.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{u.name}</p>
                  <Badge variant={u.role === "advogado" ? "default" : "secondary"} className="capitalize">
                    {u.role}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                <p className="text-xs text-muted-foreground">
                  Último acesso: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("pt-BR") : "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(u); setOpen(true); }}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="sm" variant="destructive"
                  onClick={() => { if (confirm(`Remover ${u.name}?`)) del.mutate(u.id); }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function UserFormDialog({
  editing, onClose, onSaved,
}: { editing: AdminUser | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"advogado" | "cliente">("cliente");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(editing?.name ?? "");
    setEmail(editing?.email ?? "");
    setPassword("");
    setRole(editing?.role ?? "cliente");
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await callAdmin({
          action: "update", user_id: editing.id,
          name, email, role,
          ...(password ? { password } : {}),
        });
        toast.success("Usuário atualizado");
      } else {
        if (!password || password.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres");
        await callAdmin({ action: "create", name, email, password, role });
        toast.success("Usuário criado");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar");
    } finally { setSaving(false); }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>{editing ? "Nova senha (opcional)" : "Senha"}</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={editing ? "Deixe vazio para manter" : "Mínimo 6 caracteres"} />
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de acesso</Label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="advogado">Advogado (Admin)</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
