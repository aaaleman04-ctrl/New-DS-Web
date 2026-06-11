-- Roles y permisos: user_roles + funciones helper + RLS
-- Primer admin manual (SQL Editor con service role):
-- INSERT INTO public.user_roles (user_id, role) VALUES ('<auth.users.uuid>', 'admin');

-- ── Tabla de roles (un rol por usuario) ──

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'staff', 'medico', 'odontologo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ── Funciones helper (SECURITY DEFINER evita recursión en RLS) ──

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(required_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY(required_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin');
$$;

CREATE OR REPLACE FUNCTION public.is_clinical()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(ARRAY['medico', 'odontologo']);
$$;

CREATE OR REPLACE FUNCTION public.is_panel_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(ARRAY['admin', 'staff', 'medico', 'odontologo']);
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinical() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_panel_user() TO authenticated;

DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin delete roles" ON public.user_roles;

CREATE POLICY "Users read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Brigadas ──

DROP POLICY IF EXISTS "Admin insert brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Admin update brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Admin delete brigadas" ON public.brigadas;

CREATE POLICY "Admin insert brigadas"
  ON public.brigadas FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update brigadas"
  ON public.brigadas FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete brigadas"
  ON public.brigadas FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Voluntarios ──

DROP POLICY IF EXISTS "Panel read voluntarios" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin update voluntarios" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin delete voluntarios" ON public.voluntarios;

CREATE POLICY "Panel read voluntarios"
  ON public.voluntarios FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'staff']));

CREATE POLICY "Admin update voluntarios"
  ON public.voluntarios FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete voluntarios"
  ON public.voluntarios FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Contacto ──

DROP POLICY IF EXISTS "Panel read contacto" ON public.contacto;
DROP POLICY IF EXISTS "Admin update contacto" ON public.contacto;
DROP POLICY IF EXISTS "Admin delete contacto" ON public.contacto;

CREATE POLICY "Panel read contacto"
  ON public.contacto FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'staff']));

CREATE POLICY "Admin update contacto"
  ON public.contacto FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete contacto"
  ON public.contacto FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Medicamentos (inventario / farmacia) ──

CREATE TABLE IF NOT EXISTS public.medicamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  cantidad integer NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  unidad text,
  brigada_id text REFERENCES public.brigadas(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Panel read medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin insert medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin update medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin delete medicamentos" ON public.medicamentos;

CREATE POLICY "Panel read medicamentos"
  ON public.medicamentos FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'staff', 'medico', 'odontologo']));

CREATE POLICY "Admin insert medicamentos"
  ON public.medicamentos FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update medicamentos"
  ON public.medicamentos FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete medicamentos"
  ON public.medicamentos FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Atenciones (estadísticas simples, sin EMR) ──

CREATE TABLE IF NOT EXISTS public.atenciones_pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brigada_id text NOT NULL REFERENCES public.brigadas(id) ON DELETE CASCADE,
  atendido_por uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_atencion text NOT NULL CHECK (tipo_atencion IN ('medico', 'odontologo')),
  cantidad integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atenciones_brigada ON public.atenciones_pacientes(brigada_id);
CREATE INDEX IF NOT EXISTS idx_atenciones_atendido_por ON public.atenciones_pacientes(atendido_por);

ALTER TABLE public.atenciones_pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinical insert own atenciones" ON public.atenciones_pacientes;
DROP POLICY IF EXISTS "Clinical read own atenciones" ON public.atenciones_pacientes;
DROP POLICY IF EXISTS "Staff admin read all atenciones" ON public.atenciones_pacientes;
DROP POLICY IF EXISTS "Admin delete atenciones" ON public.atenciones_pacientes;

CREATE POLICY "Clinical insert own atenciones"
  ON public.atenciones_pacientes FOR INSERT TO authenticated
  WITH CHECK (
    atendido_por = auth.uid()
    AND public.is_clinical()
    AND (
      (tipo_atencion = 'medico' AND public.has_role('medico'))
      OR (tipo_atencion = 'odontologo' AND public.has_role('odontologo'))
    )
  );

CREATE POLICY "Clinical read own atenciones"
  ON public.atenciones_pacientes FOR SELECT TO authenticated
  USING (atendido_por = auth.uid() AND public.is_clinical());

CREATE POLICY "Staff admin read all atenciones"
  ON public.atenciones_pacientes FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'staff']));

CREATE POLICY "Admin delete atenciones"
  ON public.atenciones_pacientes FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── Storage: fotos de brigadas (solo admin escribe) ──

DROP POLICY IF EXISTS "Admin upload brigada photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin update brigada photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete brigada photos" ON storage.objects;

CREATE POLICY "Admin upload brigada photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brigadas' AND public.is_admin());

CREATE POLICY "Admin update brigada photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'brigadas' AND public.is_admin())
  WITH CHECK (bucket_id = 'brigadas' AND public.is_admin());

CREATE POLICY "Admin delete brigada photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brigadas' AND public.is_admin());
