<script setup lang="ts">
import { SECTORS, STAGES, EMPLOYEE_RANGES } from '~/lib/constants'
import type { Company } from '~/types/company'

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()

onMounted(() => {
  const isAdmin =
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin'
  if (!isAdmin) navigateTo('/')
})

useSeoMeta({ title: 'Edit Company · Admin' })

interface FormState {
  name: string
  description: string
  website: string
  linkedin_url: string
  address: string
  city: string
  lat: string
  lng: string
  sector: string
  stage: string
  employee_range: string
  year_founded: string
  is_hiring: boolean
  is_verified: boolean
  is_active: boolean
}

const form = reactive<FormState>({
  name: '',
  description: '',
  website: '',
  linkedin_url: '',
  address: '',
  city: '',
  lat: '',
  lng: '',
  sector: '',
  stage: '',
  employee_range: '',
  year_founded: '',
  is_hiring: false,
  is_verified: false,
  is_active: true,
})

const isSaving = ref(false)
const isRemovingOwner = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const { data: company } = await useFetch<Company>(`/api/companies/${route.params.id}`)

if (company.value) {
  const c = company.value
  form.name = c.name
  form.description = c.description ?? ''
  form.website = c.website ?? ''
  form.linkedin_url = c.linkedin_url ?? ''
  form.address = c.address ?? ''
  form.city = c.city ?? ''
  form.lat = c.lat != null ? String(c.lat) : ''
  form.lng = c.lng != null ? String(c.lng) : ''
  form.sector = c.sector ?? ''
  form.stage = c.stage ?? ''
  form.employee_range = c.employee_range ?? ''
  form.year_founded = c.year_founded != null ? String(c.year_founded) : ''
  form.is_hiring = c.is_hiring
  form.is_verified = c.is_verified
  form.is_active = c.is_active
}

async function removeOwner() {
  if (!company.value) return
  isRemovingOwner.value = true
  successMessage.value = null
  errorMessage.value = null
  try {
    await $fetch(`/api/companies/${route.params.id}`, {
      method: 'PATCH',
      body: { claimed_by: null, owner_email: null },
    })
    company.value = { ...company.value, claimed_by: null, owner_email: null }
    successMessage.value = 'Owner removed. The company can now be claimed again.'
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Failed to remove owner.'
  } finally {
    isRemovingOwner.value = false
  }
}

async function handleSave() {
  isSaving.value = true
  successMessage.value = null
  errorMessage.value = null
  try {
    const payload: Partial<Company> = {
      name: form.name,
      description: form.description || null,
      website: form.website || null,
      linkedin_url: form.linkedin_url || null,
      address: form.address || null,
      city: form.city || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      sector: form.sector || null,
      stage: form.stage || null,
      employee_range: form.employee_range || null,
      year_founded: form.year_founded ? parseInt(form.year_founded) : null,
      is_hiring: form.is_hiring,
      is_verified: form.is_verified,
      is_active: form.is_active,
    }
    await $fetch(`/api/companies/${route.params.id}`, {
      method: 'PATCH',
      body: payload,
    })
    successMessage.value = 'Saved successfully.'
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Save failed.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 px-4">
    <UButton to="/admin/companies" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Companies
    </UButton>

    <h1 class="text-2xl font-extrabold text-gray-900 mb-6">Edit Company</h1>

    <UAlert v-if="successMessage" icon="i-heroicons-check-circle" color="green" :description="successMessage" class="mb-4" />
    <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="red" :description="errorMessage" class="mb-4" />

    <div class="flex flex-col gap-5">
      <UFormGroup label="Company Name" required>
        <UInput v-model="form.name" placeholder="Acme Corp" />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="form.description" :rows="3" placeholder="Describe this company..." />
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Website">
          <UInput v-model="form.website" type="url" placeholder="https://..." />
        </UFormGroup>
        <UFormGroup label="LinkedIn URL">
          <UInput v-model="form.linkedin_url" type="url" placeholder="https://linkedin.com/company/..." />
        </UFormGroup>
      </div>

      <UFormGroup label="Address">
        <UInput v-model="form.address" placeholder="123 Main St, Salt Lake City, UT" />
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <UFormGroup label="City">
          <UInput v-model="form.city" placeholder="Salt Lake City" />
        </UFormGroup>
        <UFormGroup label="Latitude">
          <UInput v-model="form.lat" type="number" placeholder="40.7608" step="0.0001" />
        </UFormGroup>
        <UFormGroup label="Longitude">
          <UInput v-model="form.lng" type="number" placeholder="-111.891" step="0.0001" />
        </UFormGroup>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <UFormGroup label="Sector">
          <USelect v-model="form.sector" :options="[{ label: 'None', value: '' }, ...SECTORS.map(s => ({ label: s, value: s }))]" />
        </UFormGroup>
        <UFormGroup label="Stage">
          <USelect v-model="form.stage" :options="[{ label: 'None', value: '' }, ...STAGES.map(s => ({ label: s, value: s }))]" />
        </UFormGroup>
        <UFormGroup label="Team Size">
          <USelect v-model="form.employee_range" :options="[{ label: 'None', value: '' }, ...EMPLOYEE_RANGES.map(r => ({ label: r, value: r }))]" />
        </UFormGroup>
      </div>

      <UFormGroup label="Year Founded">
        <UInput v-model="form.year_founded" type="number" placeholder="2020" />
      </UFormGroup>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <UToggle v-model="form.is_hiring" />
          <span class="text-sm font-medium text-gray-700">Currently Hiring</span>
        </div>
        <div class="flex items-center gap-3">
          <UToggle v-model="form.is_verified" />
          <span class="text-sm font-medium text-gray-700">Verified Profile</span>
        </div>
        <div class="flex items-center gap-3">
          <UToggle v-model="form.is_active" />
          <span class="text-sm font-medium text-gray-700">Active (visible on map)</span>
        </div>
      </div>

      <!-- Owner section -->
      <div class="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
        <p class="text-sm font-semibold text-gray-700">Ownership</p>
        <div v-if="company?.claimed_by" class="flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <UIcon name="i-heroicons-user-circle-20-solid" class="w-4 h-4 text-gray-400 shrink-0" />
            <span>{{ company.owner_email ?? 'Email unavailable' }}</span>
          </div>
          <UButton
            size="sm"
            color="red"
            variant="soft"
            icon="i-heroicons-x-mark-20-solid"
            :loading="isRemovingOwner"
            @click="removeOwner"
          >
            Remove Owner
          </UButton>
        </div>
        <p v-else class="text-sm text-gray-400 italic">No owner — this company can be claimed.</p>
      </div>

      <UButton color="primary" size="lg" :loading="isSaving" @click="handleSave">
        Save Changes
      </UButton>
    </div>
  </UContainer>
</template>
