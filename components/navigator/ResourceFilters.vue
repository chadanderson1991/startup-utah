<script setup lang="ts">
import { COMMUNITIES, INDUSTRIES, UTAH_COUNTIES, TOPICS } from '~/lib/constants'
import type { ResourceFilters } from '~/types/resource'

const props = defineProps<{ modelValue: ResourceFilters }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: ResourceFilters): void
}>()

// Debounce for search input
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('update:modelValue', { ...props.modelValue, search: value })
  }, 300)
}

function onSearchChange(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  emit('update:modelValue', { ...props.modelValue, search: value })
}

function updateFilter<K extends keyof ResourceFilters>(
  key: K,
  value: ResourceFilters[K],
) {
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
  emit('update:modelValue', {
    search: '',
    communities: [],
    industries: [],
    locations: [],
    topics: [],
  })
}
</script>

<template>
  <aside class="sticky top-4 flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-800">Filters</span>
        <UBadge
          v-if="activeFilterCount > 0"
          color="primary"
          variant="solid"
          size="xs"
        >
          {{ activeFilterCount }}
        </UBadge>
      </div>
      <UButton
        v-if="activeFilterCount > 0"
        variant="ghost"
        size="xs"
        color="gray"
        @click="clearAll"
      >
        Clear all
      </UButton>
    </div>

    <!-- Search -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <UInput
        :model-value="modelValue.search"
        placeholder="Search resources..."
        icon="i-heroicons-magnifying-glass-20-solid"
        @input="onSearchInput(($event.target as HTMLInputElement).value)"
        @change="onSearchChange(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Communities -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Community</label>
      <USelectMenu
        :model-value="modelValue.communities"
        :options="COMMUNITIES"
        multiple
        placeholder="Any community"
        @update:model-value="updateFilter('communities', $event)"
      />
    </div>

    <!-- Industries -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Industry</label>
      <USelectMenu
        :model-value="modelValue.industries"
        :options="INDUSTRIES"
        multiple
        placeholder="Any industry"
        @update:model-value="updateFilter('industries', $event)"
      />
    </div>

    <!-- Locations (Utah Counties) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">County</label>
      <USelectMenu
        :model-value="modelValue.locations"
        :options="UTAH_COUNTIES"
        multiple
        placeholder="Any county"
        searchable
        @update:model-value="updateFilter('locations', $event)"
      />
    </div>

    <!-- Topics -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
      <USelectMenu
        :model-value="modelValue.topics"
        :options="TOPICS"
        multiple
        placeholder="Any topic"
        @update:model-value="updateFilter('topics', $event)"
      />
    </div>
  </aside>
</template>
