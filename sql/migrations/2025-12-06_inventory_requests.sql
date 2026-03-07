
-- Add warehouse_type to workshop_inventory to distinguish between Workshop and Company/Office inventory
ALTER TABLE public.workshop_inventory 
ADD COLUMN IF NOT EXISTS warehouse_type text DEFAULT 'workshop';

-- Create inventory_requests table
CREATE TABLE IF NOT EXISTS public.inventory_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.workshop_inventory(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  quantity int NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected, fulfilled
  reason text,
  warehouse_type text DEFAULT 'workshop',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason text
);

-- Enable RLS
ALTER TABLE public.inventory_requests ENABLE ROW LEVEL SECURITY;

-- Policies for inventory_requests
-- Requesters can see their own requests
CREATE POLICY "Users can view their own requests" 
ON public.inventory_requests FOR SELECT 
USING (requester_id = auth.uid() OR public.has_role('admin') OR public.has_role('logistics_manager') OR public.has_role('maintenance_manager'));

-- Requesters can insert their own requests
CREATE POLICY "Users can create requests" 
ON public.inventory_requests FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

-- Managers/Admins can update requests (approve/reject)
CREATE POLICY "Managers can update requests" 
ON public.inventory_requests FOR UPDATE 
USING (public.has_role('admin') OR public.has_role('logistics_manager') OR public.has_role('maintenance_manager'));

-- Notify function for requests (optional, but good practice)
-- (Skipping specific trigger for now to keep it simple, relying on polling or realtime)
