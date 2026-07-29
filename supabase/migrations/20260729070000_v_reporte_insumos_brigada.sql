-- =========================================================================
-- MIGRACIÓN: CREACIÓN DE VIEW v_reporte_insumos_brigada
-- Propósito: Reporte sintetizado por brigada con total de medicamentos,
-- prendas de ropa y juguetes entregados.
-- =========================================================================

CREATE OR REPLACE VIEW public.v_reporte_insumos_brigada WITH (security_invoker = true) AS
SELECT 
  b.id AS brigada_id,
  b.nombre AS brigada_nombre,
  b.fecha_brigada AS fecha,
  b.lugar AS comunidad,
  COALESCE(med.total_medicamentos, 0)::BIGINT AS total_medicamentos,
  COALESCE(rop.total_ropa, 0)::BIGINT AS total_ropa,
  COALESCE(jug.total_juguetes, 0)::BIGINT AS total_juguetes,
  (COALESCE(med.total_medicamentos, 0) + COALESCE(rop.total_ropa, 0) + COALESCE(jug.total_juguetes, 0))::BIGINT AS total_general
FROM public.brigadas b
LEFT JOIN (
  SELECT 
    c.brigada_id,
    SUM(ef.cantidad) AS total_medicamentos
  FROM public.entregas_farmacia ef
  JOIN public.consultas c ON ef.consulta_id = c.id
  GROUP BY c.brigada_id
) med ON med.brigada_id = b.id
LEFT JOIN (
  SELECT 
    er.brigada_id,
    SUM(er.cantidad_prendas) AS total_ropa
  FROM public.entregas_ropa er
  GROUP BY er.brigada_id
) rop ON rop.brigada_id = b.id
LEFT JOIN (
  SELECT 
    ai.brigada_id,
    SUM(ai.cantidad_regalos) AS total_juguetes
  FROM public.actividades_infantiles ai
  GROUP BY ai.brigada_id
) jug ON jug.brigada_id = b.id;

GRANT SELECT ON public.v_reporte_insumos_brigada TO authenticated;
GRANT SELECT ON public.v_reporte_insumos_brigada TO anon;
