-- Company claim requests: verification flow for self-service profiles
CREATE TABLE IF NOT EXISTS company_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_note TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One pending claim per user per company
  UNIQUE (company_id, user_id)
);

CREATE INDEX claims_status_idx     ON company_claims (status);
CREATE INDEX claims_company_idx    ON company_claims (company_id);
CREATE INDEX claims_user_idx       ON company_claims (user_id);

CREATE TRIGGER company_claims_updated_at
  BEFORE UPDATE ON company_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
