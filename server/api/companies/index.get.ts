import { serverSupabaseClient } from '#supabase/server'
import { createError, defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  let builder = client.from('companies').select('*').eq('is_active', true)

  if (query.search) {
    builder = builder.or(
      `name.ilike.%${query.search}%,description.ilike.%${query.search}%`,
    )
  }
  if (query.sectors) {
    const vals = String(query.sectors).split(',').filter(Boolean)
    if (vals.length) builder = builder.in('sector', vals)
  }
  if (query.stages) {
    const vals = String(query.stages).split(',').filter(Boolean)
    if (vals.length) builder = builder.in('stage', vals)
  }
  if (query.employee_ranges) {
    const vals = String(query.employee_ranges).split(',').filter(Boolean)
    if (vals.length) builder = builder.in('employee_range', vals)
  }
  if (query.is_hiring === 'true') {
    builder = builder.eq('is_hiring', true)
  }

  builder = builder.order('name')
  const { data, error } = await builder
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
