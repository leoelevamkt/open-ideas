"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"
import type { Client } from "@/lib/types"

interface ProfileFormProps {
  userData?: {
    name: string
    email: string
  }
  clientData?: {
    cpf?: string | null
    rg?: string | null
    birthDate?: string | null
    phone?: string | null
    whatsapp?: string | null
    address?: string | null
    notes?: string | null
  }
  role: string
}

export function ProfileForm({ userData, clientData: initialClientData, role }: ProfileFormProps) {
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [personalData, setPersonalData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
  })
  const [clientData, setClientData] = useState(
    initialClientData
      ? {
          cpf: initialClientData.cpf || "",
          rg: initialClientData.rg || "",
          birthDate: initialClientData.birthDate || "",
          phone: initialClientData.phone || "",
          whatsapp: initialClientData.whatsapp || "",
          address: initialClientData.address || "",
          notes: initialClientData.notes || "",
        }
      : {}
  )
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    processUpdates: true,
    hearings: true,
    documents: true,
    messages: true,
    statusChanges: true,
  })

  return (
    <Tabs defaultValue="pessoal" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="senha">Segurança</TabsTrigger>
        <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
      </TabsList>

      <TabsContent value="pessoal" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações de contato e dados cadastrais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do usuário */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={personalData.name}
                  onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                  disabled={!editingPersonal}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  disabled={!editingPersonal}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Dados do cliente (se aplicável) */}
            {role === "cliente" && (
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Dados Cadastrais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF/CNPJ</Label>
                    <Input
                      id="cpf"
                      value={(clientData as any).cpf || ""}
                      onChange={(e) => setClientData({ ...clientData, cpf: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={(clientData as any).rg || ""}
                      onChange={(e) => setClientData({ ...clientData, rg: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={(clientData as any).birthDate || ""}
                      onChange={(e) => setClientData({ ...clientData, birthDate: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={(clientData as any).phone || ""}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={(clientData as any).whatsapp || ""}
                      onChange={(e) => setClientData({ ...clientData, whatsapp: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={(clientData as any).address || ""}
                      onChange={(e) => setClientData({ ...clientData, address: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={(clientData as any).notes || ""}
                      onChange={(e) => setClientData({ ...clientData, notes: e.target.value } as any)}
                      disabled={!editingPersonal}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!editingPersonal ? (
                <Button onClick={() => setEditingPersonal(true)}>Editar Informações</Button>
              ) : (
                <>
                  <Button onClick={() => setEditingPersonal(false)}>Salvar Alterações</Button>
                  <Button variant="outline" onClick={() => setEditingPersonal(false)}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="senha" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Atualize sua senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current">Senha Atual</Label>
              <Input
                id="current"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                disabled={!editingPassword}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="new">Nova Senha</Label>
              <Input
                id="new"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                disabled={!editingPassword}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar Senha</Label>
              <Input
                id="confirm"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                disabled={!editingPassword}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              {!editingPassword ? (
                <Button onClick={() => setEditingPassword(true)}>Alterar Senha</Button>
              ) : (
                <>
                  <Button onClick={() => setEditingPassword(false)}>Atualizar Senha</Button>
                  <Button variant="outline" onClick={() => setEditingPassword(false)}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notificacoes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Notificações</CardTitle>
            <CardDescription>Escolha quais notificações você deseja receber.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "processUpdates", label: "Movimentações Processuais", desc: "Receba avisos sobre atualizações em seus processos" },
              { key: "hearings", label: "Audiências Agendadas", desc: "Notificações sobre novas audiências" },
              { key: "documents", label: "Documentos Enviados", desc: "Avisos quando documentos forem compartilhados" },
              { key: "messages", label: "Novas Mensagens", desc: "Notificações de mensagens do advogado" },
              { key: "statusChanges", label: "Alterações de Status", desc: "Avisos quando o status do processo mudar" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start space-x-3">
                <Checkbox
                  checked={(notifications as any)[key]}
                  onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, [key]: checked } as any)}
                  id={key}
                />
                <div className="flex-1">
                  <label htmlFor={key} className="font-medium cursor-pointer">
                    {label}
                  </label>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
            <Button className="mt-6">Salvar Preferências</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
