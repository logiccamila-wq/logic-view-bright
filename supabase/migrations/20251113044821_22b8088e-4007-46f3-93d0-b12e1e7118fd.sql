-- Fix mechanic tables RLS policies - replace 'mecanico' with correct roles
-- Drop all existing policies that use invalid 'mecanico' role
DROP POLICY IF EXISTS "Mecânicos podem ver todas ordens de serviço" ON public.service_orders;
DROP POLICY IF EXISTS "Mecânicos podem criar ordens de serviço" ON public.service_orders;
DROP POLICY IF EXISTS "Mecânicos podem atualizar ordens de serviço" ON public.service_orders;
DROP POLICY IF EXISTS "Mecânicos podem ver leituras TPMS" ON public.tpms_readings;
DROP POLICY IF EXISTS "Mecânicos podem criar leituras TPMS" ON public.tpms_readings;
DROP POLICY IF EXISTS "Mecânicos podem atualizar leituras TPMS" ON public.tpms_readings;
DROP POLICY IF EXISTS "Mecânicos podem ver checklists" ON public.maintenance_checklists;
DROP POLICY IF EXISTS "Mecânicos podem criar checklists" ON public.maintenance_checklists;
DROP POLICY IF EXISTS "Mecânicos podem atualizar checklists" ON public.maintenance_checklists;
DROP POLICY IF EXISTS "Mecânicos podem ver inventário" ON public.workshop_inventory;
DROP POLICY IF EXISTS "Apenas admins podem atualizar inventário" ON public.workshop_inventory;

-- Recreate policies with correct roles (fleet_maintenance, maintenance_assistant, admin)

-- Service Orders policies
CREATE POLICY "Mechanics can view all service orders"
  ON public.service_orders FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mechanics can create service orders"
  ON public.service_orders FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mechanics can update service orders"
  ON public.service_orders FOR UPDATE
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- TPMS policies
CREATE POLICY "Mechanics can view TPMS readings"
  ON public.tpms_readings FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mechanics can create TPMS readings"
  ON public.tpms_readings FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mechanics can update TPMS readings"
  ON public.tpms_readings FOR UPDATE
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Maintenance Checklists policies
CREATE POLICY "Mechanics can view checklists"
  ON public.maintenance_checklists FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mechanics can create checklists"
  ON public.maintenance_checklists FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mechanics can update checklists"
  ON public.maintenance_checklists FOR UPDATE
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Workshop Inventory policies
CREATE POLICY "Mechanics can view inventory"
  ON public.workshop_inventory FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Only admins can manage inventory"
  ON public.workshop_inventory FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Secure maintenance-photos storage bucket
UPDATE storage.buckets 
SET public = false 
WHERE name = 'maintenance-photos';

-- Add RLS policies for maintenance-photos bucket
CREATE POLICY "Mechanics can view maintenance photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'maintenance-photos' AND (
      has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
      has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Mechanics can upload maintenance photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'maintenance-photos' AND (
      has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
      has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Mechanics can update maintenance photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'maintenance-photos' AND (
      has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
      has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Only admins can delete maintenance photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'maintenance-photos' AND 
    has_role(auth.uid(), 'admin'::app_role)
  );