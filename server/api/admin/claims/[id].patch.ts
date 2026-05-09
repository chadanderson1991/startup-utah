import { serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'

interface PatchBody {
  action: 'approve' | 'reject'
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'
  if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Claim id is required' })

  const { action } = await readBody<PatchBody>(event)
  if (action !== 'approve' && action !== 'reject') {
    throw createError({ statusCode: 400, statusMessage: 'action must be approve or reject' })
  }

  const db = getAdminClient()

  // Fetch the claim
  const { data: claim, error: claimError } = await db
    .from('company_claims')
    .select('id, company_id, user_id, status')
    .eq('id', id)
    .single()

  if (claimError || !claim) throw createError({ statusCode: 404, statusMessage: 'Claim not found' })
  if (claim.status !== 'pending') throw createError({ statusCode: 409, statusMessage: 'Claim is already resolved' })

  if (action === 'approve') {
    // Look up claimant's email from auth.users
    const { data: authUser } = await db.auth.admin.getUserById(claim.user_id)
    const ownerEmail = authUser?.user?.email ?? null

    // Set company claimed_by and owner_email
    const { error: companyError } = await db
      .from('companies')
      .update({ claimed_by: claim.user_id, owner_email: ownerEmail, updated_at: new Date().toISOString() })
      .eq('id', claim.company_id)

    if (companyError) throw createError({ statusCode: 500, statusMessage: companyError.message })

    // Approve this claim
    await db
      .from('company_claims')
      .update({ status: 'approved', reviewed_by: user!.id, updated_at: new Date().toISOString() })
      .eq('id', id)

    // Reject any other pending claims for the same company
    await db
      .from('company_claims')
      .update({ status: 'rejected', reviewed_by: user!.id, updated_at: new Date().toISOString() })
      .eq('company_id', claim.company_id)
      .eq('status', 'pending')
      .neq('id', id)
  } else {
    await db
      .from('company_claims')
      .update({ status: 'rejected', reviewed_by: user!.id, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return { success: true }
})
