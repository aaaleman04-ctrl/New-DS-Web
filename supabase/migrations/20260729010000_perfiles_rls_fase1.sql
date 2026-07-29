-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 1 - MÓDULO DE USUARIOS (TABLA public.perfiles)
-- =========================================================================

-- 1. Habilitar Row Level Security (RLS) exclusivamente para public.perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza preventiva de políticas previas sobre public.perfiles (si existieran)
DROP POLICY IF EXISTS "Permitir lectura de propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Permitir actualizacion de propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Panel read all perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Admin full control perfiles" ON public.perfiles;

-- 3. Definición de Políticas RLS centradas en el modelo RBAC oficial

-- POLÍTICA 1: Lectura del propio perfil (Cualquier usuario autenticado puede leer su propia fila)
CREATE POLICY "Permitir lectura de propio perfil"
  ON public.perfiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- POLÍTICA 2: Lectura de perfiles para usuarios autenticados del panel (Coordinador, Clínica, Farmacia, Bodega, Admin)
-- Permite listar usuarios/voluntarios y mostrar nombres/médicos en recetas, brigadas, asignaciones y consultas
CREATE POLICY "Panel read all perfiles"
  ON public.perfiles FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA 3: Actualización del propio perfil (Edición personal de datos de contacto/avatar)
CREATE POLICY "Permitir actualizacion de propio perfil"
  ON public.perfiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- POLÍTICA 4: Control total para el rol Administrador (Insertar nuevos perfiles, actualizar cualquier perfil, cambiar roles/estado)
CREATE POLICY "Admin full control perfiles"
  ON public.perfiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
