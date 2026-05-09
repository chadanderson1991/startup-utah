import { serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, readBody } from 'h3'
import { getAdminClient } from '~/lib/supabase-admin'
import type { Resource } from '~/types/resource'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to suggest a resource' })

  const body = await readBody<Partial<Resource>>(event)
  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const isAdmin =
    user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'

  const { data, error } = await getAdminClient()
    .from('resources')
    .insert({
      title: body.title.trim(),
      description: body.description || null,
      link: body.link || null,
      email: body.email || null,
      communities: body.communities ?? [],
      industries: body.industries ?? [],
      locations: body.locations ?? [],
      topics: body.topics ?? [],
      is_active: isAdmin,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
