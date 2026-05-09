<script setup lang="ts">
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'

interface Stats {
  total: number
  hiring: number
  bySector: Record<string, number>
}

const props = defineProps<{ stats: Stats | null }>()

const sectorEntries = computed(() => {
  if (!props.stats) return []
  return Object.entries(props.stats.bySector).sort((a, b) => b[1] - a[1])
})
</script>

<template>
  <div
    v-if="stats"
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-md px-4 py-3 flex flex-col gap-2 min-w-[180px] max-w-[220px]"
  >
    <!-- Summary row -->
    <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-none">
      {{ stats.total }} companies
      <span class="text-green-600 dark:text-green-400 ml-1">· {{ stats.hiring }} hiring</span>
    </p>

    <!-- Sector breakdown -->
    <ul v-if="sectorEntries.length" class="flex flex-col gap-1">
      <li
        v-for="[sector, count] in sectorEntries"
        :key="sector"
        class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"
      >
        <span
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ backgroundColor: SECTOR_COLORS[sector] ?? SECTOR_COLOR_DEFAULT }"
        />
        <span class="flex-1 truncate">{{ sector }}</span>
        <span class="font-medium tabular-nums">{{ count }}</span>
      </li>
    </ul>
  </div>
</template>
