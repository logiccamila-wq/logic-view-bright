
-- Sample Profiles (Users)
INSERT INTO public.profiles (id, email, full_name, cpf, telefone, cidade, tipo_vinculo)
VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@optilog.app', 'Administrador Sistema', '000.000.000-01', '11999999999', 'São Paulo', 'CLT'),
('00000000-0000-0000-0000-000000000002', 'motorista1@optilog.app', 'João da Silva', '111.111.111-11', '11988888888', 'Campinas', 'Agregado'),
('00000000-0000-0000-0000-000000000003', 'mecanico1@optilog.app', 'Pedro Mecânico', '222.222.222-22', '11977777777', 'São Paulo', 'CLT')
ON CONFLICT (id) DO NOTHING;

-- Sample User Roles
INSERT INTO public.user_roles (user_id, role)
VALUES
('00000000-0000-0000-0000-000000000001', 'admin'),
('00000000-0000-0000-0000-000000000002', 'driver'),
('00000000-0000-0000-0000-000000000003', 'fleet_maintenance')
ON CONFLICT (user_id, role) DO NOTHING;

-- Sample Vehicles
INSERT INTO public.vehicles (placa, modelo, marca, ano, tipo, status, km)
VALUES
('ABC-1234', 'Actros 2651', 'Mercedes-Benz', 2022, 'cavalo', 'ativo', 150000),
('DEF-5678', 'FH 540', 'Volvo', 2023, 'cavalo', 'ativo', 85000),
('GHI-9012', 'R 450', 'Scania', 2021, 'cavalo', 'manutencao', 210000),
('CAR-0001', 'Carreta Baú 3 Eixos', 'Randon', 2020, 'carreta', 'ativo', 0)
ON CONFLICT (placa) DO NOTHING;

-- Sample Service Orders
INSERT INTO public.service_orders (vehicle_plate, status, description, odometer, priority, created_at)
VALUES
('ABC-1234', 'concluida', 'Troca de óleo e filtros', 145000, 'media', NOW() - INTERVAL '1 month'),
('GHI-9012', 'em_andamento', 'Revisão do sistema de freios', 210000, 'alta', NOW() - INTERVAL '2 days'),
('DEF-5678', 'aberta', 'Verificação de luzes traseiras', 85000, 'baixa', NOW())
ON CONFLICT DO NOTHING;

-- Sample Inventory
INSERT INTO public.workshop_inventory (part_code, part_name, category, quantity, minimum_stock, unit_price, location)
VALUES
('FIL-001', 'Filtro de Óleo Motor Actros', 'Filtros', 12, 5, 150.00, 'A-01'),
('FIL-002', 'Filtro de Combustível Volvo', 'Filtros', 8, 5, 120.00, 'A-02'),
('OLE-001', 'Óleo 15W40 Tambor', 'Fluidos', 200, 50, 25.00, 'B-01'),
('PNE-001', 'Pneu 295/80 R22.5', 'Pneus e Rodas', 4, 6, 2500.00, 'C-01')
ON CONFLICT (part_code) DO NOTHING;

-- Sample Trips
INSERT INTO public.trips (driver_id, driver_name, vehicle_plate, origin, destination, status, estimated_departure, estimated_arrival)
VALUES
('00000000-0000-0000-0000-000000000002', 'João da Silva', 'ABC-1234', 'São Paulo/SP', 'Rio de Janeiro/RJ', 'em_andamento', NOW(), NOW() + INTERVAL '8 hours')
ON CONFLICT DO NOTHING;

-- Sample Vehicle Tracking (for Live Map)
INSERT INTO public.vehicle_tracking (vehicle_plate, driver_id, latitude, longitude, speed, heading, status, timestamp)
VALUES
('ABC-1234', 'João da Silva', -23.550520, -46.633308, 65, 90, 'em_transito', NOW()),
('DEF-5678', NULL, -22.906847, -43.172896, 0, 0, 'parado', NOW()),
('GHI-9012', NULL, -25.4284, -49.2733, 0, 0, 'manutencao', NOW())
ON CONFLICT DO NOTHING;
