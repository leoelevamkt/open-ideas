
-- Tabela de dados bancários do escritório (single-row config)
CREATE TABLE public.bank_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text, agency text, account text, account_type text,
  holder text, document text,
  pix_key text, pix_type text,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bank_info TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bank_info TO authenticated;
GRANT ALL ON public.bank_info TO service_role;
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bank_info readable by all" ON public.bank_info FOR SELECT USING (true);
CREATE POLICY "bank_info advogado manages" ON public.bank_info FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));

-- Boletos / faturas
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  barcode text, payment_link text, pix_copy_paste text, notes text,
  paid_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices advogado full" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'advogado')) WITH CHECK (public.has_role(auth.uid(), 'advogado'));
CREATE POLICY "invoices cliente sees own" ON public.invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = invoices.client_id AND c.user_id = auth.uid()));
CREATE POLICY "invoices cliente mark paid" ON public.invoices FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = invoices.client_id AND c.user_id = auth.uid()));

-- Seed de bank_info (uma linha vazia se não houver)
INSERT INTO public.bank_info (bank_name, holder) VALUES ('Banco do Brasil', 'Guimarães & Guedes Advogados Associados');
