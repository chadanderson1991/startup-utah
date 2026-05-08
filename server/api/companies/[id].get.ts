import { serverSupabaseClient } from '#supabase/server'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Company id is required' })
  }

  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  return data
})
