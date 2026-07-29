-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 5 - MÓDULO CLÍNICO Y PACIENTES
-- Tablas alcanzadas: pacientes, signos_vitales, consultas, diagnosticos_consulta, medicamentos_consulta
-- =========================================================================

-- 1. Habilitar Row Level Security (RLS) en las 5 tablas del módulo Clínico
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signos_vitales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos_consulta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicamentos_consulta ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza preventiva de políticas previas sobre las tablas clínicas (si existieran)
DROP POLICY IF EXISTS "Panel read pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Clinico/Admin insert pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Clinico/Admin update pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Admin delete pacientes" ON public.pacientes;

DROP POLICY IF EXISTS "Panel read signos_vitales" ON public.signos_vitales;
DROP POLICY IF EXISTS "Clinico/Admin insert signos_vitales" ON public.signos_vitales;
DROP POLICY IF EXISTS "Clinico/Admin update signos_vitales" ON public.signos_vitales;
DROP POLICY IF EXISTS "Admin delete signos_vitales" ON public.signos_vitales;

DROP POLICY IF EXISTS "Panel read consultas" ON public.consultas;
DROP POLICY IF EXISTS "Clinico/Admin insert consultas" ON public.consultas;
DROP POLICY IF EXISTS "Clinico/Admin update consultas" ON public.consultas;
DROP POLICY IF EXISTS "Admin delete consultas" ON public.consultas;

DROP POLICY IF EXISTS "Panel read diagnosticos_consulta" ON public.diagnosticos_consulta;
DROP POLICY IF EXISTS "Clinico/Admin insert diagnosticos_consulta" ON public.diagnosticos_consulta;
DROP POLICY IF EXISTS "Clinico/Admin update diagnosticos_consulta" ON public.diagnosticos_consulta;
DROP POLICY IF EXISTS "Admin delete diagnosticos_consulta" ON public.diagnosticos_consulta;

DROP POLICY IF EXISTS "Panel read medicamentos_consulta" ON public.medicamentos_consulta;
DROP POLICY IF EXISTS "Clinico/Admin insert medicamentos_consulta" ON public.medicamentos_consulta;
DROP POLICY IF EXISTS "Clinico/Admin update medicamentos_consulta" ON public.medicamentos_consulta;
DROP POLICY IF EXISTS "Admin delete medicamentos_consulta" ON public.medicamentos_consulta;

-- =========================================================================
-- A. POLÍTICAS PARA TABLA: public.pacientes
-- =========================================================================

-- POLÍTICA A.1: Lectura de catálogo de pacientes para usuarios del panel (Coordinador, Clínica, Farmacia, Bodega, Admin)
CREATE POLICY "Panel read pacientes"
  ON public.pacientes FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA A.2: Creación de registro de paciente (Personal Clínico, Coordinador y Admin / PACIENTES_CREATE)
CREATE POLICY "Clinico/Admin insert pacientes"
  ON public.pacientes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA A.3: Actualización de datos demográficos de paciente (Personal Clínico, Coordinador y Admin / PACIENTES_UPDATE)
CREATE POLICY "Clinico/Admin update pacientes"
  ON public.pacientes FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA A.4: Eliminación de ficha de paciente (Exclusivo Admin / PACIENTES_DELETE)
CREATE POLICY "Admin delete pacientes"
  ON public.pacientes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- B. POLÍTICAS PARA TABLA: public.signos_vitales
-- =========================================================================

-- POLÍTICA B.1: Lectura de constantes vitales para usuarios del panel
CREATE POLICY "Panel read signos_vitales"
  ON public.signos_vitales FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA B.2: Registro de triaje y signos vitales (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin insert signos_vitales"
  ON public.signos_vitales FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA B.3: Edición de signos vitales (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin update signos_vitales"
  ON public.signos_vitales FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA B.4: Eliminación de registros de triaje (Exclusivo Admin)
CREATE POLICY "Admin delete signos_vitales"
  ON public.signos_vitales FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- C. POLÍTICAS PARA TABLA: public.consultas
-- =========================================================================

-- POLÍTICA C.1: Lectura de historial de consultas para usuarios del panel (Clínica, Farmacia, Coordinador, Admin)
CREATE POLICY "Panel read consultas"
  ON public.consultas FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA C.2: Creación de atención médica/odontológica (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin insert consultas"
  ON public.consultas FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA C.3: Edición de expediente de consulta (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin update consultas"
  ON public.consultas FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA C.4: Eliminación de expedientes de consulta (Exclusivo Admin)
CREATE POLICY "Admin delete consultas"
  ON public.consultas FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- D. POLÍTICAS PARA TABLA: public.diagnosticos_consulta
-- =========================================================================

-- POLÍTICA D.1: Lectura de diagnósticos para usuarios del panel
CREATE POLICY "Panel read diagnosticos_consulta"
  ON public.diagnosticos_consulta FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA D.2: Registro de diagnósticos médicos (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin insert diagnosticos_consulta"
  ON public.diagnosticos_consulta FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA D.3: Edición de diagnósticos (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin update diagnosticos_consulta"
  ON public.diagnosticos_consulta FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA D.4: Eliminación de diagnósticos (Exclusivo Admin)
CREATE POLICY "Admin delete diagnosticos_consulta"
  ON public.diagnosticos_consulta FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- E. POLÍTICAS PARA TABLA: public.medicamentos_consulta (Líneas de Receta Médica)
-- =========================================================================

-- POLÍTICA E.1: Lectura de medicamentos recetados (Requerido por Clínica, Farmacia para dispensar, Coord, Admin)
CREATE POLICY "Panel read medicamentos_consulta"
  ON public.medicamentos_consulta FOR SELECT
  TO authenticated
  USING (public.is_panel_user());

-- POLÍTICA E.2: Prescripción de medicamentos en receta (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin insert medicamentos_consulta"
  ON public.medicamentos_consulta FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA E.3: Modificación de líneas de receta (Personal Clínico, Coordinador y Admin)
CREATE POLICY "Clinico/Admin update medicamentos_consulta"
  ON public.medicamentos_consulta FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- POLÍTICA E.4: Eliminación de líneas de receta (Exclusivo Admin)
CREATE POLICY "Admin delete medicamentos_consulta"
  ON public.medicamentos_consulta FOR DELETE
  TO authenticated
  USING (public.is_admin());
