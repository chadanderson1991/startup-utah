import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)

  // RLS "companies_owner_delete" restricts to claimed_by = auth.uid() AND is_active = false
  const { error } = await client
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
