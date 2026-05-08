<script setup lang="ts">
import type { Company, CompanyFilters } from '~/types/company'

useSeoMeta({
  title: 'Startup Map · Startup State Utah',
  description: 'Explore Utah\'s startup landscape on an interactive map.',
})

definePageMeta({ layout: 'map' })

const { companies, filters, isLoading, selectedCompany, fetchCompanies, selectCompany } =
  useCompanies()

onMounted(() => {
  fetchCompanies()
})

function onFiltersUpdate(newFilters: CompanyFilters) {
  filters.value = newFilters
  fetchCompanies()
}

function onCompanySelected(company: Company | null) {
  selectCompany(company)
}
</script>

<template>
  <div class="flex w-full h-full">

    <!-- Filter sidebar -->
    <aside class="w-72 shrink-0 bg-white border-r border-gray-200 overflow-y-auto z-10">
      <MapFilters
        :model-value="filters"
        :count="companies.length"
        @update:filters="onFiltersUpdate"
      />
    </aside>

    <!-- Map area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-60"
      >
        <div class="flex items-center gap-2 text-gray-600">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
          <span>Loading companies...</span>
        </div>
      </div>

      <!-- Mapbox map (browser only) -->
      <ClientOnly>
        <MapStartupMap
          :companies="companies"
          class="w-full h-full"
          @company-selected="onCompanySelected"
        />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-gray-100">
            <p class="text-gray-500">Loading map...</p>
          </div>
        </template>
      </ClientOnly>

      <!-- Company detail popup (top-right overlay on the map) -->
      <div v-if="selectedCompany" class="absolute top-4 right-4 z-20">
        <MapCompanyPopup
          :company="selectedCompany"
          @close="selectCompany(null)"
        />
      </div>
    </div>

  </div>
</template>
