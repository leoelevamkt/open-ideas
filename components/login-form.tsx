"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { loginAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null)

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Acessar plataforma</CardTitle>
        <CardDescription>Entre com suas credenciais para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              defaultValue="advogado@portal.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              defaultValue="123456"
            />
          </div>

          {state?.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <SubmitButton />
        </form>

        <div className="mt-6 rounded-md border border-border bg-muted/50 p-4 text-sm">
          <p className="mb-2 font-medium text-foreground">Contas de demonstração</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Advogada:</span> advogado@portal.com
            </li>
            <li>
              <span className="font-medium text-foreground">Cliente:</span> cliente@portal.com
            </li>
            <li className="pt-1">
              Senha para ambas: <span className="font-mono text-foreground">123456</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
