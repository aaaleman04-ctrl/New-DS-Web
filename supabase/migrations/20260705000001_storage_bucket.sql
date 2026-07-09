-- Crear el bucket de storage si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('brigadas', 'brigadas', true)
ON CONFLICT (id) DO NOTHING;

-- Asegurar políticas para subir, actualizar, eliminar y ver las fotos
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin upload brigada photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin update brigada photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete brigada photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read brigada photos" ON storage.objects;

-- Cualquier persona puede ver las fotos (son públicas en el sitio web)
CREATE POLICY "Public read brigada photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brigadas');

-- Solo administradores pueden subir fotos
CREATE POLICY "Admin upload brigada photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brigadas' AND public.is_admin());

-- Solo administradores pueden actualizar fotos
CREATE POLICY "Admin update brigada photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'brigadas' AND public.is_admin())
  WITH CHECK (bucket_id = 'brigadas' AND public.is_admin());

-- Solo administradores pueden eliminar fotos
CREATE POLICY "Admin delete brigada photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brigadas' AND public.is_admin());
