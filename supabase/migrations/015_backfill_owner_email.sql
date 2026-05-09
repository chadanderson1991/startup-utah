-- Backfill owner_email for companies that were claimed before migration 014 added the column.
UPDATE public.companies c
SET owner_email = u.email
FROM auth.users u
WHERE c.claimed_by = u.id
  AND c.claimed_by IS NOT NULL
  AND c.owner_email IS NULL;
