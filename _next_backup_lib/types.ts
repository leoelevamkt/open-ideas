export type Role = "advogado" | "cliente"

export type User = {
  id: number
  name: string
  email: string
  role: Role
  avatar_label: string | null
}

export type Client = {
  id: number
  user_id: number | null
  full_name: string
  cpf: string | null
  rg: string | null
  birth_date: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  notes: string | null
  status: "ativo" | "arquivado"
  created_at: string
}

export type Case = {
  id: number
  number: string
  title: string
  action_type: string | null
  legal_area: string | null
  court: string | null
  court_division: string | null
  district: string | null
  plaintiff: string | null
  defendant: string | null
  status: string
  lawyer_name: string | null
  description: string | null
  client_id: number | null
  created_at: string
  updated_at: string
}

export type TimelineEvent = {
  id: number
  case_id: number
  title: string
  description: string | null
  event_date: string
  responsible: string | null
  created_at: string
}

export type Hearing = {
  id: number
  title: string
  case_id: number | null
  client_id: number | null
  hearing_date: string
  hearing_time: string | null
  type: "Presencial" | "Online" | "Híbrida"
  location: string | null
  link: string | null
  notes: string | null
  created_at: string
}

export type DocumentItem = {
  id: number
  name: string
  category: string
  uploaded_by: number | null
  client_id: number | null
  case_id: number | null
  status: "disponivel" | "pendente"
  size_label: string | null
  created_at: string
}

export type Message = {
  id: number
  sender_id: number
  recipient_id: number
  body: string
  read: number
  created_at: string
}

export type Notification = {
  id: number
  user_id: number
  title: string
  description: string | null
  type: string
  read: number
  created_at: string
}

export type BankInfo = {
  id: number
  bank_name: string | null
  agency: string | null
  account: string | null
  account_type: string | null
  holder: string | null
  document: string | null
  pix_key: string | null
  pix_type: string | null
  notes: string | null
  updated_at: string
}

export type Invoice = {
  id: number
  client_id: number
  case_id: number | null
  description: string
  amount: number | string
  due_date: string
  status: "pendente" | "pago" | "vencido" | "cancelado"
  barcode: string | null
  payment_link: string | null
  pix_copy_paste: string | null
  notes: string | null
  paid_at: string | null
  created_by: number | null
  created_at: string
}

export const INVOICE_STATUSES = ["pendente", "pago", "cancelado"] as const

export const PIX_KEY_TYPES = ["CPF", "CNPJ", "E-mail", "Telefone", "Aleatória"] as const

export const CASE_STATUSES = [
  "Em Análise",
  "Protocolado",
  "Em Andamento",
  "Audiência Marcada",
  "Aguardando Decisão",
  "Sentenciado",
  "Arquivado",
  "Finalizado",
] as const

export const DOCUMENT_CATEGORIES = [
  "Contratos",
  "Procurações",
  "Petições",
  "Sentenças",
  "Laudos",
  "Comprovantes",
  "Documentos Pessoais",
  "Outros",
] as const

export const HEARING_TYPES = ["Presencial", "Online", "Híbrida"] as const

export const LEGAL_AREAS = [
  "Trabalhista",
  "Cível",
  "Família",
  "Criminal",
  "Tributário",
  "Empresarial",
  "Previdenciário",
  "Consumidor",
] as const
