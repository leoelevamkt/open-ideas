import { neon } from "@neondatabase/serverless"

// Cliente HTTP do Neon (Postgres). Reutilizado entre hot-reloads do Next.js.
declare global {
  // eslint-disable-next-line no-var
  var __portalSql: ReturnType<typeof neon> | undefined
}

function getConnectionString() {
  // A integração Neon pode expor a string de conexão sob diferentes nomes.
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL
  )
}

function getSql() {
  if (!global.__portalSql) {
    const connectionString = getConnectionString()
    if (!connectionString) {
      throw new Error("A string de conexão do Neon não está definida. Conecte a integração Neon ao projeto.")
    }
    global.__portalSql = neon(connectionString)
  }
  return global.__portalSql
}

/**
 * Executa uma query parametrizada (placeholders $1, $2, ...) e retorna as linhas.
 * As linhas já são objetos planos, seguros para Server Components.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const sql = getSql()
  const rows = (await sql.query(text, params)) as T[]
  return rows
}

/** Executa uma query e retorna a primeira linha (ou null). */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}
