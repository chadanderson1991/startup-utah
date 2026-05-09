import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'
import type { Company } from '~/types/company'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Company id is required' })
  }

  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const isAdmin =
    user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'

  // If not admin, verify the user owns the company
  if (!isAdmin) {
    const client = await serverSupabaseClient(event)
    const { data: company, error: fetchError } = await client
      .from('companies')
      .select('claimed_by')
      .eq('id', id)
      .single()

    if (fetchError || !company) {
      throw createError({ statusCode: 404, statusMessage: 'Company not found' })
    }

    if (company.claimed_by !== user.id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: you do not own this company' })
    }
  }

  const body = await readBody<Partial<Company>>(event)
  // Admins may explicitly clear claimed_by / owner_email to unclaim a company.
  // Non-admins can never touch ownership fields.
  const { id: _id, created_at: _ca, updated_at: _ua, ...adminPayload } = body as Record<string, unknown>
  const { claimed_by: _cb, owner_email: _oe, ...ownerPayload } = adminPayload
  const updatePayload = isAdmin ? adminPayload : ownerPayload

  const adminClient = getAdminClient()
  const { data, error } = await adminClient
    .from('companies')
    .update({ ...updatePayload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
