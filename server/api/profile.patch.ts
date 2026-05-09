import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../utils/auth'
import { ProfileUpdateSchema } from '../utils/schemas'
import type { UserProfile } from '~/types/profile'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = ProfileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Invalid data' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('user_profiles')
    .upsert({ id: user.id, ...parsed.data })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as UserProfile
})
