<script setup lang="ts">
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'
import type { Company } from '~/types/company'

const props = defineProps<{ companies: Company[] }>()
const emit = defineEmits<{ (e: 'company-selected', company: Company | null): void }>()

const config = useRuntimeConfig()
const brandfetchClientId = config.public.brandfetchClientId as string

const mapContainer = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mapboxgl: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markersOnScreen = new Map<string, any>()

function domainFromUrl(url: unknown): string | null {
  if (typeof url !== 'string' || !url.trim()) return null
  try {
    const u = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function logoUrl(domain: string): string {
  return `https://cdn.brandfetch.io/${encodeURIComponent(domain)}/w/72/h/72?c=${encodeURIComponent(brandfetchClientId)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMarkerElement(featureProps: any): HTMLElement {
  const sectorColor =
    SECTOR_COLORS[featureProps.sector as keyof typeof SECTOR_COLORS] ||
    SECTOR_COLOR_DEFAULT

  // Outer wrapper — Mapbox writes its translate3d() positioning to this element.
  // Don't touch its `transform` style, or the marker will jump to the map origin.
  const el = document.createElement('div')
  el.style.cssText = 'width: 36px; height: 36px; cursor: pointer;'

  // Inner element holds the visuals + hover transforms.
  const inner = document.createElement('div')
  inner.style.cssText = `
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
    border: 2px solid ${sectorColor};
    background-color: ${sectorColor};
    overflow: hidden;
    transition: transform 120ms ease, box-shadow 120ms ease;
    display: flex; align-items: center; justify-content: center;
  `
  el.addEventListener('mouseenter', () => {
    inner.style.transform = 'scale(1.12)'
    inner.style.boxShadow = '0 3px 8px rgba(0,0,0,0.35)'
    el.style.zIndex = '1'
  })
  el.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1)'
    inner.style.boxShadow = '0 2px 5px rgba(0,0,0,0.25)'
    el.style.zIndex = ''
  })

  const domain = domainFromUrl(featureProps.website)
  if (domain && brandfetchClientId) {
    const img = document.createElement('img')
    img.src = logoUrl(domain)
    img.alt = String(featureProps.name ?? '')
    img.loading = 'lazy'
    img.style.cssText =
      'width: 100%; height: 100%; object-fit: cover; display: block; background-color: #fff;'
    img.onerror = () => {
      img.remove()
    }
    inner.appendChild(img)
  }

  el.appendChild(inner)
  return el
}

function updateMarkers() {
  if (!map || !map.isSourceLoaded('companies')) return

  const features = map.querySourceFeatures('companies', {
    filter: ['!', ['has', 'point_count']],
  })

  const seen = new Set<string>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const f of features as any[]) {
    const id = String(f.properties?.id ?? '')
    if (!id || !f.geometry || f.geometry.type !== 'Point') continue
    seen.add(id)

    if (markersOnScreen.has(id)) continue

    const coords = f.geometry.coordinates as [number, number]
    const el = createMarkerElement(f.properties)
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      const company = props.companies.find((c) => c.id === id)
      if (company) emit('company-selected', company)
    })

    const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map)
    markersOnScreen.set(id, marker)
  }

  // Drop markers no longer present in the source (filtered out, or replaced by a cluster)
  for (const [id, marker] of markersOnScreen.entries()) {
    if (!seen.has(id)) {
      marker.remove()
      markersOnScreen.delete(id)
    }
  }
}

onMounted(async () => {
  mapboxgl = (await import('mapbox-gl')).default
  mapboxgl.accessToken = config.public.mapboxToken

  map = new mapboxgl.Map({
    container: mapContainer.value!,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [-111.093, 39.32],
    zoom: 6.5,
  })

  map.on('load', () => {
    addCompaniesLayer()
  })

  // Sync HTML markers on every render frame the source is loaded for.
  // This is the standard Mapbox pattern for "HTML markers + clustering".
  map.on('render', updateMarkers)
})

function buildGeoJson() {
  return {
    type: 'FeatureCollection',
    features: props.companies
      .filter((c) => c.lat != null && c.lng != null)
      .map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng!, c.lat!] },
        properties: {
          id: c.id,
          name: c.name,
          sector: c.sector,
          stage: c.stage,
          is_hiring: c.is_hiring,
          description: c.description,
          website: c.website,
        },
      })),
  }
}

function addCompaniesLayer() {
  const geojson = buildGeoJson()

  if (map.getSource('companies')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(map.getSource('companies') as any).setData(geojson)
    return
  }

  map.addSource('companies', {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 12,
    clusterRadius: 50,
  })

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'companies',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#009d4e',
        10,
        '#175944',
        30,
        '#ffae00',
      ],
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
    },
  })

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'companies',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 12,
    },
    paint: { 'text-color': '#ffffff' },
  })

  // Click on cluster to zoom in
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.on('click', 'clusters', (e: any) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    const clusterId = features[0].properties.cluster_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(map.getSource('companies') as any).getClusterExpansionZoom(
      clusterId,
      (err: Error | null, zoom: number) => {
        if (err) return
        map.easeTo({ center: features[0].geometry.coordinates, zoom })
      },
    )
  })

  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = ''
  })
}

watch(
  () => props.companies,
  () => {
    if (map?.loaded()) addCompaniesLayer()
  },
  { deep: true },
)

function flyToCompany(lat: number, lng: number) {
  if (map) map.flyTo({ center: [lng, lat], zoom: 13, duration: 800 })
}

defineExpose({ flyToCompany })

onUnmounted(() => {
  for (const marker of markersOnScreen.values()) marker.remove()
  markersOnScreen.clear()
  map?.remove()
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-full" />
</template>
