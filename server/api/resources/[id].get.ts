import { serverSupabaseClient } from '#supabase/server'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Resource id is required' })
  }

  const { data, error } = await client
    .from('resources')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
  }

  return data
})
