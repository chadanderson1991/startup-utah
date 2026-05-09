-- Merge businesses table into companies.
-- businesses rows become is_active=false companies (no address → not on map).
-- Same IDs are preserved so user_profiles.active_business_id stays valid.

-- (1) Add business-specific tracking columns to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS journey_step INT CHECK (journey_step BETWEEN 1 AND 19),
  ADD COLUMN IF NOT EXISTS notes        TEXT,
  ADD COLUMN IF NOT EXISTS industry     TEXT,
  ADD COLUMN IF NOT EXISTS county       TEXT;

-- (2) Owners can read their own companies even when is_active = false
CREATE POLICY "companies_owner_read" ON public.companies
  FOR SELECT USING (claimed_by = auth.uid());

-- (3) Owners can delete their own companies only while still inactive (not on the map)
CREATE POLICY "companies_owner_delete" ON public.companies
  FOR DELETE USING (claimed_by = auth.uid() AND is_active = FALSE);

-- (4) Copy every business row into companies (same PK so no reference breaks)
INSERT INTO public.companies (
  id, name, description, website, year_founded, is_hiring,
  stage, industry, county, journey_step, notes,
  claimed_by, owner_email,
  is_active, is_verified,
  created_at, updated_at
)
SELECT
  b.id,
  b.name,
  b.description,
  b.website,
  b.year_founded,
  b.is_hiring,
  b.stage,
  b.industry,
  b.county,
  b.journey_step,
  b.notes,
  b.owner_id,
  u.email,
  FALSE,   -- no address → stays off the map until an admin activates it
  FALSE,
  b.created_at,
  b.updated_at
FROM public.businesses b
LEFT JOIN auth.users u ON u.id = b.owner_id
ON CONFLICT (id) DO NOTHING;

-- (5) Re-point user_profiles.active_business_id → companies (IDs are identical)
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_active_business_id_fkey,
  ADD CONSTRAINT user_profiles_active_business_id_fkey
    FOREIGN KEY (active_business_id)
    REFERENCES public.companies(id)
    ON DELETE SET NULL;
