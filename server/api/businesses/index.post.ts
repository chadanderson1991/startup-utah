import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import { BusinessCreateSchema } from '../../utils/schemas'
import type { Business } from '~/types/profile'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = BusinessCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Invalid data' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('businesses')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as Business
})
