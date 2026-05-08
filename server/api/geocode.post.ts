import { geocodeAddress } from '../utils/geocode'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { address } = await readBody<{ address: string }>(event)

  if (!address?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Address is required' })
  }

  const token = config.public.mapboxToken
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'Mapbox token not configured on server' })
  }

  const result = await geocodeAddress(address, token)

  if (!result) {
    throw createError({ statusCode: 422, statusMessage: 'Address could not be geocoded. Try a more specific address.' })
  }

  return result
})
