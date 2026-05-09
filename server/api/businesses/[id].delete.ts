import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('businesses')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
