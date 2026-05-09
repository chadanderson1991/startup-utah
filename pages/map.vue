<script setup lang="ts">
import type { Company, CompanyFilters } from '~/types/company'
import type { UserProfile } from '~/types/profile'

useSeoMeta({
  title: 'Startup Map · Startup State Utah',
  description: 'Explore Utah\'s startup landscape on an interactive map.',
})

definePageMeta({ layout: 'map' })

// ── Company state ─────────────────────────────────────────────────────────────
const { companies, filters, isLoading, selectedCompany, fetchCompanies, selectCompany } =
  useCompanies()

onMounted(() => {
  fetchCompanies()
})

function onFiltersUpdate(newFilters: CompanyFilters) {
  filters.value = newFilters
  fetchCompanies()
}

const startupMapRef = ref()

function onCompanySelected(company: Company | null) {
  selectCompany(company)
  if (company) {
    sidebarOpen.value = true
    if (company.lat != null && company.lng != null) {
      startupMapRef.value?.flyToCompany(company.lat, company.lng)
    }
  }
}

// ── Sidebar collapse ──────────────────────────────────────────────────────────
const sidebarOpen = ref(true)

// ── Auth / profile ────────────────────────────────────────────────────────────
const user = useSupabaseUser()

const { data: profile } = user.value
  ? await useFetch<UserProfile>('/api/profile')
  : { data: ref(null) }

const isInvestor = computed(() => profile.value?.profile_type === 'investor')

// ── Watchlist ─────────────────────────────────────────────────────────────────
const { fetchWatchlist, toggleWatchlist, isWatchlisted } = useWatchlist()

onMounted(async () => {
  if (isInvestor.value) {
    await fetchWatchlist()
  }
})

// ── Stats ─────────────────────────────────────────────────────────────────────
const { data: stats } = await useFetch('/api/companies/stats')
</script>

<template>
  <div class="absolute inset-0">

    <!-- Map: fills full screen behind all overlays -->
    <div class="absolute inset-0">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center"
        style="background: rgba(255,255,255,0.6)"
      >
        <div class="flex items-center gap-2 text-gray-600">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
          <span>Loading companies...</span>
        </div>
      </div>

      <ClientOnly>
        <MapStartupMap
          ref="startupMapRef"
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
    </div>

    <!-- Sidebar — filters or company profile -->
    <aside
      class="absolute left-0 bottom-0 z-20 overflow-y-auto transition-transform duration-150"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      style="top: 104px; width: 288px; background-color: var(--brand-navy); border-right: 1px solid rgba(255,255,255,0.08)"
    >
      <MapCompanySidebar
        v-if="selectedCompany"
        :company="selectedCompany"
        :is-investor="isInvestor"
        :is-watchlisted="isWatchlisted(selectedCompany.id)"
        @close="selectCompany(null)"
        @toggle-watchlist="toggleWatchlist"
      />
      <MapFilters
        v-else
        :model-value="filters"
        :count="companies.length"
        :companies="companies"
        @update:filters="onFiltersUpdate"
        @company-selected="onCompanySelected"
      />
    </aside>

    <!-- Sidebar toggle button — centered vertically in the sidebar area -->
    <div
      class="absolute z-20 flex items-center pointer-events-none transition-all duration-150"
      :style="sidebarOpen
        ? 'top: 104px; bottom: 0; left: 288px'
        : 'top: 104px; bottom: 0; left: 0'"
    >
      <button
        class="pointer-events-auto rounded-r-lg p-1.5 flex items-center justify-center"
        style="background-color: var(--brand-navy); border: 1px solid rgba(255,255,255,0.15); border-left: none"
        :aria-label="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
        @click="sidebarOpen = !sidebarOpen"
      >
        <UIcon
          :name="sidebarOpen ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
          class="w-4 h-4 text-white"
        />
      </button>
    </div>

    <!-- Stats overlay (bottom-left) — hidden for now
    <div class="absolute bottom-4 left-4 z-10 pointer-events-auto" style="top: auto">
      <MapStatsOverlay :stats="(stats as any)" />
    </div>
    -->

  </div>
</template>
