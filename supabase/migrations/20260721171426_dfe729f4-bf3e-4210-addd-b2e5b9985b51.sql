
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS size_bytes bigint;

-- Storage policies on the private "documents" bucket
CREATE POLICY "Advogados gerenciam arquivos de documentos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'advogado'::public.app_role))
WITH CHECK (bucket_id = 'documents' AND public.has_role(auth.uid(), 'advogado'::public.app_role));

CREATE POLICY "Clientes leem arquivos de seus documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.documents d
    JOIN public.clients c ON c.id = d.client_id
    WHERE d.file_path = storage.objects.name
      AND c.user_id = auth.uid()
  )
);
