-- Resources table: 213 Utah state entrepreneurship resources
CREATE TABLE IF NOT EXISTS resources (
  id          BIGINT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  link        TEXT,
  email       TEXT,
  communities TEXT[] NOT NULL DEFAULT '{}',
  industries  TEXT[] NOT NULL DEFAULT '{}',
  locations   TEXT[] NOT NULL DEFAULT '{}',
  topics      TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search across title + description
CREATE INDEX resources_fts_idx ON resources
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- GIN indexes for array overlap queries
CREATE INDEX resources_communities_idx ON resources USING gin(communities);
CREATE INDEX resources_industries_idx  ON resources USING gin(industries);
CREATE INDEX resources_locations_idx   ON resources USING gin(locations);
CREATE INDEX resources_topics_idx      ON resources USING gin(topics);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
