-- =========================================================================
-- MIGRACIÓN DE CATEGORÍAS DE INVENTARIO: Insumo y Material de Brigada
-- =========================================================================

INSERT INTO public.categorias_inventario (codigo, nombre, descripcion, activo)
VALUES 
  ('CAT-MED', 'Medicamento', 'Categoría para fármacos y medicamentos', true),
  ('CAT-INS', 'Insumo', 'Categoría para insumos médicos', true),
  ('CAT-MAT', 'Material de Brigada', 'Categoría para materiales y equipamiento de brigada', true)
ON CONFLICT (codigo) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo = true;
