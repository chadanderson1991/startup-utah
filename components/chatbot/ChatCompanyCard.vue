<script setup lang="ts">
import type { ChatCompany } from '~/composables/useChat'

const props = defineProps<{ company: ChatCompany }>()

const config = useRuntimeConfig()
const brandfetchClientId = (config.public.brandfetchClientId as string) || ''

function domainFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null
  try {
    const trimmed = url.trim()
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const logoUrl = computed(() => {
  const domain = domainFromUrl(props.company.website)
  if (!domain || !brandfetchClientId) return null
  return `https://cdn.brandfetch.io/${encodeURIComponent(domain)}/w/96/h/96?c=${encodeURIComponent(brandfetchClientId)}`
})

const showLogo = ref(true)
function onLogoError() {
  showLogo.value = false
}

const initials = computed(() => {
  const words = (props.company.name || '').trim().split(/\s+/)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '?'
})

const focusUrl = computed(() => `/map?focus=${encodeURIComponent(props.company.id)}`)
</script>

<template>
  <NuxtLink
    :to="focusUrl"
    class="sprig-card flex items-stretch gap-3 p-3 h-full no-underline"
  >
    <!-- Logo / fallback initials -->
    <div
      class="shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
      style="background-color: #f3f4f6; border: 1px solid #e5e7eb;"
    >
      <img
        v-if="logoUrl && showLogo"
        :src="logoUrl"
        :alt="company.name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="onLogoError"
      />
      <span
        v-else
        class="text-sm font-bold"
        style="color: #4b5563;"
      >
        {{ initials }}
      </span>
    </div>

    <!-- Body -->
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <div class="flex items-start justify-between gap-2">
        <span class="sprig-card-title text-sm flex-1 min-w-0 truncate">
          {{ company.name }}
        </span>
        <UIcon
          name="i-heroicons-map-pin-20-solid"
          class="w-4 h-4 shrink-0 mt-0.5 opacity-70"
          aria-label="View on the map"
        />
      </div>

      <!-- Meta row -->
      <div class="flex flex-wrap gap-1.5 items-center">
        <span
          v-if="company.sector"
          class="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style="background-color: #eef2ff; color: #4338ca;"
        >
          {{ company.sector }}
        </span>
        <span
          v-if="company.stage"
          class="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style="background-color: #f0fdf4; color: #15803d;"
        >
          {{ company.stage }}
        </span>
        <span
          v-if="company.is_hiring"
          class="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style="background-color: #fffbeb; color: #92400e;"
        >
          Hiring
        </span>
      </div>

      <p
        v-if="company.reason"
        class="sprig-card-body text-xs leading-snug"
      >
        {{ company.reason }}
      </p>
    </div>
  </NuxtLink>
</template>
