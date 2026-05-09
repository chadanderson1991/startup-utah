import { createClient } from '@supabase/supabase-js'

export function getAdminClient() {
  const config = useRuntimeConfig()
  // Read URL from the supabase module's own public config (already in client bundle, not a secret)
  const supabaseUrl = config.public.supabase.url as string
  const serviceKey = config.supabaseServiceKey
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
