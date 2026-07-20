export type Role = "advogado" | "cliente";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_label: string | null;
};

export type Client = {
  id: string;
  user_id: string | null;
  full_name: string;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: "ativo" | "arquivado";
  created_at: string;
};

export type Case = {
  id: string;
  number: string;
  title: string;
  action_type: string | null;
  legal_area: string | null;
  court: string | null;
  court_division: string | null;
  district: string | null;
  plaintiff: string | null;
  defendant: string | null;
  status: string;
  lawyer_name: string | null;
  description: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
};

export type TimelineEvent = {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  event_date: string;
  responsible: string | null;
  created_at: string;
};

export type Hearing = {
  id: string;
  title: string;
  case_id: string | null;
  client_id: string | null;
  hearing_date: string;
  hearing_time: string | null;
  type: "Presencial" | "Online" | "Híbrida";
  location: string | null;
  link: string | null;
  notes: string | null;
  created_at: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  category: string;
  uploaded_by: string | null;
  client_id: string | null;
  case_id: string | null;
  status: "disponivel" | "pendente";
  size_label: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  read: boolean;
  created_at: string;
};
