import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import { BusinessUpdateSchema } from '../../utils/schemas'
import type { Business } from '~/types/profile'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const parsed = BusinessUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Invalid data' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('businesses')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return data as Business
})
