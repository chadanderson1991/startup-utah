<script setup lang="ts">
import type { Resource } from '~/types/resource'

defineProps<{
  resources: Resource[]
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <USkeleton
        v-for="n in 6"
        :key="n"
        class="h-52 rounded-lg"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!resources.length"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon name="i-heroicons-magnifying-glass" class="w-12 h-12 text-gray-300 mb-4" />
      <p class="text-gray-500 text-lg font-medium mb-1">No resources match your filters</p>
      <p class="text-gray-400 text-sm max-w-sm">
        Try broadening your search or ask the Navigator chatbot for personalized help.
      </p>
    </div>

    <!-- Results -->
    <div v-else>
      <p class="text-sm text-gray-500 mb-4">
        Showing <span class="font-medium text-gray-800">{{ resources.length }}</span>
        {{ resources.length === 1 ? 'resource' : 'resources' }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavigatorResourceCard
          v-for="resource in resources"
          :key="resource.id"
          :resource="resource"
        />
      </div>
    </div>
  </div>
</template>
