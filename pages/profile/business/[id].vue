<script setup lang="ts">
import { UTAH_COUNTIES, INDUSTRIES, JOURNEY_STEPS } from '~/lib/constants'
import type { Company } from '~/types/company'
import type { BusinessUpdate } from '~/types/profile'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const STAGE_OPTIONS = [
  { label: 'Just an idea', value: 'idea' },
  { label: 'Early stage (0–2 years)', value: 'early' },
  { label: 'Growing (2–5 years)', value: 'growth' },
  { label: 'Established (5+ years)', value: 'established' },
]

const { data: business } = await useFetch<Company>(`/api/businesses/${id}`)
if (!business.value) throw createError({ statusCode: 404, statusMessage: 'Business not found' })

useSeoMeta({ title: `Edit ${business.value.name} · Startup State Utah` })

const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref<string | null>(null)
const saveSuccess = ref(false)

const form = reactive<BusinessUpdate>({
  name:         business.value.name,
  description:  business.value.description ?? '',
  stage:        business.value.stage,
  industry:     business.value.industry ?? '',
  county:       business.value.county ?? '',
  website:      business.value.website ?? '',
  year_founded: business.value.year_founded,
  is_hiring:    business.value.is_hiring,
  journey_step: business.value.journey_step,
  notes:        business.value.notes ?? '',
})

async function handleSubmit() {
  isSubmitting.value = true
  errorMessage.value = null
  saveSuccess.value = false
  try {
    await $fetch(`/api/businesses/${id}`, { method: 'PATCH', body: form })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Failed to save.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  if (!confirm(`Delete "${business.value?.name}"? This cannot be undone.`)) return
  isDeleting.value = true
  await $fetch(`/api/businesses/${id}`, { method: 'DELETE' })
  await navigateTo('/profile')
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 px-4">
    <UButton to="/profile" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Profile
    </UButton>

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">{{ business?.name }}</h1>
        <p class="text-gray-500 mt-1">Edit your business details</p>
      </div>
      <UButton color="red" variant="soft" size="sm" icon="i-heroicons-trash-20-solid" :loading="isDeleting" @click="handleDelete">
        Delete
      </UButton>
    </div>

    <UForm :state="form" class="flex flex-col gap-5" @submit="handleSubmit">
      <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="red" :description="errorMessage" />
      <UAlert v-if="saveSuccess" icon="i-heroicons-check-circle" color="green" description="Saved successfully." />

      <UFormGroup label="Business Name" required>
        <UInput v-model="form.name" />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="form.description" :rows="3" />
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Stage">
          <USelect v-model="form.stage" :options="STAGE_OPTIONS" />
        </UFormGroup>
        <UFormGroup label="Industry">
          <USelect v-model="form.industry" :options="[{ label: 'Select...', value: '' }, ...INDUSTRIES.map(i => ({ label: i, value: i }))]" />
        </UFormGroup>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="County">
          <USelect v-model="form.county" :options="[{ label: 'Select...', value: '' }, ...UTAH_COUNTIES.map(c => ({ label: c, value: c }))]" />
        </UFormGroup>
        <UFormGroup label="Website">
          <UInput v-model="form.website" type="url" />
        </UFormGroup>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Year Founded">
          <UInput v-model.number="form.year_founded" type="number" min="1800" :max="new Date().getFullYear() + 1" />
        </UFormGroup>
        <UFormGroup label="Current Journey Step">
          <USelect v-model.number="form.journey_step" :options="JOURNEY_STEPS" />
        </UFormGroup>
      </div>

      <div class="flex items-center gap-3">
        <UToggle v-model="form.is_hiring" />
        <span class="text-sm font-medium text-gray-700">Currently Hiring</span>
      </div>

      <UFormGroup label="Notes">
        <UTextarea v-model="form.notes" :rows="3" />
      </UFormGroup>

      <UButton type="submit" color="primary" block size="lg" :loading="isSubmitting">
        Save Changes
      </UButton>
    </UForm>
  </UContainer>
</template>
