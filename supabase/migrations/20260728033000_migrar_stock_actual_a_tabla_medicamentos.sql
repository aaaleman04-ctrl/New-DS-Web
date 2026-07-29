-- ==============================================================================
-- MIGRACIÓN INDEPENDIENTE E IDEMPOTENTE:
-- Migrar Vista Estática stock_actual a Tabla Física public.medicamentos
-- Archivo: 20260728033000_migrar_stock_actual_a_tabla_medicamentos.sql
-- ==============================================================================

-- 1. Asegurar columnas tipo_recurso, stock_minimo, stock_actual y unidad_medida en public.medicamentos
ALTER TABLE public.medicamentos 
ADD COLUMN IF NOT EXISTS tipo_recurso text DEFAULT 'medicamento',
ADD COLUMN IF NOT EXISTS stock_minimo integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS stock_actual integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS unidad_medida text;

-- 2. Insertar/Actualizar los 17 recursos en la tabla física public.medicamentos con columnas exactas del esquema
INSERT INTO public.medicamentos (id, codigo, nombre, descripcion, stock_actual, unidad_medida, tipo_recurso, stock_minimo)
VALUES
  ('33333333-3333-3333-3333-000000000000', 'MED_AMOX_250', 'Amoxicilina Jarabe 250mg', 'Antibiótico suspensión infantil', 470, 'frascos', 'medicamento', 100),
  ('33333333-3333-3333-3333-111111111111', 'MED_IBU_400', 'Ibuprofeno 400mg', 'Analgésico y antiinflamatorio', 10850, 'tabletas', 'medicamento', 150),
  ('33333333-3333-3333-3333-222222222222', 'MED_AMOX_500', 'Amoxicilina 500mg', 'Antibiótico de amplio espectro', 13610, 'tabletas', 'medicamento', 200),
  ('33333333-3333-3333-3333-333333333333', 'MED_PARA_500', 'Paracetamol 500mg', 'Analgésico y antipirético', 20890, 'tabletas', 'medicamento', 10),
  ('33333333-3333-3333-3333-444444444444', 'MED_ENA_10', 'Enalapril 10mg', 'Antihipertensivo', 9430, 'tabletas', 'medicamento', 100),
  ('33333333-3333-3333-3333-555555555555', 'INS_RES_A2', 'Resina Dental A2', 'Material de restauración fotocurable', 9270, 'tubos', 'insumo_medico', 20),
  ('33333333-3333-3333-3333-666666666666', 'INS_ANE_2', 'Anestesia Dental 2%', 'Lidocaína con epinefrina', 9010, 'carpules', 'insumo_medico', 100),
  ('33333333-3333-3333-3333-777777777777', 'MED_VIT_AD', 'Vitaminas A y D', 'Suplemento vitamínico infantil', 16390, 'frascos', 'medicamento', 30),
  ('33333333-3333-3333-3333-888888888888', 'MED_LOR_10', 'Loratadina 10mg', 'Antihistamínico para alergias', 3300, 'tabletas', 'medicamento', 200),
  ('33333333-3333-3333-3333-999999999999', 'MED_ALB_400', 'Albendazol 400mg', 'Antiparasitario de dosis única', 1500, 'tabletas', 'medicamento', 100),
  ('33333333-3333-3333-3333-aaaaaaaaaaaa', 'MED_MET_850', 'Metformina 850mg', 'Hipoglucemiante oral para diabetes', 2000, 'tabletas', 'medicamento', 300),
  ('33333333-3333-3333-3333-bbbbbbbbbbbb', 'MED_SAL_INH', 'Salbutamol Inhalador', 'Broncodilatador para asma', 120, 'inhaladores', 'medicamento', 50),
  ('33333333-3333-3333-3333-cccccccccccc', 'MED_DIC_50', 'Diclofenaco 50mg', 'Antiinflamatorio no esteroideo', 2650, 'tabletas', 'medicamento', 250),
  ('33333333-3333-3333-3333-dddddddddddd', 'MED_CET_JAR', 'Cetirizina Jarabe', 'Antihistamínico pediátrico', 800, 'frascos', 'medicamento', 80),
  ('33333333-3333-3333-3333-eeeeeeeeeeee', 'MED_MET_500', 'Metronidazol 500mg', 'Antibiótico y antiparasitario', 4350, 'tabletas', 'medicamento', 150),
  ('33333333-3333-3333-3333-ffffffffffff', 'MED_ACE_JAR', 'Acetaminofén Jarabe', 'Analgésico y antipirético infantil', 1560, 'frascos', 'medicamento', 120),
  ('33333333-3333-3333-3333-121212121212', 'INS_FLU_BAR', 'Fluoruro de Sodio Barniz', 'Prevención de caries dental', 80, 'frascos', 'insumo_medico', 40)
ON CONFLICT (id) DO UPDATE SET
  codigo = EXCLUDED.codigo,
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  stock_actual = EXCLUDED.stock_actual,
  unidad_medida = EXCLUDED.unidad_medida,
  tipo_recurso = EXCLUDED.tipo_recurso,
  stock_minimo = EXCLUDED.stock_minimo;

-- 3. Crear lotes iniciales en public.lotes_medicamentos para cada recurso
INSERT INTO public.lotes_medicamentos (medicamento_id, numero_lote, cantidad_inicial, cantidad_actual, fecha_vencimiento, fabricante)
SELECT 
  id,
  'LOTE-INI-' || UPPER(SUBSTRING(nombre FROM 1 FOR 3)),
  stock_actual,
  stock_actual,
  CURRENT_DATE + INTERVAL '1 year',
  'Fundación DB'
FROM public.medicamentos
ON CONFLICT DO NOTHING;

-- 4. Reconstruir la vista stock_actual como consulta relacional limpia sobre public.medicamentos
CREATE OR REPLACE VIEW public.stock_actual AS
SELECT 
  m.id AS medicamento_id,
  m.nombre,
  m.descripcion,
  m.unidad_medida,
  m.stock_minimo,
  m.tipo_recurso,
  COALESCE(SUM(l.cantidad_actual), m.stock_actual) AS stock_total,
  CASE 
    WHEN COALESCE(SUM(l.cantidad_actual), m.stock_actual) <= 0 THEN 'Sin Existencias'
    WHEN COALESCE(SUM(l.cantidad_actual), m.stock_actual) <= m.stock_minimo THEN 'Stock Crítico'
    ELSE 'Normal'
  END AS estado_stock
FROM public.medicamentos m
LEFT JOIN public.lotes_medicamentos l ON l.medicamento_id = m.id
GROUP BY m.id, m.nombre, m.descripcion, m.unidad_medida, m.stock_minimo, m.tipo_recurso, m.stock_actual;

GRANT SELECT ON public.stock_actual TO authenticated;
