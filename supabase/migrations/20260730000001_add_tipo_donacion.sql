-- Agregar tipo de donación a donaciones_ropa
ALTER TABLE public.donaciones_ropa ADD COLUMN IF NOT EXISTS tipo_donacion VARCHAR(50) DEFAULT 'Ropa';

-- Limitar las opciones a Ropa, Dinero, Juguetes
ALTER TABLE public.donaciones_ropa ADD CONSTRAINT chk_tipo_donacion CHECK (tipo_donacion IN ('Ropa', 'Dinero', 'Juguetes'));
