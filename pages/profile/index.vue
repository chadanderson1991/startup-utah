<script setup lang="ts">
import { UTAH_COUNTIES, INDUSTRIES, COMMUNITIES } from '~/lib/constants'
import type { UserProfile, Business, ProfileUpdate } from '~/types/profile'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'My Profile · Startup State Utah' })

const STAGE_LABELS: Record<string, string> = {
  idea: 'Just an idea',
  early: 'Early stage',
  growth: 'Growing',
  established: 'Established',
}

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

const { data: profile, refresh: refreshProfile } = await useFetch<UserProfile>('/api/profile')
const { data: businesses, refresh: refreshBusinesses } = await useFetch<Business[]>('/api/businesses')

const activeBusinessId = computed({
  get: () => profile.value?.active_business_id ?? null,
  set: (id) => { if (profile.value) profile.value.active_business_id = id },
})

const form = reactive<ProfileUpdate>({
  full_name:   profile.value?.full_name ?? '',
  county:      profile.value?.county ?? '',
  industry:    profile.value?.industry ?? '',
  communities: [...(profile.value?.communities ?? [])],
  bio:         profile.value?.bio ?? '',
})

function toggleCommunity(c: string) {
  const list = form.communities ?? []
  const idx = list.indexOf(c)
  if (idx === -1) form.communities = [...list, c]
  else form.communities = list.filter(x => x !== c)
}

async function saveProfile() {
  isSaving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    await $fetch('/api/profile', { method: 'PATCH', body: form })
    await refreshProfile()
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    saveError.value = e.data?.statusMessage ?? 'Failed to save.'
  } finally {
    isSaving.value = false
  }
}

async function setActiveBusiness(id: string | null) {
  activeBusinessId.value = id  // instant visual update
  await $fetch('/api/profile', { method: 'PATCH', body: { active_business_id: id } })
}

async function deleteBusiness(id: string) {
  if (!confirm('Delete this business? This cannot be undone.')) return
  await $fetch(`/api/businesses/${id}`, { method: 'DELETE' })
  if (profile.value?.active_business_id === id) await setActiveBusiness(null)
  else await refreshBusinesses()
}
</script>

<template>
  <UContainer class="max-w-4xl py-10 px-4">
    <h1 class="text-2xl font-extrabold text-gray-900 mb-8">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <!-- Profile form -->
      <div class="lg:col-span-3">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-gray-800">Personal Information</h2>
            <p class="text-sm text-gray-500 mt-0.5">This helps the Navigator personalize its recommendations.</p>
          </template>

          <div class="flex flex-col gap-4">
            <UAlert v-if="saveError" icon="i-heroicons-exclamation-triangle" color="red" :description="saveError" />
            <UAlert v-if="saveSuccess" icon="i-heroicons-check-circle" color="green" description="Profile saved." />

            <UFormGroup label="Full Name">
              <UInput v-model="form.full_name" placeholder="Jane Smith" />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="County">
                <USelect
                  v-model="form.county"
                  :options="[{ label: 'Select...', value: '' }, ...UTAH_COUNTIES.map(c => ({ label: c, value: c }))]"
                />
              </UFormGroup>
              <UFormGroup label="Industry">
                <USelect
                  v-model="form.industry"
                  :options="[{ label: 'Select...', value: '' }, ...INDUSTRIES.map(i => ({ label: i, value: i }))]"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Bio" hint="Brief background — helps the chatbot understand your experience">
              <UTextarea v-model="form.bio" placeholder="I've been in retail for 10 years and want to start my own brand..." :rows="3" />
            </UFormGroup>

            <UFormGroup label="Community Identity" hint="Optional — unlocks targeted programs">
              <div class="flex flex-wrap gap-2 mt-1">
                <button
                  v-for="c in COMMUNITIES.filter(x => x !== 'Any')"
                  :key="c"
                  type="button"
                  class="px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                  :class="form.communities?.includes(c)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400'"
                  @click="toggleCommunity(c)"
                >
                  {{ c }}
                </button>
              </div>
            </UFormGroup>
          </div>

          <template #footer>
            <UButton color="primary" :loading="isSaving" @click="saveProfile">
              Save Profile
            </UButton>
          </template>
        </UCard>
      </div>

      <!-- Businesses -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-gray-800">My Businesses</h2>
          <UButton to="/profile/business/new" size="sm" color="primary" icon="i-heroicons-plus-20-solid">
            Add Business
          </UButton>
        </div>

        <div v-if="!businesses?.length" class="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
          No businesses yet. Add one so the Navigator can give you personalized step-by-step guidance.
        </div>

        <UCard
          v-for="biz in businesses"
          :key="biz.id"
          class="transition-all cursor-pointer"
          :class="activeBusinessId === biz.id ? 'shadow-md' : 'opacity-75 hover:opacity-100 hover:shadow-md'"
          :style="activeBusinessId === biz.id ? 'outline: 2px solid #3b82f6; outline-offset: 2px;' : ''"
          @click="setActiveBusiness(biz.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ biz.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ STAGE_LABELS[biz.stage] }} · Step {{ biz.journey_step }} of 19
                <template v-if="biz.industry"> · {{ biz.industry }}</template>
              </p>
              <p v-if="biz.description" class="text-sm text-gray-600 mt-1 line-clamp-2">{{ biz.description }}</p>
            </div>
            <div class="flex gap-1 shrink-0" @click.stop>
              <UButton :to="`/profile/business/${biz.id}`" size="xs" variant="ghost" color="gray" icon="i-heroicons-pencil-square-20-solid" />
              <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash-20-solid" @click="deleteBusiness(biz.id)" />
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
