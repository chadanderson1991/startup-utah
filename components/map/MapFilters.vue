<script setup lang="ts">
import { SECTORS, STAGES, EMPLOYEE_RANGES } from '~/lib/constants'
import type { CompanyFilters } from '~/types/company'

const props = defineProps<{
  modelValue: CompanyFilters
  count: number
}>()
const emit = defineEmits<{
  (e: 'update:filters', value: CompanyFilters): void
}>()

function update<K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) {
  emit('update:filters', { ...props.modelValue, [key]: value })
}

function toggleChip(key: 'sectors' | 'stages' | 'employee_ranges', value: string) {
  const current = props.modelValue[key] as string[]
  const next = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  update(key, next)
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

// Inline styles — safe from Tailwind JIT purging
const sectorStyle: Record<string, { bg: string; text: string }> = {
  'B2B Software':     { bg: '#eff6ff', text: '#1d4ed8' },
  'FinTech':          { bg: '#f0fdf4', text: '#15803d' },
  'Security':         { bg: '#fef2f2', text: '#b91c1c' },
  'Bio/Medical Tech': { bg: '#faf5ff', text: '#7e22ce' },
  'Energy':           { bg: '#fefce8', text: '#a16207' },
  'Consumer':         { bg: '#fdf2f8', text: '#be185d' },
  'Marketplaces':     { bg: '#f0fdfa', text: '#0f766e' },
}

const sectorActiveStyle: Record<string, { bg: string; text: string }> = {
  'B2B Software':     { bg: '#2563eb', text: '#ffffff' },
  'FinTech':          { bg: '#16a34a', text: '#ffffff' },
  'Security':         { bg: '#dc2626', text: '#ffffff' },
  'Bio/Medical Tech': { bg: '#9333ea', text: '#ffffff' },
  'Energy':           { bg: '#ca8a04', text: '#ffffff' },
  'Consumer':         { bg: '#db2777', text: '#ffffff' },
  'Marketplaces':     { bg: '#0d9488', text: '#ffffff' },
}

const sectorIcons: Record<string, string> = {
  'B2B Software':     'i-heroicons-code-bracket-20-solid',
  'FinTech':          'i-heroicons-banknotes-20-solid',
  'Security':         'i-heroicons-shield-check-20-solid',
  'Bio/Medical Tech': 'i-heroicons-heart-20-solid',
  'Energy':           'i-heroicons-bolt-20-solid',
  'Consumer':         'i-heroicons-shopping-bag-20-solid',
  'Marketplaces':     'i-heroicons-squares-2x2-20-solid',
}

const stageStyle: Record<string, { bg: string; text: string; border: string }> = {
  'Pre-Seed':    { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' },
  'Seed':        { bg: '#f7fee7', text: '#4d7c0f', border: '#bef264' },
  'Bootstrapped':{ bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  'Series A':    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Series B':    { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
  'Series C':    { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  'Series D+':   { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' },
}

const stageActiveStyle: Record<string, { bg: string; text: string; border: string }> = {
  'Pre-Seed':    { bg: '#4b5563', text: '#ffffff', border: '#4b5563' },
  'Seed':        { bg: '#65a30d', text: '#ffffff', border: '#65a30d' },
  'Bootstrapped':{ bg: '#d97706', text: '#ffffff', border: '#d97706' },
  'Series A':    { bg: '#2563eb', text: '#ffffff', border: '#2563eb' },
  'Series B':    { bg: '#4f46e5', text: '#ffffff', border: '#4f46e5' },
  'Series C':    { bg: '#7c3aed', text: '#ffffff', border: '#7c3aed' },
  'Series D+':   { bg: '#7e22ce', text: '#ffffff', border: '#7e22ce' },
}

function sectorChipStyle(sector: string, active: boolean) {
  const s = active ? sectorActiveStyle[sector] : sectorStyle[sector]
  return s ? `background-color:${s.bg};color:${s.text};border-color:transparent` : ''
}

function stageChipStyle(stage: string, active: boolean) {
  const s = active ? stageActiveStyle[stage] : stageStyle[stage]
  return s ? `background-color:${s.bg};color:${s.text};border-color:${s.border}` : ''
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
    <div class="overflow-y-auto flex-1 p-4 flex flex-col gap-5">

      <!-- Count -->
      <p class="text-xs" style="color: #a8b2d1">
        Showing <span class="font-semibold text-white">{{ count }}</span>
        {{ count === 1 ? 'company' : 'companies' }}
      </p>

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
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Sector</span>
          <button
            v-if="modelValue.sectors.length"
            class="text-xs transition-colors"
            style="color: #a8b2d1"
            @click="update('sectors', [])"
          >
            clear
          </button>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="sector in SECTORS"
            :key="sector"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 text-left"
            :style="sectorChipStyle(sector, modelValue.sectors.includes(sector))"
            @click="toggleChip('sectors', sector)"
          >
            <UIcon :name="sectorIcons[sector] || 'i-heroicons-tag-20-solid'" class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{{ sector }}</span>
          </button>
        </div>
      </div>

      <!-- Stage -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Stage</span>
          <button
            v-if="modelValue.stages.length"
            class="text-xs transition-colors"
            style="color: #a8b2d1"
            @click="update('stages', [])"
          >
            clear
          </button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="stage in STAGES"
            :key="stage"
            class="px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150"
            :style="stageChipStyle(stage, modelValue.stages.includes(stage))"
            @click="toggleChip('stages', stage)"
          >
            {{ stage }}
          </button>
        </div>
      </div>

      <!-- Team Size -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wide" style="color: #a8b2d1">Team Size</span>
          <button
            v-if="modelValue.employee_ranges.length"
            class="text-xs transition-colors"
            style="color: #a8b2d1"
            @click="update('employee_ranges', [])"
          >
            clear
          </button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="range in EMPLOYEE_RANGES"
            :key="range"
            class="px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150"
            :style="modelValue.employee_ranges.includes(range)
              ? 'background-color:#ffffff;color:#0d192d;border-color:#ffffff'
              : 'background-color:rgba(255,255,255,0.08);color:#a8b2d1;border-color:rgba(255,255,255,0.15)'"
            @click="toggleChip('employee_ranges', range)"
          >
            {{ range }}
          </button>
        </div>
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

      <!-- Add company -->
      <div class="mt-auto pt-3" style="border-top: 1px solid rgba(255,255,255,0.1)">
        <NuxtLink
          to="/company/new"
          class="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-colors"
          style="color:#a8b2d1"
        >
          <UIcon name="i-heroicons-plus-circle-20-solid" class="w-4 h-4" />
          Add your company
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
