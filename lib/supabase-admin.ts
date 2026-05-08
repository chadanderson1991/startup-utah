import { createClient } from '@supabase/supabase-js'

export function getAdminClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = config.supabaseServiceKey
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
