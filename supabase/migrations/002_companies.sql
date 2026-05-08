-- Companies table: Utah startup ecosystem map (223 seed rows + self-service additions)
CREATE TABLE IF NOT EXISTS companies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  website        TEXT,
  linkedin_url   TEXT,
  address        TEXT,
  lat            DOUBLE PRECISION,
  lng            DOUBLE PRECISION,
  city           TEXT,
  -- Filter dimensions
  sector         TEXT,          -- 'B2B Software', 'FinTech', 'Security', 'Bio/Medical Tech', 'Energy', 'Consumer', 'Marketplaces'
  stage          TEXT,          -- 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Bootstrapped'
  employee_range TEXT,          -- '2-10', '11-50', '51-200', '201-500', '501-1K', '1K-5K'
  -- Profile fields
  year_founded   INT,
  is_hiring      BOOLEAN NOT NULL DEFAULT FALSE,
  job_postings   JSONB NOT NULL DEFAULT '[]', -- [{title, url, posted_at}]
  photos         TEXT[] NOT NULL DEFAULT '{}',
  -- Ownership + moderation
  is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  claimed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for map bbox queries
CREATE INDEX companies_geo_idx ON companies (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Filter indexes
CREATE INDEX companies_sector_idx   ON companies (sector);
CREATE INDEX companies_stage_idx    ON companies (stage);
CREATE INDEX companies_hiring_idx   ON companies (is_hiring) WHERE is_hiring = TRUE;
CREATE INDEX companies_verified_idx ON companies (is_verified);

-- Full-text search
CREATE INDEX companies_fts_idx ON companies
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
