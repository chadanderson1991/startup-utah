import { serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'
  if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const db = getAdminClient()

  // Step 1: claims + company info (company FK always exists)
  const { data: claims, error } = await db
    .from('company_claims')
    .select('id, company_id, user_id, verification_note, status, created_at, companies (name, sector)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!claims?.length) return []

  // Step 2: look up user profiles separately (avoids needing a PostgREST FK relationship)
  const userIds = [...new Set(claims.map(c => c.user_id))]
  const { data: profiles } = await db
    .from('user_profiles')
    .select('id, full_name')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  return claims.map(c => ({
    ...c,
    user_profiles: profileMap[c.user_id] ?? null,
  }))
})
