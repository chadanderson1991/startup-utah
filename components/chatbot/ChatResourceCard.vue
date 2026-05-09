<script setup lang="ts">
import type { ChatResource } from '~/composables/useChat'

defineProps<{ resource: ChatResource }>()
</script>

<template>
  <a
    v-if="resource.link"
    :href="resource.link"
    target="_blank"
    rel="noopener noreferrer"
    class="sprig-card p-4 flex flex-col gap-2 h-full"
  >
    <div class="flex items-start justify-between gap-2">
      <span class="sprig-card-title text-sm flex-1 min-w-0">
        {{ resource.title }}
      </span>
      <UIcon
        name="i-heroicons-arrow-top-right-on-square-20-solid"
        class="w-4 h-4 shrink-0 mt-0.5 text-black opacity-80"
        aria-label="Opens in a new tab"
      />
    </div>
    <p
      v-if="resource.reason"
      class="sprig-card-body text-xs"
    >
      {{ resource.reason }}
    </p>
  </a>

  <div
    v-else
    class="sprig-card p-4 flex flex-col gap-2 h-full"
    style="cursor: default;"
  >
    <span class="sprig-card-title text-sm">
      {{ resource.title }}
    </span>
    <p
      v-if="resource.reason"
      class="sprig-card-body text-xs"
    >
      {{ resource.reason }}
    </p>
  </div>
</template>
