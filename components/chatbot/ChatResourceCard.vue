<script setup lang="ts">
import type { ChatResource } from '~/composables/useChat'

defineProps<{ resource: ChatResource }>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-3 flex flex-col gap-2">
    <div class="flex items-start justify-between gap-2">
      <a
        v-if="resource.link"
        :href="resource.link"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm font-semibold text-blue-700 hover:underline leading-snug"
      >
        {{ resource.title }}
      </a>
      <span v-else class="text-sm font-semibold text-gray-800 leading-snug">{{ resource.title }}</span>

      <span
        v-if="resource.resource_type"
        class="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize"
      >
        {{ resource.resource_type.replace(/_/g, ' ') }}
      </span>
    </div>

    <p v-if="resource.reason" class="text-xs text-gray-600 leading-relaxed">{{ resource.reason }}</p>

    <div v-if="resource.topics?.length" class="flex flex-wrap gap-1">
      <span
        v-for="t in resource.topics"
        :key="t"
        class="text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700"
      >
        {{ t }}
      </span>
    </div>

    <a
      v-if="resource.link"
      :href="resource.link"
      target="_blank"
      rel="noopener noreferrer"
      class="self-start text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
    >
      Visit resource
      <UIcon name="i-heroicons-arrow-top-right-on-square-16-solid" class="w-3 h-3" />
    </a>
  </div>
</template>
