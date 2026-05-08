import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { getAdminClient } from '~/lib/supabase-admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Resource id is required' })
  }

  const adminClient = getAdminClient()

  // Soft delete — set is_active to false
  const { error } = await adminClient
    .from('resources')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
