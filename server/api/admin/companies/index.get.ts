import { serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, getQuery } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'
  if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const query = getQuery(event)
  const client = getAdminClient()

  let builder = query.pending === 'true'
    ? client.from('companies').select('*').eq('is_active', false)
    : client.from('companies').select('*')

  builder = builder.order('name')

  const { data, error } = await builder
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
