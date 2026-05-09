<script setup lang="ts">
import type { ResourceFilters } from '~/types/resource'

useSeoMeta({
  title: 'Find Your Resources · Startup State Utah',
  description: 'Browse 200+ Utah state resources for founders and entrepreneurs.',
})

const { resources, filters, isLoading, filteredCount, fetchResources } = useResources()

onMounted(() => {
  fetchResources()
})

function onFiltersUpdate(newFilters: ResourceFilters) {
  filters.value = newFilters
  fetchResources()
}
</script>

<template>
  <div>
    <!-- Page header -->
    <section class="bg-white border-b border-gray-200 px-4 py-10">
      <UContainer class="max-w-7xl">
        <h1 class="text-3xl font-extrabold text-gray-900">Find Your Resources</h1>
        <p class="text-gray-500 mt-1.5 max-w-xl">
          Browse state programs, funding sources, and support services tailored
          to Utah entrepreneurs.
        </p>
      </UContainer>
    </section>

    <!-- Content -->
    <UContainer class="max-w-7xl py-8 px-4">
      <div class="flex gap-8">
        <!-- Filters sidebar -->
        <div class="hidden md:block w-64 shrink-0">
          <NavigatorResourceFilters
            :model-value="filters"
            @update:model-value="onFiltersUpdate"
          />
        </div>

        <!-- Results -->
        <div class="flex-1 min-w-0">
          <NavigatorResourceGrid
            :resources="resources"
            :is-loading="isLoading"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
