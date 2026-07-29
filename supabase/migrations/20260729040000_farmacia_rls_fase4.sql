-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 4 - MÓDULO DE FARMACIA
-- Tablas alcanzadas: entregas_farmacia
-- =========================================================================

-- 1. Habilitar Row Level Security (RLS) en la tabla del módulo Farmacia
ALTER TABLE public.entregas_farmacia ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza preventiva de políticas previas sobre public.entregas_farmacia (si existieran)
DROP POLICY IF EXISTS "Panel read entregas_farmacia" ON public.entregas_farmacia;
DROP POLICY IF EXISTS "Farmacia/Clinica/Admin insert entregas_farmacia" ON public.entregas_farmacia;
DROP POLICY IF EXISTS "Admin update entregas_farmacia" ON public.entregas_farmacia;
DROP POLICY IF EXISTS "Admin delete entregas_farmacia" ON public.entregas_farmacia;

-- =========================================================================
-- POLÍTICAS PARA TABLA: public.entregas_farmacia (Estrategia Append-Only para Histórico de Dispensación)
-- =========================================================================

-- POLÍTICA 1: Lectura del historial de dispensación para usuarios del panel
CREATE POLICY "Panel read entregas_farmacia"
  ON public.entregas_farmacia FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA 2: Registro de entregas físicas de recetas en ventanilla (Encargado de Farmacia, Atención Pacientes y Admin)
CREATE POLICY "Farmacia/Clinica/Admin insert entregas_farmacia"
  ON public.entregas_farmacia FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'encargado_farmacia', 'atencion_pacientes']));

-- POLÍTICA 3: Eliminación de registros de entregas (Exclusivo Admin para correcciones auditadas)
CREATE POLICY "Admin delete entregas_farmacia"
  ON public.entregas_farmacia FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- NOTA DE AUDITORÍA (Append-Only): No se crea ninguna política de UPDATE sobre public.entregas_farmacia.
-- Esto garantiza la inmutabilidad del historial de dispensación física en ventanilla.
