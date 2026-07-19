import { cookies } from "next/headers"
import { queryOne } from "@/lib/db"
import type { User } from "@/lib/types"

const SESSION_COOKIE = "portal_session"

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies()
  const userId = store.get(SESSION_COOKIE)?.value
  if (!userId) return null
  return queryOne<User>(
    "SELECT id, name, email, role, avatar_label FROM users WHERE id = $1",
    [Number(userId)],
  )
}

export async function createSession(userId: number) {
  const store = await cookies()
  store.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  return queryOne<User>(
    "SELECT id, name, email, role, avatar_label FROM users WHERE email = $1 AND password = $2",
    [email, password],
  )
}
