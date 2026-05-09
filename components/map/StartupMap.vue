<script setup lang="ts">
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'
import type { Company } from '~/types/company'

const props = defineProps<{ companies: Company[] }>()
const emit = defineEmits<{ (e: 'company-selected', company: Company | null): void }>()

const mapContainer = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null

onMounted(async () => {
  const mapboxgl = (await import('mapbox-gl')).default
  const config = useRuntimeConfig()
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

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'companies',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match',
        ['get', 'sector'],
        'B2B Software',     SECTOR_COLORS['B2B Software'],
        'FinTech',          SECTOR_COLORS['FinTech'],
        'Security',         SECTOR_COLORS['Security'],
        'Bio/Medical Tech', SECTOR_COLORS['Bio/Medical Tech'],
        'Energy',           SECTOR_COLORS['Energy'],
        'Consumer',         SECTOR_COLORS['Consumer'],
        'Marketplaces',     SECTOR_COLORS['Marketplaces'],
        SECTOR_COLOR_DEFAULT,
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5,  7,
        14, 10,
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  })

  // Click on individual point
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.on('click', 'unclustered-point', (e: any) => {
    const featureProps = e.features[0].properties
    // Try to find full company object from props list
    const fullCompany = props.companies.find((c) => c.id === featureProps.id)
    emit(
      'company-selected',
      fullCompany ?? ({
        id: featureProps.id,
        name: featureProps.name,
        sector: featureProps.sector,
        stage: featureProps.stage,
        is_hiring: featureProps.is_hiring,
        description: featureProps.description,
      } as Company),
    )
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

  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = ''
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

onUnmounted(() => {
  map?.remove()
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-full" />
</template>
