
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('advogado', 'cliente');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security-definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  birth_date TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  action_type TEXT,
  legal_area TEXT,
  court TEXT,
  court_division TEXT,
  district TEXT,
  plaintiff TEXT,
  defendant TEXT,
  status TEXT NOT NULL DEFAULT 'Em Análise',
  lawyer_name TEXT,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Timeline events
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  responsible TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Hearings
CREATE TABLE public.hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  hearing_date TEXT NOT NULL,
  hearing_time TEXT,
  type TEXT NOT NULL DEFAULT 'Presencial',
  location TEXT,
  link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hearings TO authenticated;
GRANT ALL ON public.hearings TO service_role;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Outros',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'disponivel',
  size_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'geral',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_label)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 2))
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cliente');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== RLS POLICIES ==============

-- profiles: user reads/updates own; lawyer reads all
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_select_lawyer" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles: user reads own, lawyer reads all
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles_select_lawyer" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'advogado'));

-- clients: lawyer full, client reads own record
CREATE POLICY "clients_lawyer_all" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "clients_self_select" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- cases: lawyer full, client sees own cases
CREATE POLICY "cases_lawyer_all" ON public.cases FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "cases_client_select" ON public.cases FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
);

-- timeline_events: lawyer full, client sees for their cases
CREATE POLICY "timeline_lawyer_all" ON public.timeline_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "timeline_client_select" ON public.timeline_events FOR SELECT TO authenticated USING (
  case_id IN (SELECT c.id FROM public.cases c JOIN public.clients cl ON cl.id = c.client_id WHERE cl.user_id = auth.uid())
);

-- hearings: lawyer full, client sees for their cases
CREATE POLICY "hearings_lawyer_all" ON public.hearings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "hearings_client_select" ON public.hearings FOR SELECT TO authenticated USING (
  case_id IN (SELECT c.id FROM public.cases c JOIN public.clients cl ON cl.id = c.client_id WHERE cl.user_id = auth.uid())
);

-- documents: lawyer full, client sees own, client can upload own
CREATE POLICY "documents_lawyer_all" ON public.documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "documents_client_select" ON public.documents FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
);
CREATE POLICY "documents_client_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (
  uploaded_by = auth.uid()
);

-- messages: sender or recipient
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT TO authenticated USING (auth.uid() IN (sender_id, recipient_id));
CREATE POLICY "messages_insert_self" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_recipient" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

-- notifications: user reads/updates own
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_insert_lawyer" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'advogado'));
