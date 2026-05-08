import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { getAdminClient } from '~/lib/supabase-admin'
import type { Resource } from '~/types/resource'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Partial<Resource>>(event)

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const adminClient = getAdminClient()

  const payload = {
    title: body.title,
    description: body.description ?? null,
    link: body.link ?? null,
    email: body.email ?? null,
    communities: body.communities ?? [],
    industries: body.industries ?? [],
    locations: body.locations ?? [],
    topics: body.topics ?? [],
    is_active: body.is_active ?? true,
  }

  const { data, error } = await adminClient
    .from('resources')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
