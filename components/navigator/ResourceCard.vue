<script setup lang="ts">
import type { Resource } from '~/types/resource'

const props = defineProps<{ resource: Resource }>()

const displayIndustries = computed(() => props.resource.industries.slice(0, 3))
const extraIndustriesCount = computed(() =>
  Math.max(0, props.resource.industries.length - 3),
)
</script>

<template>
  <UCard class="flex flex-col h-full">
    <template #header>
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold text-gray-900 leading-snug">
          <a
            v-if="resource.link"
            :href="resource.link"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-blue-700 hover:underline transition-colors"
          >
            {{ resource.title }}
          </a>
          <span v-else>{{ resource.title }}</span>
        </h3>
        <UBadge v-if="!resource.link" color="gray" variant="subtle" size="xs" class="shrink-0">
          No link
        </UBadge>
      </div>
    </template>

    <div class="flex flex-col gap-3 flex-1">
      <!-- Description -->
      <p
        v-if="resource.description"
        class="text-sm text-gray-600 line-clamp-3"
      >
        {{ resource.description }}
      </p>

      <!-- Communities + Topics badges -->
      <div v-if="resource.communities.length || resource.topics.length" class="flex flex-wrap gap-1">
        <UBadge
          v-for="c in resource.communities"
          :key="c"
          color="blue"
          variant="subtle"
          size="xs"
        >
          {{ c }}
        </UBadge>
        <UBadge
          v-for="t in resource.topics"
          :key="t"
          color="green"
          variant="subtle"
          size="xs"
        >
          {{ t }}
        </UBadge>
      </div>

      <!-- Industries (gray, max 3 shown) -->
      <div v-if="resource.industries.length" class="flex flex-wrap gap-1">
        <UBadge
          v-for="ind in displayIndustries"
          :key="ind"
          color="gray"
          variant="subtle"
          size="xs"
        >
          {{ ind }}
        </UBadge>
        <UBadge
          v-if="extraIndustriesCount > 0"
          color="gray"
          variant="subtle"
          size="xs"
        >
          +{{ extraIndustriesCount }} more
        </UBadge>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <a
          v-if="resource.email"
          :href="`mailto:${resource.email}`"
          class="text-sm text-blue-600 hover:underline truncate"
        >
          {{ resource.email }}
        </a>
        <span v-else class="flex-1" />

        <UButton
          v-if="resource.link"
          :to="resource.link"
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          color="primary"
          variant="solid"
          trailing-icon="i-heroicons-arrow-top-right-on-square-20-solid"
          external
        >
          Visit Resource
        </UButton>
      </div>
    </template>
  </UCard>
</template>
