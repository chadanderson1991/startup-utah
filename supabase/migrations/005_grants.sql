-- Grant table-level permissions to Supabase roles.
-- RLS handles row-level security, but Postgres table privileges are a separate gate.
-- Without these, anon/authenticated users get "permission denied" even if RLS would allow it.

-- Resources: read-only for public, full access for service role (via RLS admin policy)
GRANT SELECT ON resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON resources TO authenticated;

-- Companies: public can read and insert new listings; owners and admins update via RLS
GRANT SELECT ON companies TO anon, authenticated;
GRANT INSERT ON companies TO anon, authenticated;
GRANT UPDATE, DELETE ON companies TO authenticated;

-- Claims: authenticated users only
GRANT SELECT, INSERT ON company_claims TO authenticated;
GRANT UPDATE ON company_claims TO authenticated;

-- Allow service role full access (already default in Supabase, but explicit for clarity)
GRANT ALL ON resources TO service_role;
GRANT ALL ON companies TO service_role;
GRANT ALL ON company_claims TO service_role;
