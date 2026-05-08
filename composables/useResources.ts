import { ref, computed } from 'vue'
import type { Resource, ResourceFilters } from '~/types/resource'

const defaultFilters = (): ResourceFilters => ({
  search: '',
  communities: [],
  industries: [],
  locations: [],
  topics: [],
})

export const useResources = () => {
  const resources = ref<Resource[]>([])
  const filters = ref<ResourceFilters>(defaultFilters())
  const isLoading = ref(false)

  const filteredCount = computed(() => resources.value.length)

  async function fetchResources() {
    isLoading.value = true
    try {
      const query: Record<string, string> = {}

      if (filters.value.search) query.search = filters.value.search
      if (filters.value.communities.length)
        query.communities = filters.value.communities.join(',')
      if (filters.value.industries.length)
        query.industries = filters.value.industries.join(',')
      if (filters.value.locations.length)
        query.locations = filters.value.locations.join(',')
      if (filters.value.topics.length)
        query.topics = filters.value.topics.join(',')

      resources.value = await $fetch<Resource[]>('/api/resources', { query })
    } catch (err) {
      console.error('Failed to fetch resources:', err)
      resources.value = []
    } finally {
      isLoading.value = false
    }
  }

  function setFilter<K extends keyof ResourceFilters>(key: K, value: ResourceFilters[K]) {
    filters.value[key] = value
    fetchResources()
  }

  function clearFilters() {
    filters.value = defaultFilters()
    fetchResources()
  }

  return {
    resources,
    filters,
    isLoading,
    filteredCount,
    fetchResources,
    setFilter,
    clearFilters,
  }
}
