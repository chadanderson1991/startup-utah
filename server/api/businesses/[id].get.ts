import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import type { Business } from '~/types/profile'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return data as Business
})
