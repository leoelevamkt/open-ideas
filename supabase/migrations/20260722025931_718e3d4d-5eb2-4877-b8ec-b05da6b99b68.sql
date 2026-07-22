
CREATE POLICY "Clientes leem anexos de boletos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.clients c ON c.id = i.client_id
    WHERE i.file_path = storage.objects.name
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Estagiarios leem arquivos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND public.has_staff_read(auth.uid())
);
