-- =========================================================================
-- MIGRACIÓN DE ADAPTACIÓN AL NUEVO MODELO DE ROLES (RBAC) - FASE 2
-- =========================================================================

-- 1. Asegurar la existencia de todos los nuevos valores en el enum public.user_role
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'coordinador';
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'atencion_pacientes';
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'encargado_farmacia';
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'encargado_bodega';
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'voluntario';
    END IF;
END $$;

-- 2. Actualización de funciones SQL de verificación de roles con comparaciones
-- insensibles a mayúsculas/minúsculas (LOWER) sobre la tabla public.perfiles.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(COALESCE(rol::text, 'voluntario')) FROM public.perfiles WHERE id = auth.uid();
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
    FROM public.perfiles
    WHERE id = auth.uid()
      AND LOWER(COALESCE(rol::text, '')) = LOWER(COALESCE(required_role, ''))
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
    FROM public.perfiles
    WHERE id = auth.uid()
      AND LOWER(COALESCE(rol::text, '')) = ANY(
        SELECT LOWER(r) FROM unnest(required_roles) AS r
      )
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
  SELECT public.has_any_role(ARRAY['admin', 'atencion_pacientes']);
$$;

CREATE OR REPLACE FUNCTION public.is_panel_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(ARRAY[
    'admin',
    'coordinador',
    'atencion_pacientes',
    'encargado_farmacia',
    'encargado_bodega'
  ]);
$$;

-- Permisos de ejecución para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinical() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_panel_user() TO authenticated;

-- 3. Asignación inicial estricta de roles desde cero
-- A. El usuario aaaleman04@gmail.com se asigna ÚNICAMENTE como administrador
UPDATE public.perfiles
SET rol = 'admin'::public.user_role
WHERE id IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'aaaleman04@gmail.com'
);

-- B. Todos los demás usuarios registrados quedan asignados con el rol base 'voluntario'
UPDATE public.perfiles
SET rol = 'voluntario'::public.user_role
WHERE id NOT IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'aaaleman04@gmail.com'
);
