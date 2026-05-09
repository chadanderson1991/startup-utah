<script setup lang="ts">
import { SECTORS, STAGES, EMPLOYEE_RANGES } from '~/lib/constants'
import type { Company } from '~/types/company'

useSeoMeta({ title: 'Add Your Company · Startup State Utah' })

const config = useRuntimeConfig()

interface FormState {
  name: string
  description: string
  website: string
  linkedin_url: string
  address: string
  sector: string
  stage: string
  employee_range: string
  year_founded: string
  is_hiring: boolean
}

const form = reactive<FormState>({
  name: '',
  description: '',
  website: '',
  linkedin_url: '',
  address: '',
  sector: '',
  stage: '',
  employee_range: '',
  year_founded: '',
  is_hiring: false,
})

const isSubmitting = ref(false)
const createdCompany = ref<Company | null>(null)
const errorMessage = ref<string | null>(null)

// ── Address autocomplete ───────────────────────────────────────────────────────
interface MapboxFeature {
  place_name: string
  center: [number, number]
}

const suggestions = ref<MapboxFeature[]>([])
const showSuggestions = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchSuggestions(query: string) {
  if (!query.trim() || query.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  try {
    const res = await $fetch<{ features: MapboxFeature[] }>(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        query: {
          access_token: config.public.mapboxToken,
          autocomplete: 'true',
          limit: '5',
          country: 'US',
          proximity: '-111.891,40.758',
          types: 'address,place,locality',
        },
      },
    )
    suggestions.value = res.features ?? []
    showSuggestions.value = suggestions.value.length > 0
  } catch {
    suggestions.value = []
    showSuggestions.value = false
  }
}

function onAddressInput(value: string) {
  form.address = value
  geoStatus.value = 'idle'
  geoResult.value = null
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSuggestions(value), 300)
}

async function selectSuggestion(s: MapboxFeature) {
  form.address = s.place_name
  showSuggestions.value = false
  suggestions.value = []
  await verifyAddress()
}

function onAddressBlur() {
  // Delay so click on a suggestion registers before the dropdown closes
  setTimeout(() => { showSuggestions.value = false }, 200)
}

// ── Geocode verification ───────────────────────────────────────────────────────
const geoStatus = ref<'idle' | 'checking' | 'found' | 'not_found'>('idle')
const geoResult = ref<{ lat: number; lng: number; city: string } | null>(null)

async function verifyAddress() {
  if (!form.address.trim()) {
    geoStatus.value = 'idle'
    geoResult.value = null
    return
  }
  geoStatus.value = 'checking'
  try {
    geoResult.value = await $fetch('/api/geocode', {
      method: 'POST',
      body: { address: form.address },
    })
    geoStatus.value = 'found'
  } catch {
    geoStatus.value = 'not_found'
    geoResult.value = null
  }
}

// ── Submit ─────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!form.name.trim()) return
  isSubmitting.value = true
  errorMessage.value = null
  try {
    const payload: Partial<Company> = {
      name: form.name,
      description: form.description || null,
      website: form.website || null,
      linkedin_url: form.linkedin_url || null,
      address: form.address || null,
      sector: form.sector || null,
      stage: form.stage || null,
      employee_range: form.employee_range || null,
      year_founded: form.year_founded ? parseInt(form.year_founded) : null,
      is_hiring: form.is_hiring,
    }
    createdCompany.value = await $fetch<Company>('/api/companies', {
      method: 'POST',
      body: payload,
    })
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Failed to submit. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 px-4">
    <UButton to="/map" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Map
    </UButton>

    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Add Your Company</h1>
    <p class="text-gray-500 mb-8">
      Submit your company to the Utah Startup Map. Your profile will be listed
      as unverified until reviewed.
    </p>

    <!-- Success state -->
    <div v-if="createdCompany" class="flex flex-col items-center gap-4 py-12 text-center">
      <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-500" />
      <h2 class="text-xl font-bold text-gray-900">Submitted for review!</h2>
      <p class="text-gray-500 max-w-sm">
        Thanks for submitting <strong>{{ createdCompany.name }}</strong>. Our team
        will review it and add it to the map once approved.
      </p>
      <UButton to="/map" color="primary">
        Back to Map
      </UButton>
    </div>

    <!-- Form -->
    <UForm v-else :state="form" @submit="handleSubmit" class="flex flex-col gap-5">
      <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="red" :description="errorMessage" />

      <UFormGroup label="Company Name" required>
        <UInput v-model="form.name" placeholder="Acme Corp" />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="form.description" placeholder="What does your company do?" :rows="3" />
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Website">
          <UInput v-model="form.website" placeholder="https://example.com" type="url" />
        </UFormGroup>
        <UFormGroup label="LinkedIn URL">
          <UInput v-model="form.linkedin_url" placeholder="https://linkedin.com/company/..." type="url" />
        </UFormGroup>
      </div>

      <UFormGroup label="Address" hint="Used to place your company on the map">
        <div class="relative">
          <UInput
            :model-value="form.address"
            placeholder="123 Main St, Salt Lake City, UT 84101"
            autocomplete="off"
            @update:model-value="onAddressInput"
            @blur="onAddressBlur"
          />

          <!-- Autocomplete dropdown -->
          <ul
            v-if="showSuggestions"
            class="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <li
              v-for="s in suggestions"
              :key="s.place_name"
              class="px-3 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-700 flex items-start gap-2"
              @mousedown.prevent="selectSuggestion(s)"
            >
              <UIcon name="i-heroicons-map-pin-20-solid" class="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
              {{ s.place_name }}
            </li>
          </ul>
        </div>

        <!-- Geocode status feedback -->
        <div v-if="geoStatus === 'checking'" class="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
          <UIcon name="i-heroicons-arrow-path-20-solid" class="w-3.5 h-3.5 animate-spin" />
          Verifying address...
        </div>
        <div v-else-if="geoStatus === 'found'" class="mt-1.5 flex items-center gap-1.5 text-xs text-green-600">
          <UIcon name="i-heroicons-check-circle-20-solid" class="w-3.5 h-3.5" />
          Found: {{ geoResult?.city || 'Location resolved' }} — will appear on the map
        </div>
        <div v-else-if="geoStatus === 'not_found'" class="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
          <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-3.5 h-3.5" />
          Address not found — company will be saved but won't appear on the map.
        </div>
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <UFormGroup label="Sector">
          <USelect v-model="form.sector" :options="[{ label: 'Select...', value: '' }, ...SECTORS.map(s => ({ label: s, value: s }))]" />
        </UFormGroup>
        <UFormGroup label="Stage">
          <USelect v-model="form.stage" :options="[{ label: 'Select...', value: '' }, ...STAGES.map(s => ({ label: s, value: s }))]" />
        </UFormGroup>
        <UFormGroup label="Team Size">
          <USelect v-model="form.employee_range" :options="[{ label: 'Select...', value: '' }, ...EMPLOYEE_RANGES.map(r => ({ label: r, value: r }))]" />
        </UFormGroup>
      </div>

      <UFormGroup label="Year Founded">
        <UInput v-model="form.year_founded" type="number" placeholder="2020" min="1900" :max="new Date().getFullYear()" />
      </UFormGroup>

      <div class="flex items-center gap-3">
        <UToggle v-model="form.is_hiring" />
        <span class="text-sm font-medium text-gray-700">Currently Hiring</span>
      </div>

      <UButton type="submit" color="primary" block size="lg" :loading="isSubmitting">
        Submit Company
      </UButton>
    </UForm>
  </UContainer>
</template>
