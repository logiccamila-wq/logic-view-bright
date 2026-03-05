-- Adicionar campo vehicle_placa aos lançamentos financeiros
ALTER TABLE lancamentos_financeiros
ADD COLUMN IF NOT EXISTS vehicle_placa text REFERENCES vehicles(placa) ON DELETE SET NULL;