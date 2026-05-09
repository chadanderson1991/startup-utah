-- Investor profile fields on user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS profile_type       TEXT NOT NULL DEFAULT 'entrepreneur'
    CHECK (profile_type IN ('entrepreneur', 'investor')),
  ADD COLUMN IF NOT EXISTS preferred_sectors  TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_stages   TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS investment_thesis  TEXT,
  ADD COLUMN IF NOT EXISTS investor_name      TEXT;
