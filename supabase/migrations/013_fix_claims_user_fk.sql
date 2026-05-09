-- Re-point company_claims.user_id and reviewed_by from auth.users → user_profiles
-- so PostgREST can resolve the join and the Supabase UI shows the correct relationship.
-- user_profiles.id is a 1:1 mirror of auth.users.id so referential integrity is unchanged.

ALTER TABLE public.company_claims
  DROP CONSTRAINT IF EXISTS company_claims_user_id_fkey,
  DROP CONSTRAINT IF EXISTS company_claims_reviewed_by_fkey;

ALTER TABLE public.company_claims
  ADD CONSTRAINT company_claims_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.user_profiles(id)
    ON DELETE CASCADE,
  ADD CONSTRAINT company_claims_reviewed_by_fkey
    FOREIGN KEY (reviewed_by)
    REFERENCES public.user_profiles(id)
    ON DELETE SET NULL;
