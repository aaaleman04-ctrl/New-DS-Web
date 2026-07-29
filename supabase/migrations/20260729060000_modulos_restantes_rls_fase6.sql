-- =========================================================================
-- MIGRACIÓN DE RLS: FASE 6 - MÓDULOS RESTANTES (COBERTURA TOTAL DEL ESQUEMA)
-- Alcance: Voluntariado, Donaciones, Ventas, Actividades Infantiles y Mensajería/Contacto
-- =========================================================================

-- 1. Habilitar Row Level Security (RLS) en todas las tablas pendientes
ALTER TABLE public.voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participaciones_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.donaciones_ropa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_ropa ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.actividades_infantiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_actividad ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contacto ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza preventiva de políticas obsoletas/heredadas en tablas pendientes
DROP POLICY IF EXISTS "Panel read voluntarios" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin update voluntarios" ON public.voluntarios;
DROP POLICY IF EXISTS "Admin delete voluntarios" ON public.voluntarios;

DROP POLICY IF EXISTS "Panel read contacto" ON public.contacto;
DROP POLICY IF EXISTS "Admin update contacto" ON public.contacto;
DROP POLICY IF EXISTS "Admin delete contacto" ON public.contacto;

-- =========================================================================
-- A. MÓDULO DE VOLUNTARIADO (voluntarios, inscripciones, asignaciones, participaciones, especialidades)
-- =========================================================================

-- --- A.1 Tabla: public.voluntarios (Formulario general / catálogo de voluntarios) ---
CREATE POLICY "Public insert voluntarios" ON public.voluntarios FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Panel read voluntarios" ON public.voluntarios FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin update voluntarios" ON public.voluntarios FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete voluntarios" ON public.voluntarios FOR DELETE TO authenticated USING (public.is_admin());

-- --- A.2 Tabla: public.inscripciones_voluntarios (Solicitudes de inscripción pública a brigadas) ---
CREATE POLICY "Public insert inscripciones_voluntarios" ON public.inscripciones_voluntarios FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Panel read inscripciones_voluntarios" ON public.inscripciones_voluntarios FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin update inscripciones_voluntarios" ON public.inscripciones_voluntarios FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete inscripciones_voluntarios" ON public.inscripciones_voluntarios FOR DELETE TO authenticated USING (public.is_admin());

-- --- A.3 Tabla: public.asignaciones_voluntarios (Asignación de áreas en brigadas) ---
CREATE POLICY "Panel read asignaciones_voluntarios" ON public.asignaciones_voluntarios FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin insert asignaciones_voluntarios" ON public.asignaciones_voluntarios FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update asignaciones_voluntarios" ON public.asignaciones_voluntarios FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin delete asignaciones_voluntarios" ON public.asignaciones_voluntarios FOR DELETE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador']));

-- --- A.4 Tabla: public.participaciones_voluntarios (Bitácora física de asistencia) ---
CREATE POLICY "Panel read participaciones_voluntarios" ON public.participaciones_voluntarios FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin insert participaciones_voluntarios" ON public.participaciones_voluntarios FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update participaciones_voluntarios" ON public.participaciones_voluntarios FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete participaciones_voluntarios" ON public.participaciones_voluntarios FOR DELETE TO authenticated USING (public.is_admin());

-- --- A.5 Tabla: public.especialidades (Catálogo de profesiones/especialidades) ---
CREATE POLICY "Public/Panel read especialidades" ON public.especialidades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Coordinador/Admin insert especialidades" ON public.especialidades FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update especialidades" ON public.especialidades FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete especialidades" ON public.especialidades FOR DELETE TO authenticated USING (public.is_admin());

-- =========================================================================
-- B. MÓDULO DE DONACIONES DE ROPA (donaciones_ropa, entregas_ropa)
-- =========================================================================

-- --- B.1 Tabla: public.donaciones_ropa ---
CREATE POLICY "Panel read donaciones_ropa" ON public.donaciones_ropa FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Panel insert donaciones_ropa" ON public.donaciones_ropa FOR INSERT TO authenticated WITH CHECK (public.is_panel_user());
CREATE POLICY "Coordinador/Admin update donaciones_ropa" ON public.donaciones_ropa FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete donaciones_ropa" ON public.donaciones_ropa FOR DELETE TO authenticated USING (public.is_admin());

-- --- B.2 Tabla: public.entregas_ropa ---
CREATE POLICY "Panel read entregas_ropa" ON public.entregas_ropa FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Panel insert entregas_ropa" ON public.entregas_ropa FOR INSERT TO authenticated WITH CHECK (public.is_panel_user());
CREATE POLICY "Coordinador/Admin update entregas_ropa" ON public.entregas_ropa FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete entregas_ropa" ON public.entregas_ropa FOR DELETE TO authenticated USING (public.is_admin());

-- =========================================================================
-- C. MÓDULO DE VENTAS Y PRESUPUESTOS (categorias_productos, productos, ventas, detalle_ventas)
-- =========================================================================

-- --- C.1 Tabla: public.categorias_productos ---
CREATE POLICY "Panel read categorias_productos" ON public.categorias_productos FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin insert categorias_productos" ON public.categorias_productos FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update categorias_productos" ON public.categorias_productos FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete categorias_productos" ON public.categorias_productos FOR DELETE TO authenticated USING (public.is_admin());

-- --- C.2 Tabla: public.productos ---
CREATE POLICY "Panel read productos" ON public.productos FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin insert productos" ON public.productos FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update productos" ON public.productos FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete productos" ON public.productos FOR DELETE TO authenticated USING (public.is_admin());

-- --- C.3 Tabla: public.ventas ---
CREATE POLICY "Panel read ventas" ON public.ventas FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin insert ventas" ON public.ventas FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update ventas" ON public.ventas FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete ventas" ON public.ventas FOR DELETE TO authenticated USING (public.is_admin());

-- --- C.4 Tabla: public.detalle_ventas ---
CREATE POLICY "Panel read detalle_ventas" ON public.detalle_ventas FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin insert detalle_ventas" ON public.detalle_ventas FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Coordinador/Admin update detalle_ventas" ON public.detalle_ventas FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete detalle_ventas" ON public.detalle_ventas FOR DELETE TO authenticated USING (public.is_admin());

-- =========================================================================
-- D. MÓDULO DE ACTIVIDADES INFANTILES (actividades_infantiles, participantes_actividad)
-- =========================================================================

-- --- D.1 Tabla: public.actividades_infantiles ---
CREATE POLICY "Panel read actividades_infantiles" ON public.actividades_infantiles FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Clinico/Coordinador/Admin insert actividades_infantiles" ON public.actividades_infantiles FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));
CREATE POLICY "Clinico/Coordinador/Admin update actividades_infantiles" ON public.actividades_infantiles FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));
CREATE POLICY "Admin delete actividades_infantiles" ON public.actividades_infantiles FOR DELETE TO authenticated USING (public.is_admin());

-- --- D.2 Tabla: public.participantes_actividad ---
CREATE POLICY "Panel read participantes_actividad" ON public.participantes_actividad FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Clinico/Coordinador/Admin insert participantes_actividad" ON public.participantes_actividad FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));
CREATE POLICY "Clinico/Coordinador/Admin update participantes_actividad" ON public.participantes_actividad FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador', 'atencion_pacientes']));
CREATE POLICY "Admin delete participantes_actividad" ON public.participantes_actividad FOR DELETE TO authenticated USING (public.is_admin());

-- =========================================================================
-- E. MÓDULO DE MENSAJERÍA Y CONTACTO (contacto)
-- =========================================================================

-- --- E.1 Tabla: public.contacto ---
CREATE POLICY "Public insert contacto" ON public.contacto FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Panel read contacto" ON public.contacto FOR SELECT TO authenticated USING (public.is_panel_user());
CREATE POLICY "Coordinador/Admin update contacto" ON public.contacto FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['admin', 'coordinador'])) WITH CHECK (public.has_any_role(ARRAY['admin', 'coordinador']));
CREATE POLICY "Admin delete contacto" ON public.contacto FOR DELETE TO authenticated USING (public.is_admin());
