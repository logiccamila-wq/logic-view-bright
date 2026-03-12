DO $$
DECLARE
    r record;
BEGIN
    -- Drop existing policies on refuelings
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'refuelings' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.refuelings;', r.policyname);
    END LOOP;

    -- Drop existing policies on vehicles
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.vehicles;', r.policyname);
    END LOOP;
END$$;

-- 1) Ensure organization_id and owner_id on vehicles 
ALTER TABLE IF EXISTS public.vehicles 
  ADD COLUMN IF NOT EXISTS organization_id uuid; 
ALTER TABLE IF EXISTS public.vehicles 
  ADD COLUMN IF NOT EXISTS owner_id uuid; 

-- 2) Create org_users table if not exists (minimal schema) 
CREATE TABLE IF NOT EXISTS public.org_users ( 
  organization_id uuid NOT NULL, 
  user_id uuid NOT NULL, 
  role text, 
  PRIMARY KEY (organization_id, user_id) 
); 

-- Ensure RLS and create policies 
ALTER TABLE IF EXISTS public.refuelings ENABLE ROW LEVEL SECURITY; 

CREATE POLICY refuelings_select_owner_or_org ON public.refuelings 
FOR SELECT 
TO authenticated 
USING ( 
  EXISTS ( 
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_id 
      AND ( 
        v.owner_id = (SELECT auth.uid()) 
        OR EXISTS ( 
          SELECT 1 FROM public.org_users ou 
          WHERE ou.organization_id = v.organization_id 
            AND ou.user_id = (SELECT auth.uid()) 
        ) 
      ) 
  ) 
); 

CREATE POLICY refuelings_insert_owner_or_org ON public.refuelings 
FOR INSERT 
TO authenticated 
WITH CHECK ( 
  EXISTS ( 
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_id 
      AND ( 
        v.owner_id = (SELECT auth.uid()) 
        OR EXISTS ( 
          SELECT 1 FROM public.org_users ou 
          WHERE ou.organization_id = v.organization_id 
            AND ou.user_id = (SELECT auth.uid()) 
        ) 
      ) 
  ) 
); 

CREATE POLICY refuelings_update_owner_or_org ON public.refuelings 
FOR UPDATE 
TO authenticated 
USING ( 
  EXISTS ( 
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_id 
      AND ( 
        v.owner_id = (SELECT auth.uid()) 
        OR EXISTS ( 
          SELECT 1 FROM public.org_users ou 
          WHERE ou.organization_id = v.organization_id 
            AND ou.user_id = (SELECT auth.uid()) 
        ) 
      ) 
  ) 
) 
WITH CHECK ( 
  EXISTS ( 
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_id 
      AND ( 
        v.owner_id = (SELECT auth.uid()) 
        OR EXISTS ( 
          SELECT 1 FROM public.org_users ou 
          WHERE ou.organization_id = v.organization_id 
            AND ou.user_id = (SELECT auth.uid()) 
        ) 
      ) 
  ) 
); 

CREATE POLICY refuelings_delete_owner_or_org ON public.refuelings 
FOR DELETE 
TO authenticated 
USING ( 
  EXISTS ( 
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_id 
      AND ( 
        v.owner_id = (SELECT auth.uid()) 
        OR EXISTS ( 
          SELECT 1 FROM public.org_users ou 
          WHERE ou.organization_id = v.organization_id 
            AND ou.user_id = (SELECT auth.uid()) 
        ) 
      ) 
  ) 
); 

-- Ensure vehicles RLS enabled 
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY; 

CREATE POLICY vehicles_select_owner_or_org ON public.vehicles 
FOR SELECT 
TO authenticated 
USING ( 
  owner_id = (SELECT auth.uid()) 
  OR EXISTS ( 
    SELECT 1 FROM public.org_users ou 
    WHERE ou.organization_id = organization_id 
      AND ou.user_id = (SELECT auth.uid()) 
  ) 
); 

CREATE POLICY vehicles_update_owner_or_org ON public.vehicles 
FOR UPDATE 
TO authenticated 
USING ( 
  owner_id = (SELECT auth.uid()) 
  OR EXISTS ( 
    SELECT 1 FROM public.org_users ou 
    WHERE ou.organization_id = organization_id 
      AND ou.user_id = (SELECT auth.uid()) 
  ) 
) 
WITH CHECK ( 
  owner_id = (SELECT auth.uid()) 
  OR EXISTS ( 
    SELECT 1 FROM public.org_users ou 
    WHERE ou.organization_id = organization_id 
      AND ou.user_id = (SELECT auth.uid()) 
  ) 
); 

-- Index to support org_users checks 
CREATE INDEX IF NOT EXISTS idx_org_users_user_org ON public.org_users(user_id, organization_id);
