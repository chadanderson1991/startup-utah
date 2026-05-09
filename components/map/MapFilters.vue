<script setup lang="ts">
import { SECTORS, STAGES, EMPLOYEE_RANGES } from '~/lib/constants'
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'
import type { CompanyFilters, Company } from '~/types/company'

const props = defineProps<{
  modelValue: CompanyFilters
  count: number
  companies: Company[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', value: CompanyFilters): void
  (e: 'company-selected', company: Company): void
}>()

function update<K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) {
  emit('update:filters', { ...props.modelValue, [key]: value })
}

const activeFilterCount = computed(() => {
  let n = 0
  if (props.modelValue.search) n++
  if (props.modelValue.sectors.length) n++
  if (props.modelValue.stages.length) n++
  if (props.modelValue.employee_ranges.length) n++
  if (props.modelValue.is_hiring !== null) n++
  return n
})

function clearAll() {
  emit('update:filters', { search: '', sectors: [], stages: [], employee_ranges: [], is_hiring: null })
}

const selectUi = {
  base: 'bg-white/10 text-white border-white/20 focus:border-white/40',
  placeholder: 'text-white/40',
  icon: { trailing: { name: 'i-heroicons-chevron-down-20-solid' } },
}
</script>

<template>
  <div class="flex flex-col h-full">

    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-3 shrink-0" style="background-color: rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.1)">
      <UIcon name="i-heroicons-funnel-20-solid" class="w-4 h-4 text-white" />
      <span class="text-white font-semibold text-sm">Filter Companies</span>
      <span
        v-if="activeFilterCount > 0"
        class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1"
      >
        {{ activeFilterCount }}
      </span>
    </div>

    <!-- Scrollable body -->
    <div class="overflow-y-auto flex-1 p-4 flex flex-col gap-4">

      <!-- Add company -->
      <NuxtLink
        to="/company/new"
        class="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-colors"
        style="color:#a8b2d1; border: 1px dashed rgba(255,255,255,0.2)"
      >
        <UIcon name="i-heroicons-plus-circle-20-solid" class="w-4 h-4" />
        Add your company
      </NuxtLink>

      <!-- Search -->
      <UInput
        :model-value="modelValue.search"
        placeholder="Search by name..."
        icon="i-heroicons-magnifying-glass-20-solid"
        size="sm"
        :ui="{ base: 'bg-white/10 text-white placeholder-white/40 border-white/20 focus:border-white/40' }"
        @update:model-value="update('search', $event)"
      />

      <!-- Sector -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Sector</span>
        <USelectMenu
          :model-value="modelValue.sectors"
          :options="SECTORS"
          multiple
          placeholder="All sectors"
          size="sm"
          :ui="selectUi"
          @update:model-value="update('sectors', $event)"
        />
      </div>

      <!-- Stage -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Stage</span>
        <USelectMenu
          :model-value="modelValue.stages"
          :options="STAGES"
          multiple
          placeholder="All stages"
          size="sm"
          :ui="selectUi"
          @update:model-value="update('stages', $event)"
        />
      </div>

      <!-- Team Size -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Team Size</span>
        <USelectMenu
          :model-value="modelValue.employee_ranges"
          :options="EMPLOYEE_RANGES"
          multiple
          placeholder="Any size"
          size="sm"
          :ui="selectUi"
          @update:model-value="update('employee_ranges', $event)"
        />
      </div>

      <!-- Hiring Now -->
      <div
        class="flex items-center justify-between py-2 px-3 rounded-lg border"
        style="background-color:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15)"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-briefcase-20-solid" class="w-4 h-4" style="color: var(--brand-green-bright)" />
          <span class="text-sm font-medium text-white">Hiring Now</span>
        </div>
        <UToggle
          :model-value="modelValue.is_hiring === true"
          color="green"
          @update:model-value="update('is_hiring', $event ? true : null)"
        />
      </div>

      <!-- Clear all -->
      <button
        v-if="activeFilterCount > 0"
        class="w-full text-xs py-1.5 rounded-lg transition-colors"
        style="color:#a8b2d1;border:1px dashed rgba(255,255,255,0.2)"
        @click="clearAll"
      >
        Clear all filters
      </button>

      <!-- Company list -->
      <div v-if="companies.length" class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Companies</span>
          <span class="text-xs" style="color: #a8b2d1">
            <span class="font-semibold text-white">{{ count }}</span>
            {{ count === 1 ? 'result' : 'results' }}
          </span>
        </div>
        <button
          v-for="company in companies"
          :key="company.id"
          class="w-full text-left rounded-lg p-3 transition-colors hover:bg-gray-50"
          style="background-color: #ffffff; border: 1px solid #e5e7eb;"
          @click="emit('company-selected', company)"
        >
          <div class="flex items-start gap-2">
            <div
              class="w-1 self-stretch rounded-full shrink-0"
              :style="{ backgroundColor: SECTOR_COLORS[company.sector ?? ''] ?? SECTOR_COLOR_DEFAULT }"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <span class="text-gray-900 text-sm font-semibold truncate">{{ company.name }}</span>
                <UIcon name="i-heroicons-chevron-right-20-solid" class="w-4 h-4 shrink-0 text-gray-400" />
              </div>
              <div v-if="company.sector || company.stage || company.is_hiring" class="flex flex-wrap gap-1 mt-1">
                <UBadge v-if="company.sector" color="blue" variant="subtle" size="xs">{{ company.sector }}</UBadge>
                <UBadge v-if="company.stage" color="violet" variant="subtle" size="xs">{{ company.stage }}</UBadge>
                <UBadge v-if="company.is_hiring" color="green" variant="solid" size="xs">Hiring</UBadge>
              </div>
              <div v-if="company.city" class="flex items-center gap-1 mt-1 text-gray-500">
                <UIcon name="i-heroicons-map-pin-20-solid" class="w-3 h-3 shrink-0" />
                <span class="text-xs truncate">{{ company.city }}</span>
              </div>
            </div>
          </div>
        </button>
      </div>

    </div>
  </div>
</template>
