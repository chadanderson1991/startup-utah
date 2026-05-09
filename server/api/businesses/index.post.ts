import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import { BusinessCreateSchema } from '../../utils/schemas'
import type { Company } from '~/types/company'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = BusinessCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Invalid data' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('companies')
    .insert({ ...parsed.data, claimed_by: user.id, is_active: false, is_verified: false })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as Company
})
