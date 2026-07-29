-- =========================================================================
-- MIGRACIÓN: CREACIÓN DE VIEW v_resumen_financiero_mensual
-- Propósito: Reporte financiero sintetizado por período (mes y año)
-- consolidando ventas de apoyo y donaciones recibidas.
-- =========================================================================

CREATE OR REPLACE VIEW public.v_resumen_financiero_mensual WITH (security_invoker = true) AS
WITH periodos AS (
  SELECT DISTINCT 
    EXTRACT(YEAR FROM fecha::date)::INT AS anio,
    EXTRACT(MONTH FROM fecha::date)::INT AS mes
  FROM public.ventas
  WHERE fecha IS NOT NULL
  UNION
  SELECT DISTINCT 
    EXTRACT(YEAR FROM fecha_donacion::date)::INT AS anio,
    EXTRACT(MONTH FROM fecha_donacion::date)::INT AS mes
  FROM public.donaciones_ropa
  WHERE fecha_donacion IS NOT NULL
),
ventas_agg AS (
  SELECT 
    EXTRACT(YEAR FROM fecha::date)::INT AS anio,
    EXTRACT(MONTH FROM fecha::date)::INT AS mes,
    COUNT(id)::BIGINT AS cantidad_ventas,
    COALESCE(SUM(total), 0)::NUMERIC AS total_ventas
  FROM public.ventas
  WHERE fecha IS NOT NULL
  GROUP BY 1, 2
),
donaciones_agg AS (
  SELECT 
    EXTRACT(YEAR FROM fecha_donacion::date)::INT AS anio,
    EXTRACT(MONTH FROM fecha_donacion::date)::INT AS mes,
    COUNT(id)::BIGINT AS cantidad_donaciones,
    COALESCE(SUM(cantidad_prendas * 100), 0)::NUMERIC AS total_donaciones
  FROM public.donaciones_ropa
  WHERE fecha_donacion IS NOT NULL
  GROUP BY 1, 2
)
SELECT 
  p.anio,
  p.mes,
  COALESCE(v.total_ventas, 0)::NUMERIC AS total_ventas,
  COALESCE(d.total_donaciones, 0)::NUMERIC AS total_donaciones,
  COALESCE(v.cantidad_ventas, 0)::BIGINT AS cantidad_ventas,
  COALESCE(d.cantidad_donaciones, 0)::BIGINT AS cantidad_donaciones,
  (COALESCE(v.total_ventas, 0) + COALESCE(d.total_donaciones, 0))::NUMERIC AS total_general
FROM periodos p
LEFT JOIN ventas_agg v ON p.anio = v.anio AND p.mes = v.mes
LEFT JOIN donaciones_agg d ON p.anio = d.anio AND p.mes = d.mes;

GRANT SELECT ON public.v_resumen_financiero_mensual TO authenticated;
GRANT SELECT ON public.v_resumen_financiero_mensual TO anon;
