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

const truncatedDescription = computed(() => {
  if (!props.company.description) return null
  if (props.company.description.length <= 200) return props.company.description
  return props.company.description.slice(0, 197) + '...'
})

const sectorAccentColor = computed(() => {
  return SECTOR_COLORS[props.company.sector ?? ''] ?? SECTOR_COLOR_DEFAULT
})
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
    style="width: 320px"
  >
    <!-- Sector color accent bar -->
    <div
      class="h-1 w-full"
      :style="{ backgroundColor: sectorAccentColor }"
    />

    <!-- Header -->
    <div class="flex items-start justify-between p-4 pb-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="font-bold text-gray-900 text-base leading-tight truncate">
            {{ company.name }}
          </h3>
          <UBadge
            v-if="company.is_verified"
            color="green"
            variant="subtle"
            size="xs"
            icon="i-heroicons-check-badge-20-solid"
          >
            Verified
          </UBadge>
        </div>
        <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <UBadge v-if="company.sector" color="blue" variant="subtle" size="xs">
            {{ company.sector }}
          </UBadge>
          <UBadge v-if="company.stage" color="violet" variant="subtle" size="xs">
            {{ company.stage }}
          </UBadge>
          <UBadge
            v-if="company.is_hiring"
            color="green"
            variant="solid"
            size="xs"
          >
            Hiring
          </UBadge>
        </div>
      </div>
      <UButton
        icon="i-heroicons-x-mark"
        size="xs"
        variant="ghost"
        color="gray"
        class="shrink-0 ml-2"
        @click="emit('close')"
      />
    </div>

    <!-- Body -->
    <div class="px-4 pb-4 flex flex-col gap-3">
      <p v-if="truncatedDescription" class="text-sm text-gray-600 leading-relaxed">
        {{ truncatedDescription }}
      </p>

      <div v-if="company.employee_range" class="flex items-center gap-1.5 text-sm text-gray-500">
        <UIcon name="i-heroicons-users-20-solid" class="w-4 h-4 shrink-0" />
        <span>{{ company.employee_range }} employees</span>
      </div>

      <UButton
        :to="`/company/${company.id}`"
        size="sm"
        color="primary"
        block
        trailing-icon="i-heroicons-arrow-right-20-solid"
      >
        View Full Profile
      </UButton>

      <!-- Watchlist button — visible to investors only -->
      <button
        v-if="isInvestor"
        class="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
        :class="isWatchlisted
          ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        @click="emit('toggle-watchlist', company.id)"
      >
        <UIcon
          :name="isWatchlisted ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
          class="w-4 h-4 shrink-0"
        />
        {{ isWatchlisted ? 'Saved' : 'Save to Watchlist' }}
      </button>
    </div>
  </div>
</template>
