-- Row Level Security policies
-- Admin role is stored in user_metadata.role = 'admin'
-- Set via: supabase.auth.admin.updateUserById(userId, { user_metadata: { role: 'admin' } })

ALTER TABLE resources      ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_claims ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    FALSE
  )
$$;

-- ── Resources ────────────────────────────────────────────────────────────────

-- Anyone can read active resources (public platform)
CREATE POLICY "resources_public_read" ON resources
  FOR SELECT USING (is_active = TRUE);

-- Admins can do everything (including read inactive)
CREATE POLICY "resources_admin_all" ON resources
  FOR ALL USING (is_admin());

-- ── Companies ────────────────────────────────────────────────────────────────

-- Anyone can read active companies
CREATE POLICY "companies_public_read" ON companies
  FOR SELECT USING (is_active = TRUE);

-- Anyone can submit a new company (unverified by default)
CREATE POLICY "companies_public_insert" ON companies
  FOR INSERT WITH CHECK (TRUE);

-- A company owner (claimed_by) can update their own profile
CREATE POLICY "companies_owner_update" ON companies
  FOR UPDATE USING (claimed_by = auth.uid());

-- Admins can do everything
CREATE POLICY "companies_admin_all" ON companies
  FOR ALL USING (is_admin());

-- ── Company Claims ────────────────────────────────────────────────────────────

-- Authenticated users can read their own claims
CREATE POLICY "claims_owner_read" ON company_claims
  FOR SELECT USING (user_id = auth.uid());

-- Authenticated users can submit claims
CREATE POLICY "claims_owner_insert" ON company_claims
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read and update all claims
CREATE POLICY "claims_admin_all" ON company_claims
  FOR ALL USING (is_admin());
