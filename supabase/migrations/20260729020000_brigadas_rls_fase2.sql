-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 2 - MÓDULO DE BRIGADAS
-- Tablas alcanzadas: brigadas, brigada_imagenes, presupuestos_brigada, gastos_brigada
-- =========================================================================

-- 1. Habilitar Row Level Security (RLS) en las 4 tablas del módulo Brigadas
ALTER TABLE public.brigadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brigada_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos_brigada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_brigada ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza preventiva de políticas obsoletas o previas en el módulo
DROP POLICY IF EXISTS "Admin insert brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Admin update brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Admin delete brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Panel read brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Coordinador/Admin insert brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Coordinador/Admin update brigadas" ON public.brigadas;
DROP POLICY IF EXISTS "Admin delete brigadas" ON public.brigadas;

DROP POLICY IF EXISTS "Panel read brigada_imagenes" ON public.brigada_imagenes;
DROP POLICY IF EXISTS "Coordinador/Admin insert brigada_imagenes" ON public.brigada_imagenes;
DROP POLICY IF EXISTS "Coordinador/Admin update brigada_imagenes" ON public.brigada_imagenes;
DROP POLICY IF EXISTS "Coordinador/Admin delete brigada_imagenes" ON public.brigada_imagenes;

DROP POLICY IF EXISTS "Staff/Admin read presupuestos" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin insert presupuestos" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin update presupuestos" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin delete presupuestos" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Panel read presupuestos_brigada" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Coordinador/Admin insert presupuestos_brigada" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Coordinador/Admin update presupuestos_brigada" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin delete presupuestos_brigada" ON public.presupuestos_brigada;

DROP POLICY IF EXISTS "Panel read gastos_brigada" ON public.gastos_brigada;
DROP POLICY IF EXISTS "Coordinador/Admin insert gastos_brigada" ON public.gastos_brigada;
DROP POLICY IF EXISTS "Coordinador/Admin update gastos_brigada" ON public.gastos_brigada;
DROP POLICY IF EXISTS "Coordinador/Admin delete gastos_brigada" ON public.gastos_brigada;

-- =========================================================================
-- A. POLÍTICAS PARA TABLA: public.brigadas
-- =========================================================================

-- POLÍTICA A.1: Lectura de brigadas para usuarios del panel (Coordinador, Clínica, Farmacia, Bodega, Admin)
CREATE POLICY "Panel read brigadas"
  ON public.brigadas FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA A.2: Creación de brigadas (Coordinador y Admin según matriz RBAC / BRIGADAS_CREATE)
CREATE POLICY "Coordinador/Admin insert brigadas"
  ON public.brigadas FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA A.3: Actualización de brigadas (Coordinador y Admin según matriz RBAC / BRIGADAS_UPDATE)
CREATE POLICY "Coordinador/Admin update brigadas"
  ON public.brigadas FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA A.4: Eliminación de brigadas (Coordinador y Admin según matriz RBAC / BRIGADAS_DELETE)
CREATE POLICY "Coordinador/Admin delete brigadas"
  ON public.brigadas FOR DELETE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']));

-- =========================================================================
-- B. POLÍTICAS PARA TABLA: public.brigada_imagenes
-- =========================================================================

-- POLÍTICA B.1: Lectura de galería de imágenes para usuarios del panel
CREATE POLICY "Panel read brigada_imagenes"
  ON public.brigada_imagenes FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA B.2: Subida de imágenes / metadatos de galería (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin insert brigada_imagenes"
  ON public.brigada_imagenes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA B.3: Actualización de metadatos/portada/orden (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin update brigada_imagenes"
  ON public.brigada_imagenes FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA B.4: Eliminación de imágenes (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin delete brigada_imagenes"
  ON public.brigada_imagenes FOR DELETE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']));

-- =========================================================================
-- C. POLÍTICAS PARA TABLA: public.presupuestos_brigada
-- =========================================================================

-- POLÍTICA C.1: Lectura de presupuestos para usuarios del panel
CREATE POLICY "Panel read presupuestos_brigada"
  ON public.presupuestos_brigada FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA C.2: Creación de presupuestos estimados (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin insert presupuestos_brigada"
  ON public.presupuestos_brigada FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA C.3: Actualización de presupuestos estimados (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin update presupuestos_brigada"
  ON public.presupuestos_brigada FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA C.4: Eliminación de registros de presupuesto (Exclusivo Admin)
CREATE POLICY "Admin delete presupuestos_brigada"
  ON public.presupuestos_brigada FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- D. POLÍTICAS PARA TABLA: public.gastos_brigada
-- =========================================================================

-- POLÍTICA D.1: Lectura de gastos de brigada para usuarios del panel
CREATE POLICY "Panel read gastos_brigada"
  ON public.gastos_brigada FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA D.2: Registro de desembolsos / gastos (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin insert gastos_brigada"
  ON public.gastos_brigada FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA D.3: Edición de gastos (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin update gastos_brigada"
  ON public.gastos_brigada FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));

-- POLÍTICA D.4: Eliminación de gastos de brigada (Coordinador y Admin)
CREATE POLICY "Coordinador/Admin delete gastos_brigada"
  ON public.gastos_brigada FOR DELETE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador']));
