<script setup lang="ts">
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'
import type { Company } from '~/types/company'

const props = defineProps<{
  company: Company
  isInvestor?: boolean
  isWatchlisted?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle-watchlist', companyId: string): void
}>()

const sectorColor = computed(() => SECTOR_COLORS[props.company.sector ?? ''] ?? SECTOR_COLOR_DEFAULT)

const config = useRuntimeConfig()
const brandfetchClientId = config.public.brandfetchClientId as string

const logoUrl = computed(() => {
  if (!props.company.website || !brandfetchClientId) return null
  const domain = props.company.website.replace(/^https?:\/\//, '').split('/')[0]
  return `https://cdn.brandfetch.io/${encodeURIComponent(domain)}/w/128/h/128?c=${encodeURIComponent(brandfetchClientId)}`
})

const logoVisible = ref(true)

watch(() => props.company.id, () => { logoVisible.value = true })
</script>

<template>
  <div class="flex flex-col h-full">

    <!-- Header -->
    <div
      class="shrink-0 px-4 py-3 flex items-center gap-2"
      style="background-color: rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.1)"
    >
      <button
        class="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
        @click="emit('close')"
      >
        <UIcon name="i-heroicons-arrow-left-20-solid" class="w-4 h-4" />
        Back to filters
      </button>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

      <!-- Sector accent + name -->
      <div>
        <div class="h-1 w-12 rounded-full mb-3" :style="{ backgroundColor: sectorColor }" />
        <div class="flex flex-col gap-2">
          <img
            v-if="logoUrl && logoVisible"
            :src="logoUrl"
            :alt="`${company.name} logo`"
            class="w-14 h-14 rounded-xl object-contain"
            style="background-color: rgba(255,255,255,0.08)"
            @error="logoVisible = false"
          />
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-white font-bold text-lg leading-snug">{{ company.name }}</h2>
            <UBadge
              v-if="company.is_verified"
              color="green"
              variant="subtle"
              size="xs"
              icon="i-heroicons-check-badge-20-solid"
              class="shrink-0 mt-0.5"
            >
              Verified
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="flex flex-wrap gap-1.5">
        <UBadge v-if="company.sector" color="blue" variant="subtle" size="xs">{{ company.sector }}</UBadge>
        <UBadge v-if="company.stage" color="violet" variant="subtle" size="xs">{{ company.stage }}</UBadge>
        <UBadge v-if="company.is_hiring" color="green" variant="solid" size="xs">Hiring</UBadge>
      </div>

      <!-- Description -->
      <p v-if="company.description" class="text-sm leading-relaxed" style="color: #c8d0e7">
        {{ company.description }}
      </p>

      <!-- Meta -->
      <div class="flex flex-col gap-2">
        <div v-if="company.employee_range" class="flex items-center gap-2 text-sm" style="color: #a8b2d1">
          <UIcon name="i-heroicons-users-20-solid" class="w-4 h-4 shrink-0" />
          <span>{{ company.employee_range }} employees</span>
        </div>
        <div v-if="company.city" class="flex items-center gap-2 text-sm" style="color: #a8b2d1">
          <UIcon name="i-heroicons-map-pin-20-solid" class="w-4 h-4 shrink-0" />
          <span>{{ company.city }}</span>
        </div>
        <div v-if="company.year_founded" class="flex items-center gap-2 text-sm" style="color: #a8b2d1">
          <UIcon name="i-heroicons-calendar-20-solid" class="w-4 h-4 shrink-0" />
          <span>Founded {{ company.year_founded }}</span>
        </div>
      </div>

      <!-- Links -->
      <div class="flex flex-col gap-2">
        <a
          v-if="company.website"
          :href="company.website"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-sm font-medium transition-colors"
          style="color: var(--brand-green-bright)"
        >
          <UIcon name="i-heroicons-globe-alt-20-solid" class="w-4 h-4 shrink-0" />
          <span class="truncate">{{ company.website.replace(/^https?:\/\//, '') }}</span>
        </a>
        <a
          v-if="company.linkedin_url"
          :href="company.linkedin_url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-sm font-medium transition-colors"
          style="color: var(--brand-green-bright)"
        >
          <UIcon name="i-simple-icons-linkedin" class="w-4 h-4 shrink-0" />
          <span>LinkedIn</span>
        </a>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid rgba(255,255,255,0.1)" />

      <!-- Actions -->
      <div class="flex flex-col gap-2">
        <NuxtLink
          :to="`/company/claim/${company.id}`"
          class="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold transition-colors"
          style="background-color: var(--brand-green-bright); color: #0d192d"
        >
          <UIcon name="i-heroicons-flag-20-solid" class="w-4 h-4" />
          Claim this Profile
        </NuxtLink>

        <button
          v-if="isInvestor"
          class="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium border transition-colors"
          :class="isWatchlisted
            ? 'border-green-400 text-green-400 hover:bg-green-400/10'
            : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'"
          @click="emit('toggle-watchlist', company.id)"
        >
          <UIcon
            :name="isWatchlisted ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
            class="w-4 h-4 shrink-0"
          />
          {{ isWatchlisted ? 'Saved to Watchlist' : 'Save to Watchlist' }}
        </button>
      </div>

    </div>
  </div>
</template>
