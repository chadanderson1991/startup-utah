-- Add owner_email to companies, populated when a claim is approved.
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS owner_email TEXT;
