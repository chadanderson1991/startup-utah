interface GeocodeResult {
  lat: number
  lng: number
  city: string
}

export async function geocodeAddress(
  address: string,
  mapboxToken: string,
): Promise<GeocodeResult | null> {
  if (!address?.trim() || !mapboxToken) return null

  const encoded = encodeURIComponent(address)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${mapboxToken}&country=US&proximity=-111.093,39.32&limit=1`

  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json() as {
      features?: {
        center: [number, number]
        context?: { id: string; text: string }[]
        place_name?: string
      }[]
    }

    const feature = data.features?.[0]
    if (!feature) return null

    const [lng, lat] = feature.center
    const cityCtx = feature.context?.find(c => c.id.startsWith('place.'))
    const city = cityCtx?.text ?? feature.place_name?.split(',')[1]?.trim() ?? ''

    return { lat, lng, city }
  } catch {
    return null
  }
}
