-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 3 - MÓDULO DE INVENTARIO
-- Tablas alcanzadas: categorias_inventario, medicamentos, lotes_medicamentos, movimientos_inventario
-- =========================================================================

-- 1. Habilitar Row Level Security (RLS) en las 4 tablas del módulo Inventario
ALTER TABLE public.categorias_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza preventiva de políticas previas sobre las 4 tablas
DROP POLICY IF EXISTS "Panel read categorias_inventario" ON public.categorias_inventario;
DROP POLICY IF EXISTS "Encargado/Admin insert categorias_inventario" ON public.categorias_inventario;
DROP POLICY IF EXISTS "Encargado/Admin update categorias_inventario" ON public.categorias_inventario;
DROP POLICY IF EXISTS "Admin delete categorias_inventario" ON public.categorias_inventario;

DROP POLICY IF EXISTS "Panel read medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin insert medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin update medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin delete medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Encargado/Admin insert medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Encargado/Admin update medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Admin delete medicamentos" ON public.medicamentos;

DROP POLICY IF EXISTS "Panel read lotes" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Panel insert lotes" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Panel update lotes" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Admin delete lotes" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Panel read lotes_medicamentos" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Encargado/Admin insert lotes_medicamentos" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Encargado/Farmacia/Admin update lotes_medicamentos" ON public.lotes_medicamentos;
DROP POLICY IF EXISTS "Admin delete lotes_medicamentos" ON public.lotes_medicamentos;

DROP POLICY IF EXISTS "Panel insert movimientos_inventario" ON public.movimientos_inventario;
DROP POLICY IF EXISTS "Panel read movimientos_inventario" ON public.movimientos_inventario;
DROP POLICY IF EXISTS "Admin delete movimientos_inventario" ON public.movimientos_inventario;

-- =========================================================================
-- A. POLÍTICAS PARA TABLA: public.categorias_inventario
-- =========================================================================

-- POLÍTICA A.1: Lectura de categorías para usuarios del panel
CREATE POLICY "Panel read categorias_inventario"
  ON public.categorias_inventario FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA A.2: Creación de categorías de inventario (Encargado de Bodega y Admin)
CREATE POLICY "Encargado/Admin insert categorias_inventario"
  ON public.categorias_inventario FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_bodega']));

-- POLÍTICA A.3: Actualización de categorías de inventario (Encargado de Bodega y Admin)
CREATE POLICY "Encargado/Admin update categorias_inventario"
  ON public.categorias_inventario FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'encargado_bodega']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_bodega']));

-- POLÍTICA A.4: Eliminación de categorías (Exclusivo Admin)
CREATE POLICY "Admin delete categorias_inventario"
  ON public.categorias_inventario FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- B. POLÍTICAS PARA TABLA: public.medicamentos
-- Soluciona la inconsistencia del Capítulo 20: permite actualizar a Bodega y Farmacia
-- =========================================================================

-- POLÍTICA B.1: Lectura de medicamentos para usuarios del panel (Atención Pacientes, Farmacia, Bodega, Coord, Admin)
CREATE POLICY "Panel read medicamentos"
  ON public.medicamentos FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA B.2: Creación de medicamentos e insumos (Encargado de Bodega y Admin / INVENTARIO_CREATE)
CREATE POLICY "Encargado/Admin insert medicamentos"
  ON public.medicamentos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_bodega']));

-- POLÍTICA B.3: Actualización de medicamentos y stock (Bodega, Farmacia y Admin)
CREATE POLICY "Encargado/Admin update medicamentos"
  ON public.medicamentos FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'encargado_bodega', 'encargado_farmacia']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_bodega', 'encargado_farmacia']));

-- POLÍTICA B.4: Eliminación de medicamentos (Exclusivo Admin / INVENTARIO_DELETE)
CREATE POLICY "Admin delete medicamentos"
  ON public.medicamentos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- C. POLÍTICAS PARA TABLA: public.lotes_medicamentos
-- =========================================================================

-- POLÍTICA C.1: Lectura de lotes por vencer / existencia para usuarios del panel
CREATE POLICY "Panel read lotes_medicamentos"
  ON public.lotes_medicamentos FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA C.2: Creación de nuevos lotes con fecha de vencimiento (Encargado de Bodega y Admin)
CREATE POLICY "Encargado/Admin insert lotes_medicamentos"
  ON public.lotes_medicamentos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_bodega']));

-- POLÍTICA C.3: Actualización y deducción de lotes FEFO (Bodega, Farmacia y Admin)
CREATE POLICY "Encargado/Farmacia/Admin update lotes_medicamentos"
  ON public.lotes_medicamentos FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'encargado_bodega', 'encargado_farmacia']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_bodega', 'encargado_farmacia']));

-- POLÍTICA C.4: Eliminación de lotes (Exclusivo Admin)
CREATE POLICY "Admin delete lotes_medicamentos"
  ON public.lotes_medicamentos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- D. POLÍTICAS PARA TABLA: public.movimientos_inventario (Append-Only / Trazabilidad)
-- =========================================================================

-- POLÍTICA D.1: Lectura de Kárdex y bitácora de movimientos para usuarios del panel
CREATE POLICY "Panel read movimientos_inventario"
  ON public.movimientos_inventario FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA D.2: Registro (INSERT) de entradas/salidas en Kárdex (Bodega, Farmacia, Coord, Admin)
CREATE POLICY "Panel insert movimientos_inventario"
  ON public.movimientos_inventario FOR INSERT
  TO authenticated
  WITH CHECK (public.is_panel_user());

-- POLÍTICA D.3: Eliminación de registros de auditoría Kárdex (Exclusivo Admin para mantenimiento estricto)
CREATE POLICY "Admin delete movimientos_inventario"
  ON public.movimientos_inventario FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- NOTA DE AUDITORÍA (Append-Only): No se crea ninguna política de UPDATE sobre public.movimientos_inventario.
-- Esto garantiza que las transacciones de Kárdex sean inmutables para preservar la trazabilidad física.
