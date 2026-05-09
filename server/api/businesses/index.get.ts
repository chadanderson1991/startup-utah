import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import type { Company } from '~/types/company'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('claimed_by', user.id)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as Company[]
})
