import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'

// DELETE /api/watchlist/:companyId
// Auth required. Removes a company from the investor's watchlist.
// Returns 204 No Content.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const companyId = getRouterParam(event, 'companyId')

  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'companyId is required' })
  }

  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('investor_watchlist')
    .delete()
    .eq('investor_id', user.id)
    .eq('company_id', companyId)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  event.node.res.statusCode = 204
  return null
})
