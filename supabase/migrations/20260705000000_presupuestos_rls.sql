-- Añadir políticas RLS para la tabla presupuestos_brigada

ALTER TABLE public.presupuestos_brigada ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Panel read presupuestos_brigada" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin insert presupuestos_brigada" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin update presupuestos_brigada" ON public.presupuestos_brigada;
DROP POLICY IF EXISTS "Admin delete presupuestos_brigada" ON public.presupuestos_brigada;

CREATE POLICY "Panel read presupuestos_brigada"
  ON public.presupuestos_brigada FOR SELECT TO authenticated
  USING (public.is_panel_user());

CREATE POLICY "Admin insert presupuestos_brigada"
  ON public.presupuestos_brigada FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update presupuestos_brigada"
  ON public.presupuestos_brigada FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete presupuestos_brigada"
  ON public.presupuestos_brigada FOR DELETE TO authenticated
  USING (public.is_admin());
