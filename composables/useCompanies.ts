import { ref } from 'vue'
import type { Company, CompanyFilters } from '~/types/company'

const defaultFilters = (): CompanyFilters => ({
  search: '',
  sectors: [],
  stages: [],
  employee_ranges: [],
  is_hiring: null,
})

export const useCompanies = () => {
  const companies = ref<Company[]>([])
  const filters = ref<CompanyFilters>(defaultFilters())
  const isLoading = ref(false)
  const selectedCompany = ref<Company | null>(null)

  async function fetchCompanies() {
    isLoading.value = true
    try {
      const query: Record<string, string> = {}

      if (filters.value.search) query.search = filters.value.search
      if (filters.value.sectors.length)
        query.sectors = filters.value.sectors.join(',')
      if (filters.value.stages.length)
        query.stages = filters.value.stages.join(',')
      if (filters.value.employee_ranges.length)
        query.employee_ranges = filters.value.employee_ranges.join(',')
      if (filters.value.is_hiring === true) query.is_hiring = 'true'

      companies.value = await $fetch<Company[]>('/api/companies', { query })
    } catch (err) {
      console.error('Failed to fetch companies:', err)
      companies.value = []
    } finally {
      isLoading.value = false
    }
  }

  function setFilter<K extends keyof CompanyFilters>(
    key: K,
    value: CompanyFilters[K],
  ) {
    filters.value[key] = value
    fetchCompanies()
  }

  function clearFilters() {
    filters.value = defaultFilters()
    fetchCompanies()
  }

  function selectCompany(company: Company | null) {
    selectedCompany.value = company
  }

  return {
    companies,
    filters,
    isLoading,
    selectedCompany,
    fetchCompanies,
    setFilter,
    clearFilters,
    selectCompany,
  }
}
