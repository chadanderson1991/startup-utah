import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import type { Company } from '~/types/company'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)

  // RLS: "companies_owner_read" lets owners see their own companies;
  // "companies_public_read" covers is_active=true companies.
  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return data as Company
})
