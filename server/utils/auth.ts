import { serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'
import type { H3Event } from 'h3'

export async function requireUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const isAdmin =
    user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }
  return user
}
