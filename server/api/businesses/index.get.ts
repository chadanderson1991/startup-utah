import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import type { Business } from '~/types/profile'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as Business[]
})
