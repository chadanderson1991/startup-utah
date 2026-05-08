import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { getAdminClient } from '~/lib/supabase-admin'
import type { Resource } from '~/types/resource'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Resource id is required' })
  }

  const body = await readBody<Partial<Resource>>(event)
  const adminClient = getAdminClient()

  // Remove read-only fields before update
  const { id: _id, created_at: _ca, updated_at: _ua, ...updatePayload } = body as Record<string, unknown>

  const { data, error } = await adminClient
    .from('resources')
    .update({ ...updatePayload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
