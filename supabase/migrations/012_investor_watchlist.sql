-- Investor watchlist: investors save companies they are interested in
CREATE TABLE IF NOT EXISTS public.investor_watchlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (investor_id, company_id)
);

CREATE INDEX IF NOT EXISTS investor_watchlist_investor_idx ON public.investor_watchlist (investor_id);
CREATE INDEX IF NOT EXISTS investor_watchlist_company_idx  ON public.investor_watchlist (company_id);

ALTER TABLE public.investor_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_select_own" ON public.investor_watchlist
  FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "watchlist_insert_own" ON public.investor_watchlist
  FOR INSERT WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "watchlist_delete_own" ON public.investor_watchlist
  FOR DELETE USING (auth.uid() = investor_id);

GRANT SELECT, INSERT, DELETE ON public.investor_watchlist TO authenticated;
GRANT ALL ON public.investor_watchlist TO service_role;
