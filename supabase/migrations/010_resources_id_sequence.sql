-- Attach an auto-increment sequence to resources.id so inserts without an
-- explicit id work correctly. Starts after the highest existing id.
CREATE SEQUENCE IF NOT EXISTS resources_id_seq;
SELECT setval('resources_id_seq', COALESCE((SELECT MAX(id) FROM resources), 0) + 1, false);
ALTER TABLE resources ALTER COLUMN id SET DEFAULT nextval('resources_id_seq');
