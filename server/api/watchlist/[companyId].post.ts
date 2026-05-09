import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'

// POST /api/watchlist/:companyId
// Auth required. Saves a company to investor's watchlist.
// On unique-constraint conflict, does nothing and returns 200.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const companyId = getRouterParam(event, 'companyId')

  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'companyId is required' })
  }

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('investor_watchlist')
    .upsert(
      { investor_id: user.id, company_id: companyId },
      { onConflict: 'investor_id,company_id', ignoreDuplicates: true },
    )
    .select('id, company_id, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
