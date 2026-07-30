-- Corrección del dashboard_actividades para evitar duplicados en el count al hacer JOIN

CREATE OR REPLACE VIEW public.dashboard_actividades AS
WITH stats AS (
  SELECT
    (SELECT COUNT(DISTINCT id) FROM public.actividades_infantiles) AS actividades,
    (SELECT COALESCE(SUM(cantidad_ninos), 0) FROM public.participantes_actividad) AS ninos_beneficiados
)
SELECT actividades, ninos_beneficiados FROM stats;

GRANT SELECT ON public.dashboard_actividades TO authenticated;
GRANT SELECT ON public.dashboard_actividades TO anon;
