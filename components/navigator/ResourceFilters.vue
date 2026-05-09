<script setup lang="ts">
import { COMMUNITIES, INDUSTRIES, UTAH_COUNTIES, TOPICS } from '~/lib/constants'
import type { ResourceFilters } from '~/types/resource'

const props = defineProps<{ modelValue: ResourceFilters }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: ResourceFilters): void
  (e: 'download-filtered'): void
  (e: 'download-all'): void
}>()

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('update:modelValue', { ...props.modelValue, search: value })
  }, 300)
}

function updateFilter<K extends keyof ResourceFilters>(key: K, value: ResourceFilters[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const activeFilterCount = computed(() => {
  let count = 0
  if (props.modelValue.search) count++
  if (props.modelValue.communities.length) count++
  if (props.modelValue.industries.length) count++
  if (props.modelValue.locations.length) count++
  if (props.modelValue.topics.length) count++
  return count
})

function clearAll() {
  if (searchTimer) clearTimeout(searchTimer)
  emit('update:modelValue', { search: '', communities: [], industries: [], locations: [], topics: [] })
}

const communityOptions = COMMUNITIES.filter(c => c !== 'Any')
</script>

<template>
  <div class="py-3 flex flex-wrap items-center gap-2">
    <!-- Search -->
    <div class="min-w-[180px] flex-1">
      <UInput
        :model-value="modelValue.search"
        placeholder="Search resources..."
        icon="i-heroicons-magnifying-glass-20-solid"
        size="sm"
        @input="onSearchInput(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Community -->
    <USelectMenu
      :model-value="modelValue.communities"
      :options="communityOptions"
      multiple
      placeholder="Community"
      size="sm"
      class="min-w-[130px]"
      @update:model-value="updateFilter('communities', $event)"
    />

    <!-- Industry -->
    <USelectMenu
      :model-value="modelValue.industries"
      :options="INDUSTRIES"
      multiple
      placeholder="Industry"
      size="sm"
      class="min-w-[130px]"
      @update:model-value="updateFilter('industries', $event)"
    />

    <!-- County -->
    <USelectMenu
      :model-value="modelValue.locations"
      :options="UTAH_COUNTIES"
      multiple
      placeholder="County"
      size="sm"
      searchable
      class="min-w-[120px]"
      @update:model-value="updateFilter('locations', $event)"
    />

    <!-- Topic -->
    <USelectMenu
      :model-value="modelValue.topics"
      :options="TOPICS"
      multiple
      placeholder="Topic"
      size="sm"
      class="min-w-[120px]"
      @update:model-value="updateFilter('topics', $event)"
    />

    <!-- Download -->
    <UDropdown
      :items="[
        [
          { label: 'Download filtered list', icon: 'i-heroicons-funnel-20-solid', click: () => emit('download-filtered') },
          { label: 'Download full list', icon: 'i-heroicons-arrow-down-tray-20-solid', click: () => emit('download-all') },
        ],
      ]"
      :popper="{ placement: 'bottom-end' }"
    >
      <UButton
        variant="outline"
        color="gray"
        size="sm"
        icon="i-heroicons-arrow-down-tray-20-solid"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      >
        Download
      </UButton>
    </UDropdown>

    <!-- Active filter badge + clear -->
    <div v-if="activeFilterCount > 0" class="flex items-center gap-2 shrink-0">
      <span
        class="text-xs font-semibold px-2 py-0.5 rounded-full"
        style="background-color: var(--brand-green-bright); color: #052e16"
      >
        {{ activeFilterCount }} active
      </span>
      <button
        class="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>
  </div>
</template>
