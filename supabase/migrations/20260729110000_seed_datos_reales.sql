-- ============================================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA REALISTAS (SEED DATA)
-- Fundación Dibujando Sonrisas — Honduras
-- ============================================================================

-- 1. Insertar o verificar Especialidades
INSERT INTO public.especialidades (id, nombre, codigo) VALUES
  ('11111111-1111-4111-a111-111111111111', 'Medicina General', 'MEDICINA_GENERAL'),
  ('22222222-2222-4222-a222-222222222222', 'Odontología', 'ODONTOLOGIA'),
  ('33333333-3333-4333-a333-333333333333', 'Farmacia y Fármacos', 'FARMACIA'),
  ('44444444-4444-4444-a444-444444444444', 'Bodega e Inventario', 'BODEGA'),
  ('55555555-5555-4555-a555-555555555555', 'Donaciones de Ropa', 'ROPA'),
  ('66666666-6666-4666-a666-666666666666', 'Actividades Infantiles', 'INFANTIL'),
  ('77777777-7777-4777-a777-777777777777', 'Ventas de Apoyo', 'VENTAS'),
  ('88888888-8888-4888-a888-888888888888', 'Logística y Coordinación', 'LOGISTICA')
ON CONFLICT (nombre) DO UPDATE SET codigo = EXCLUDED.codigo;

-- 2. Insertar Brigadas Médicas Operativas en Honduras
INSERT INTO public.brigadas (id, nombre, lugar, fecha_brigada, departamento, municipio, estado, observaciones) VALUES
  ('b1111111-1111-4111-a111-111111111111', 'Brigada Médica y Odontológica El Paraíso 2026', 'Comunidad El Paraíso', '2026-02-15', 'El Paraíso', 'Danlí', 'Programada', 'Brigada integral con atención médica primaria, pediatría y odontología preventiva.'),
  ('b2222222-2222-4222-a222-222222222222', 'Brigada de Salud Integral Comayagua 2026', 'Aldea San José de la Mora', '2026-01-20', 'Comayagua', 'Comayagua', 'Completada', 'Atención prestada a más de 180 familias rurales.'),
  ('b3333333-3333-4333-a333-333333333333', 'Brigada Nutricional y Comunitaria Santa Bárbara', 'Caserío La Esperanza', '2025-11-10', 'Santa Bárbara', 'Santa Bárbara', 'Completada', 'Entrega de vitaminas, insumos médicos y prendas de vestir.')
ON CONFLICT DO NOTHING;

-- 3. Insertar Pacientes Hondureños Reales (DNI y Municipios Válidos)
INSERT INTO public.pacientes (id, expediente_codigo, nombres, apellidos, dni, fecha_nacimiento, edad, sexo, telefono, comunidad, municipio, departamento) VALUES
  ('p1111111-1111-4111-a111-111111111111', 'PAC-2026-00001', 'María Sofía', 'Fernández Santos', '0703-1988-01234', '1988-04-12', 37, 'Femenino', '9876-5432', 'Barrio El Centro', 'Danlí', 'El Paraíso'),
  ('p2222222-2222-4222-a222-222222222222', 'PAC-2026-00002', 'Carlos Roberto', 'Alvarado Claros', '0801-1994-05678', '1994-08-25', 31, 'Masculino', '8765-4321', 'Aldea La Fraternidad', 'Comayagua', 'Comayagua'),
  ('p3333333-3333-4333-a333-333333333333', 'PAC-2026-00003', 'Ana Beatriz', 'Rodríguez Meléndez', '1601-2002-09876', '2002-11-03', 23, 'Femenino', '3344-5566', 'Caserío El Pino', 'Santa Bárbara', 'Santa Bárbara'),
  ('p4444444-4444-4444-a444-444444444444', 'PAC-2026-00004', 'José Luis', 'Martínez Zelaya', '0301-1975-04321', '1975-01-18', 51, 'Masculino', '9988-7766', 'Aldea San José', 'Danlí', 'El Paraíso'),
  ('p5555555-5555-4555-a555-555555555555', 'PAC-2026-00005', 'Dania Elizabeth', 'Gómez Valladares', '0801-2015-12345', '2015-06-30', 10, 'Femenino', '8877-6655', 'Barrio Abajo', 'Tegucigalpa', 'Francisco Morazán')
ON CONFLICT DO NOTHING;

-- 4. Insertar Medicamentos e Insumos Médicos Reales
INSERT INTO public.medicamentos (id, codigo_recurso, nombre, tipo_recurso, concentracion, forma_farmaceutica, via_administracion, stock_minimo, stock_actual) VALUES
  ('m1111111-1111-4111-a111-111111111111', 'MED-PARA-500', 'Paracetamol', 'medicamento', '500 mg', 'Tableta', 'Oral', 100, 500),
  ('m2222222-2222-4222-a222-222222222222', 'MED-AMOX-500', 'Amoxicilina', 'medicamento', '500 mg', 'Cápsula', 'Oral', 50, 300),
  ('m3333333-3333-4333-a333-333333333333', 'MED-IBUP-400', 'Ibuprofeno', 'medicamento', '400 mg', 'Tableta', 'Oral', 80, 450),
  ('m4444444-4444-4444-a444-444444444444', 'INS-GASA-EST', 'Gasas Estériles 10x10', 'insumo_medico', '10x10 cm', 'Paquete', 'Tópico', 30, 200),
  ('m5555555-5555-4555-a555-555555555555', 'INS-JERI-05M', 'Jeringas Desechables 5ml', 'insumo_medico', '5 ml', 'Unidad', 'Parenteral', 50, 250),
  ('m6666666-6666-4666-a666-666666666666', 'MAT-TOLD-BR1', 'Toldo Plegable Operativo 3x3m', 'material_brigada', '3x3 m', 'Unidad', 'N/A', 2, 6)
ON CONFLICT DO NOTHING;

-- 5. Insertar Lotes de Medicamentos con Fechas de Vencimiento Reales
INSERT INTO public.lotes_medicamentos (id, medicamento_id, numero_lote, fecha_vencimiento, cantidad_inicial, cantidad_actual, fecha_ingreso) VALUES
  ('l1111111-1111-4111-a111-111111111111', 'm1111111-1111-4111-a111-111111111111', 'LOT-PARA-2026A', '2027-08-31', 500, 500, '2026-01-10'),
  ('l2222222-2222-4222-a222-222222222222', 'm2222222-2222-4222-a222-222222222222', 'LOT-AMOX-2026B', '2027-04-30', 300, 300, '2026-01-10'),
  ('l3333333-3333-4333-a333-333333333333', 'm3333333-3333-4333-a333-333333333333', 'LOT-IBUP-2026C', '2027-11-30', 450, 450, '2026-01-12')
ON CONFLICT DO NOTHING;

-- 6. Insertar Ventas de Apoyo
INSERT INTO public.ventas (id, codigo_venta, brigada_id, comprador_nombre, comprador_telefono, total, observacion, created_at) VALUES
  ('v1111111-1111-4111-a111-111111111111', 'VTA-2026-7A9K2', 'b2222222-2222-4222-a222-222222222222', 'Roberto Suazo', '9988-1122', 450.00, 'Venta de promocionales de la fundación en brigada.', '2026-01-20 10:30:00'),
  ('v2222222-2222-4222-a222-222222222222', 'VTA-2026-3B8M4', 'b2222222-2222-4222-a222-222222222222', 'Sonia Claros', '8877-3344', 300.00, 'Compra de souvenirs y camisetas solidarias.', '2026-01-20 14:15:00')
ON CONFLICT DO NOTHING;

-- 7. Insertar Donaciones de Ropa
INSERT INTO public.donaciones_ropa (id, codigo_donacion, brigada_id, donante_nombre, donante_telefono, beneficiario_nombre, beneficiario_dni, tipo_prenda, prendas_entregadas, estado, created_at) VALUES
  ('d1111111-1111-4111-a111-111111111111', 'DON-ROP-2026-X9K2F', 'b2222222-2222-4222-a222-222222222222', 'Voluntariado Tegucigalpa', '2234-5678', 'María Sofía Fernández', '0703-1988-01234', 'Ropa de niño y niña (tallas 6-10)', 12, 'Entregado', '2026-01-20 11:00:00'),
  ('d2222222-2222-4222-a222-222222222222', 'DON-ROP-2026-M4P8T', 'b2222222-2222-4222-a222-222222222222', 'Iglesia San Francisco', '9898-7654', 'José Luis Martínez', '0301-1975-04321', 'Pantalones y camisas de varón', 8, 'Entregado', '2026-01-20 15:30:00')
ON CONFLICT DO NOTHING;

-- 8. Insertar Actividades Infantiles
INSERT INTO public.actividades_infantiles (id, codigo_actividad, brigada_id, nombre_actividad, responsable_nombre, ninos_atendidos, juguetes_entregados, meriendas_entregadas, created_at) VALUES
  ('a1111111-1111-4111-a111-111111111111', 'ACT-2026-8K2PF', 'b2222222-2222-4222-a222-222222222222', 'Taller de Higiene Dental y Piñata Comunitaria', 'Lic. Andrea Valladares', 45, 45, 50, '2026-01-20 13:00:00')
ON CONFLICT DO NOTHING;
