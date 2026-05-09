import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'

// GET /api/watchlist
// Auth required. Returns investor's saved companies.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('investor_watchlist')
    .select('id, company_id, created_at, companies(*)')
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data ?? []
})
