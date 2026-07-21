
-- 1. Add new enum value
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'estagiario';

-- 2. Function that returns true if the user has staff read access (advogado or estagiario).
-- Uses text comparison to avoid same-transaction enum literal restriction.
CREATE OR REPLACE FUNCTION public.has_staff_read(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('advogado','estagiario')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_staff_read(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_staff_read(uuid) TO authenticated, service_role;

-- 3. Read policies for estagiario (advogado already covered by *_lawyer_all)
CREATE POLICY "clients_staff_select" ON public.clients
  FOR SELECT TO authenticated
  USING (public.has_staff_read(auth.uid()));

CREATE POLICY "cases_staff_select" ON public.cases
  FOR SELECT TO authenticated
  USING (public.has_staff_read(auth.uid()));

CREATE POLICY "hearings_staff_select" ON public.hearings
  FOR SELECT TO authenticated
  USING (public.has_staff_read(auth.uid()));

CREATE POLICY "documents_staff_select" ON public.documents
  FOR SELECT TO authenticated
  USING (public.has_staff_read(auth.uid()));

CREATE POLICY "timeline_staff_select" ON public.timeline_events
  FOR SELECT TO authenticated
  USING (public.has_staff_read(auth.uid()));

CREATE POLICY "profiles_staff_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_staff_read(auth.uid()));

-- No policies added for invoices, bank_info → estagiario cannot see financeiro.
