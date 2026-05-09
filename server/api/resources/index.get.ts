import { serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, getQuery } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const includeInactive = query.include_inactive === 'true'

  if (includeInactive) {
    const user = await serverSupabaseUser(event)
    const isAdmin =
      user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'
    if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const client = getAdminClient()
  let builder = includeInactive
    ? client.from('resources').select('*')
    : client.from('resources').select('*').eq('is_active', true)

  if (query.search) {
    builder = builder.or(
      `title.ilike.%${query.search}%,description.ilike.%${query.search}%`,
    )
  }
  if (query.communities) {
    const vals = String(query.communities).split(',').filter(Boolean)
    if (vals.length) builder = builder.overlaps('communities', vals)
  }
  if (query.industries) {
    const vals = String(query.industries).split(',').filter(Boolean)
    if (vals.length) builder = builder.overlaps('industries', vals)
  }
  if (query.locations) {
    const vals = String(query.locations).split(',').filter(Boolean)
    if (vals.length) builder = builder.overlaps('locations', vals)
  }
  if (query.topics) {
    const vals = String(query.topics).split(',').filter(Boolean)
    if (vals.length) builder = builder.overlaps('topics', vals)
  }

  builder = builder.order('title')
  const { data, error } = await builder
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
