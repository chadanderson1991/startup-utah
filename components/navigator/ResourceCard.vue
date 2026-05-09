<script setup lang="ts">
import type { Resource } from '~/types/resource'

const props = defineProps<{
  resource: Resource
  suggested?: boolean
}>()

const displayIndustries = computed(() => props.resource.industries.slice(0, 2))
const extraIndustriesCount = computed(() => Math.max(0, props.resource.industries.length - 2))
</script>

<template>
  <div
    class="rounded-xl bg-white flex flex-col h-full overflow-hidden transition-shadow duration-200"
    :class="suggested ? 'shadow-md hover:shadow-lg' : 'shadow-sm hover:shadow-md'"
    style="border: 1px solid #e5e7eb;"
  >
    <!-- Top accent bar -->
    <div
      class="h-1 w-full shrink-0"
      :style="suggested
        ? 'background: linear-gradient(to right, var(--brand-green), var(--brand-green-bright))'
        : 'background-color: var(--brand-green)'"
    />

    <div class="p-4 flex flex-col flex-1 gap-3">
      <!-- Title -->
      <h3 class="font-semibold text-base leading-snug">
        <a
          v-if="resource.link"
          :href="resource.link"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-opacity hover:opacity-75"
          style="color: var(--brand-navy)"
        >
          {{ resource.title }}
        </a>
        <span v-else style="color: var(--brand-navy)">{{ resource.title }}</span>
      </h3>

      <!-- Description -->
      <p v-if="resource.description" class="text-sm text-gray-500 line-clamp-3 leading-relaxed">
        {{ resource.description }}
      </p>

      <!-- Topics (green) -->
      <div v-if="resource.topics.length" class="flex flex-wrap gap-1">
        <span
          v-for="t in resource.topics"
          :key="t"
          class="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium"
        >
          {{ t }}
        </span>
      </div>

      <!-- Industries (subtle gray) -->
      <div v-if="displayIndustries.length" class="flex flex-wrap gap-1">
        <span
          v-for="ind in displayIndustries"
          :key="ind"
          class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
        >
          {{ ind }}
        </span>
        <span
          v-if="extraIndustriesCount > 0"
          class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400"
        >
          +{{ extraIndustriesCount }} more
        </span>
      </div>

      <div class="flex-1" />

      <!-- Footer -->
      <div class="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
        <a
          v-if="resource.email"
          :href="`mailto:${resource.email}`"
          class="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
          style="background-color: var(--brand-green-bright); color: #052e16"
        >
          <UIcon name="i-heroicons-envelope-16-solid" class="w-3 h-3" />
          Contact Resource
        </a>
        <span v-else class="flex-1" />

        <a
          v-if="resource.link"
          :href="resource.link"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style="background-color: var(--brand-green-dark)"
        >
          Learn More
          <UIcon name="i-heroicons-arrow-top-right-on-square-16-solid" class="w-3 h-3" />
        </a>
        <span v-else class="text-xs text-gray-400 italic">No link</span>
      </div>
    </div>
  </div>
</template>
