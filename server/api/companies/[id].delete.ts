import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { getAdminClient } from '~/lib/supabase-admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Company id is required' })
  }

  const { error } = await getAdminClient()
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
