-- User businesses: each user can track multiple startups
CREATE TABLE public.businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  description   TEXT,
  stage         TEXT NOT NULL DEFAULT 'idea'
                CHECK (stage IN ('idea','early','growth','established')),
  industry      TEXT,
  county        TEXT,
  website       TEXT,
  year_founded  INT CHECK (year_founded IS NULL OR year_founded BETWEEN 1800 AND 2100),
  is_hiring     BOOLEAN NOT NULL DEFAULT FALSE,
  journey_step  INT NOT NULL DEFAULT 1 CHECK (journey_step BETWEEN 1 AND 19),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX businesses_owner_idx ON public.businesses(owner_id);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "biz_select_own" ON public.businesses FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "biz_insert_own" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "biz_update_own" ON public.businesses FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "biz_delete_own" ON public.businesses FOR DELETE USING (auth.uid() = owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;

CREATE TRIGGER businesses_set_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
