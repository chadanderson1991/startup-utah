<script setup lang="ts">
import type { Resource } from '~/types/resource'

defineProps<{
  resources: Resource[]
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <!-- Loading skeletons -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="n in 6"
        :key="n"
        class="rounded-xl bg-white shadow-sm h-52 animate-pulse"
        style="border: 1px solid #e5e7eb;"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!resources.length"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style="background-color: #eff8f3"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="w-7 h-7" style="color: var(--brand-green)" />
      </div>
      <p class="text-lg font-semibold text-white mb-1">No resources match your filters</p>
      <p class="text-sm max-w-sm" style="color: #a8b2d1">
        Try broadening your search or ask the Navigator chatbot for personalized help.
      </p>
    </div>

    <!-- Results -->
    <div v-else>
      <p class="text-sm mb-4" style="color: #a8b2d1">
        Showing <span class="font-semibold text-white">{{ resources.length }}</span>
        {{ resources.length === 1 ? 'resource' : 'resources' }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavigatorResourceCard
          v-for="resource in resources"
          :key="resource.id"
          :resource="resource"
        />
      </div>
    </div>
  </div>
</template>
