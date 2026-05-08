import { serverSupabaseClient } from '#supabase/server'
import { createError, defineEventHandler, readBody } from 'h3'
import type { Company } from '~/types/company'
import { geocodeAddress } from '../../utils/geocode'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const config = useRuntimeConfig()
  const body = await readBody<Partial<Company>>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Company name is required' })
  }

  // Geocode the address server-side — client never needs to send lat/lng
  let lat: number | null = null
  let lng: number | null = null
  let city: string | null = null

  if (body.address?.trim()) {
    const geo = await geocodeAddress(body.address, config.public.mapboxToken)
    if (geo) {
      lat = geo.lat
      lng = geo.lng
      city = geo.city
    }
  }

  const payload = {
    name: body.name.trim(),
    description: body.description ?? null,
    website: body.website ?? null,
    linkedin_url: body.linkedin_url ?? null,
    address: body.address ?? null,
    lat,
    lng,
    city,
    sector: body.sector ?? null,
    stage: body.stage ?? null,
    employee_range: body.employee_range ?? null,
    year_founded: body.year_founded ?? null,
    is_hiring: body.is_hiring ?? false,
    job_postings: body.job_postings ?? [],
    photos: body.photos ?? [],
    is_verified: false,
    is_active: true,
    claimed_by: null,
  }

  const { data, error } = await client
    .from('companies')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
