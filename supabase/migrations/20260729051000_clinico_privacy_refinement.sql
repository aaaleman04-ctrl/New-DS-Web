-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 5.1 - REFINAMIENTO DE PRIVACIDAD EN MÓDULO CLÍNICO
-- Reforzamiento del principio de mínimo privilegio en consultas, diagnosticos_consulta y signos_vitales
-- =========================================================================

-- 1. REFINAMIENTO EN TABLA: public.consultas
-- Permite lectura a: admin, coordinador, atencion_pacientes y encargado_farmacia.
-- Excluye a: encargado_bodega (que no procesa recetas clínicas).
DROP POLICY IF EXISTS "Panel read consultas" ON public.consultas;

CREATE POLICY "Clinico/Farmacia read consultas"
  ON public.consultas FOR SELECT
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes', 'encargado_farmacia']));

-- 2. REFINAMIENTO EN TABLA: public.diagnosticos_consulta
-- Permite lectura exclusivamente a: admin, coordinador y atencion_pacientes.
-- Excluye a: encargado_farmacia y encargado_bodega.
DROP POLICY IF EXISTS "Panel read diagnosticos_consulta" ON public.diagnosticos_consulta;

CREATE POLICY "Clinico read diagnosticos_consulta"
  ON public.diagnosticos_consulta FOR SELECT
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));

-- 3. REFINAMIENTO EN TABLA: public.signos_vitales
-- Permite lectura exclusivamente a: admin, coordinador y atencion_pacientes.
-- Excluye a: encargado_farmacia y encargado_bodega.
DROP POLICY IF EXISTS "Panel read signos_vitales" ON public.signos_vitales;

CREATE POLICY "Clinico read signos_vitales"
  ON public.signos_vitales FOR SELECT
  TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));
