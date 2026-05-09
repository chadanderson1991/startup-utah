<script setup lang="ts">
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'
import type { Company } from '~/types/company'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Saved Companies · Startup State Utah' })

interface WatchlistItem {
  id: string
  company_id: string
  created_at: string
  companies: Company
}

const { toggleWatchlist, isWatchlisted, fetchWatchlist } = useWatchlist()

const { data: watchlistItems, pending, error, refresh } = await useFetch<WatchlistItem[]>('/api/watchlist')

onMounted(async () => {
  await fetchWatchlist()
})

async function handleRemove(companyId: string) {
  await toggleWatchlist(companyId)
  await refresh()
}

function sectorColor(sector: string | null): string {
  if (!sector) return SECTOR_COLOR_DEFAULT
  return SECTOR_COLORS[sector] ?? SECTOR_COLOR_DEFAULT
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="py-14 px-4 text-white"
      style="background-color: var(--brand-navy)"
    >
      <UContainer class="max-w-5xl">
        <NuxtLink
          to="/profile"
          class="inline-flex items-center gap-1 text-sm mb-5 opacity-70 hover:opacity-100 transition-opacity"
          style="color: #a8b2d1"
        >
          <UIcon name="i-heroicons-arrow-left-20-solid" class="w-4 h-4" />
          Back to Profile
        </NuxtLink>
        <h1 class="text-3xl sm:text-4xl font-extrabold leading-tight">
          Your Saved Companies
        </h1>
        <p class="mt-2 text-base" style="color: #a8b2d1">
          Companies you've bookmarked for future reference.
        </p>
      </UContainer>
    </section>

    <!-- Content -->
    <div style="background-color: var(--brand-navy)" class="min-h-screen pb-20">
      <UContainer class="max-w-5xl py-10 px-4">

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <USkeleton v-for="i in 6" :key="i" class="h-36 rounded-xl" />
        </div>

        <!-- Error -->
        <UAlert
          v-else-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          title="Failed to load saved companies"
          description="Please try refreshing the page."
        />

        <!-- Empty state -->
        <div
          v-else-if="!watchlistItems?.length"
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <UIcon name="i-heroicons-bookmark" class="w-16 h-16 mb-4" style="color: rgba(255,255,255,0.4)" />
          <h2 class="text-xl font-bold text-white mb-2">No saved companies yet</h2>
          <p class="max-w-sm mb-6" style="color: #a8b2d1">
            Browse the company map and bookmark companies you want to keep track of.
          </p>
          <UButton to="/map" color="primary">
            Explore Companies
          </UButton>
        </div>

        <!-- Company cards grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in watchlistItems"
            :key="item.id"
            class="relative bg-white rounded-xl overflow-hidden"
            style="border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.07);"
          >
            <!-- Left accent bar colored by sector -->
            <div
              class="absolute top-0 left-0 bottom-0 w-1"
              :style="{ backgroundColor: sectorColor(item.companies.sector) }"
            />

            <div class="pl-5 pr-4 pt-4 pb-4 flex flex-col gap-3 h-full">
              <!-- Company name + badges -->
              <div class="flex-1">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-bold text-gray-900 text-base leading-snug">
                    {{ item.companies.name }}
                  </h3>
                  <!-- Remove bookmark button -->
                  <button
                    type="button"
                    class="shrink-0 p-1 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from saved"
                    @click="handleRemove(item.company_id)"
                  >
                    <UIcon
                      :name="isWatchlisted(item.company_id) ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
                      class="w-5 h-5"
                    />
                  </button>
                </div>

                <!-- Badges row -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span
                    v-if="item.companies.sector"
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    :style="{ backgroundColor: sectorColor(item.companies.sector) }"
                  >
                    {{ item.companies.sector }}
                  </span>
                  <UBadge v-if="item.companies.stage" color="violet" variant="subtle" size="xs">
                    {{ item.companies.stage }}
                  </UBadge>
                  <UBadge v-if="item.companies.is_hiring" color="green" variant="solid" size="xs">
                    Now Hiring
                  </UBadge>
                </div>

                <!-- Description snippet -->
                <p
                  v-if="item.companies.description"
                  class="mt-2 text-sm text-gray-500 line-clamp-2 leading-snug"
                >
                  {{ item.companies.description }}
                </p>
              </div>

              <!-- View Profile link -->
              <NuxtLink
                :to="`/company/${item.company_id}`"
                class="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                style="color: var(--brand-navy)"
              >
                View Profile
                <UIcon name="i-heroicons-arrow-right-20-solid" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>

      </UContainer>
    </div>
  </div>
</template>
