import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import { BusinessUpdateSchema } from '../../utils/schemas'
import type { Company } from '~/types/company'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const parsed = BusinessUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Invalid data' })
  }

  const client = await serverSupabaseClient(event)
  // RLS "companies_owner_update" restricts to claimed_by = auth.uid()
  const { data, error } = await client
    .from('companies')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return data as Company
})
