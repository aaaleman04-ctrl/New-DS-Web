-- =========================================================================
-- MIGRACIÓN: CREACIÓN DE VIEW v_resumen_brigadas_anual
-- Propósito: Reporte sintetizado anual de impacto de brigadas realizadas,
-- comunidades atendidas y pacientes registrados.
-- =========================================================================

CREATE OR REPLACE VIEW public.v_resumen_brigadas_anual WITH (security_invoker = true) AS
WITH brigadas_anual AS (
  SELECT 
    EXTRACT(YEAR FROM fecha_brigada::date)::INT AS anio,
    COUNT(DISTINCT id)::BIGINT AS cantidad_brigadas,
    COUNT(DISTINCT COALESCE(NULLIF(TRIM(municipio), ''), NULLIF(TRIM(lugar), ''), 'Sin Comunidad'))::BIGINT AS cantidad_comunidades
  FROM public.brigadas
  WHERE fecha_brigada IS NOT NULL
  GROUP BY 1
),
pacientes_anual AS (
  SELECT 
    EXTRACT(YEAR FROM b.fecha_brigada::date)::INT AS anio,
    COUNT(p.id)::BIGINT AS cantidad_pacientes
  FROM public.pacientes p
  JOIN public.brigadas b ON p.brigada_id = b.id
  WHERE b.fecha_brigada IS NOT NULL
  GROUP BY 1
)
SELECT 
  ba.anio,
  COALESCE(ba.cantidad_brigadas, 0)::BIGINT AS total_brigadas,
  COALESCE(ba.cantidad_comunidades, 0)::BIGINT AS comunidades_atendidas,
  COALESCE(pa.cantidad_pacientes, 0)::BIGINT AS total_pacientes,
  CASE 
    WHEN COALESCE(ba.cantidad_brigadas, 0) > 0 THEN 
      ROUND((COALESCE(pa.cantidad_pacientes, 0)::NUMERIC / ba.cantidad_brigadas::NUMERIC), 1)
    ELSE 0 
  END::NUMERIC AS promedio_pacientes_por_brigada
FROM brigadas_anual ba
LEFT JOIN pacientes_anual pa ON ba.anio = pa.anio;

GRANT SELECT ON public.v_resumen_brigadas_anual TO authenticated;
GRANT SELECT ON public.v_resumen_brigadas_anual TO anon;
