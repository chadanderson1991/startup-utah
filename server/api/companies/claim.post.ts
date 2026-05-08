import { serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, readBody } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'

interface ClaimBody {
  company_id: string
  verification_note?: string
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<ClaimBody>(event)

  if (!body.company_id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'company_id is required' })
  }

  const adminClient = getAdminClient()

  // Check the company exists
  const { data: company, error: companyError } = await adminClient
    .from('companies')
    .select('id, claimed_by')
    .eq('id', body.company_id)
    .single()

  if (companyError || !company) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  // Check for an existing pending claim by this user
  const { data: existingClaim } = await adminClient
    .from('company_claims')
    .select('id, status')
    .eq('company_id', body.company_id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingClaim) {
    throw createError({ statusCode: 409, statusMessage: 'You already have a pending claim for this company' })
  }

  const { data, error } = await adminClient
    .from('company_claims')
    .insert({
      company_id: body.company_id,
      user_id: user.id,
      verification_note: body.verification_note ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
