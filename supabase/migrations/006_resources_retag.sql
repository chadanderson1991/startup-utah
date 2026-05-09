-- Add retagging columns to resources table
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS resource_type TEXT,
  ADD COLUMN IF NOT EXISTS stages        TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS keywords      TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS resources_resource_type_idx ON resources (resource_type);
CREATE INDEX IF NOT EXISTS resources_stages_idx        ON resources USING gin(stages);
CREATE INDEX IF NOT EXISTS resources_keywords_idx      ON resources USING gin(keywords);
