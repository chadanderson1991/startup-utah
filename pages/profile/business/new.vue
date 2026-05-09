<script setup lang="ts">
import { UTAH_COUNTIES, INDUSTRIES, JOURNEY_STEPS, STAGES } from '~/lib/constants'
import type { BusinessCreate } from '~/types/profile'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Add Business · Startup State Utah' })

const STAGE_OPTIONS = STAGES.map(s => ({ label: s, value: s }))

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive<BusinessCreate>({
  name: '',
  description: '',
  stage: 'Pre-Seed',
  industry: '',
  county: '',
  website: '',
  year_founded: null,
  is_hiring: false,
  journey_step: 1,
  notes: '',
})

async function handleSubmit() {
  if (!form.name.trim()) return
  isSubmitting.value = true
  errorMessage.value = null
  try {
    await $fetch('/api/businesses', { method: 'POST', body: form })
    await navigateTo('/profile')
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Failed to save. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 px-4">
    <UButton to="/profile" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Profile
    </UButton>

    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Add a Business</h1>
    <p class="text-gray-500 mb-8">Track a startup so the Navigator can guide you step by step.</p>

    <UForm :state="form" class="flex flex-col gap-5" @submit="handleSubmit">
      <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="red" :description="errorMessage" />

      <UFormGroup label="Business Name" required>
        <UInput v-model="form.name" placeholder="Acme Foods" />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="form.description" placeholder="What does this business do?" :rows="3" />
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Stage" required>
          <USelect v-model="form.stage" :options="STAGE_OPTIONS" />
        </UFormGroup>
        <UFormGroup label="Industry">
          <USelect
            v-model="form.industry"
            :options="[{ label: 'Select...', value: '' }, ...INDUSTRIES.map(i => ({ label: i, value: i }))]"
          />
        </UFormGroup>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="County">
          <USelect
            v-model="form.county"
            :options="[{ label: 'Select...', value: '' }, ...UTAH_COUNTIES.map(c => ({ label: c, value: c }))]"
          />
        </UFormGroup>
        <UFormGroup label="Website">
          <UInput v-model="form.website" placeholder="https://example.com" type="url" />
        </UFormGroup>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Year Founded">
          <UInput v-model.number="form.year_founded" type="number" placeholder="2024" min="1800" :max="new Date().getFullYear() + 1" />
        </UFormGroup>
        <UFormGroup label="Current Journey Step">
          <USelect v-model.number="form.journey_step" :options="JOURNEY_STEPS" />
        </UFormGroup>
      </div>

      <div class="flex items-center gap-3">
        <UToggle v-model="form.is_hiring" />
        <span class="text-sm font-medium text-gray-700">Currently Hiring</span>
      </div>

      <UFormGroup label="Notes" hint="Private notes the Navigator can use to help you">
        <UTextarea v-model="form.notes" placeholder="Looking for co-founder, need help with funding strategy..." :rows="3" />
      </UFormGroup>

      <UButton type="submit" color="primary" block size="lg" :loading="isSubmitting">
        Save Business
      </UButton>
    </UForm>
  </UContainer>
</template>
