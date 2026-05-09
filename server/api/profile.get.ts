import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../utils/auth'
import type { UserProfile } from '~/types/profile'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    // Profile might not exist yet (pre-trigger users) — upsert and return empty shell
    await client.from('user_profiles').upsert({ id: user.id }, { onConflict: 'id' })
    return { id: user.id, full_name: null, county: null, industry: null, communities: [], bio: null, active_business_id: null, profile_type: 'entrepreneur', preferred_sectors: [], preferred_stages: [], investment_thesis: null, investor_name: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as UserProfile
  }

  return data as UserProfile
})
