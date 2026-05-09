-- User profiles: 1:1 extension of auth.users
CREATE TABLE public.user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  county       TEXT CHECK (county IS NULL OR county IN (
    'Beaver','Box Elder','Cache','Carbon','Daggett','Davis','Duchesne',
    'Emery','Garfield','Grand','Iron','Juab','Kane','Millard','Morgan',
    'Piute','Rich','Salt Lake','San Juan','Sanpete','Sevier','Summit',
    'Tooele','Uintah','Utah','Wasatch','Washington','Wayne','Weber'
  )),
  industry     TEXT,
  communities  TEXT[] NOT NULL DEFAULT '{}'
               CHECK (communities <@ ARRAY['Veteran','Women','Rural','Student','Multicultural']::TEXT[]),
  bio          TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- updated_at trigger (reuse function from resources if exists, else create)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

CREATE TRIGGER user_profiles_set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing users (idempotent)
INSERT INTO public.user_profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
