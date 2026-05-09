<script setup lang="ts">
import type { Company } from '~/types/company'

const route = useRoute()
const user = useSupabaseUser()

const { data: company, error, pending } = await useFetch<Company>(
  () => `/api/companies/${route.params.id}`,
)

useSeoMeta({
  title: computed(() => (company.value ? `${company.value.name} · Startup State Utah` : 'Company')),
})

const canClaim = computed(
  () =>
    company.value &&
    !company.value.claimed_by &&
    user.value,
)
</script>

<template>
  <UContainer class="max-w-4xl py-10 px-4">
    <!-- Back -->
    <UButton
      to="/map"
      variant="ghost"
      color="gray"
      size="sm"
      icon="i-heroicons-arrow-left-20-solid"
      class="mb-6"
    >
      Back to Map
    </UButton>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col gap-4">
      <USkeleton class="h-10 w-64" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-3/4" />
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Company not found"
      description="This company profile could not be found."
    />

    <!-- Profile -->
    <div v-else-if="company" class="flex flex-col gap-8">
      <!-- Header -->
      <div>
        <div class="flex items-start gap-4 flex-wrap">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-3xl font-extrabold text-gray-900">{{ company.name }}</h1>
              <UBadge
                v-if="company.is_verified"
                color="green"
                variant="subtle"
                icon="i-heroicons-check-badge-20-solid"
              >
                Verified
              </UBadge>
            </div>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <UBadge v-if="company.sector" color="blue" variant="subtle">{{ company.sector }}</UBadge>
              <UBadge v-if="company.stage" color="violet" variant="subtle">{{ company.stage }}</UBadge>
              <UBadge v-if="company.is_hiring" color="green" variant="solid">Now Hiring</UBadge>
            </div>
          </div>

          <!-- Claim button -->
          <UButton
            v-if="canClaim"
            :to="`/company/claim/${company.id}`"
            variant="outline"
            color="gray"
            size="sm"
          >
            Claim this Profile
          </UButton>
        </div>

        <!-- Description -->
        <p v-if="company.description" class="mt-4 text-gray-600 leading-relaxed max-w-2xl">
          {{ company.description }}
        </p>
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-if="company.website" class="flex items-center gap-2">
          <UIcon name="i-heroicons-globe-alt-20-solid" class="w-5 h-5 text-gray-400 shrink-0" />
          <a
            :href="company.website"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-600 hover:underline truncate"
          >
            {{ company.website.replace(/^https?:\/\//, '') }}
          </a>
        </div>
        <div v-if="company.linkedin_url" class="flex items-center gap-2">
          <UIcon name="i-heroicons-link-20-solid" class="w-5 h-5 text-gray-400 shrink-0" />
          <a
            :href="company.linkedin_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-600 hover:underline truncate"
          >
            LinkedIn
          </a>
        </div>
        <div v-if="company.address" class="flex items-center gap-2">
          <UIcon name="i-heroicons-map-pin-20-solid" class="w-5 h-5 text-gray-400 shrink-0" />
          <span class="text-gray-700">{{ company.address }}</span>
        </div>
        <div v-if="company.employee_range" class="flex items-center gap-2">
          <UIcon name="i-heroicons-users-20-solid" class="w-5 h-5 text-gray-400 shrink-0" />
          <span class="text-gray-700">{{ company.employee_range }} employees</span>
        </div>
        <div v-if="company.year_founded" class="flex items-center gap-2">
          <UIcon name="i-heroicons-calendar-20-solid" class="w-5 h-5 text-gray-400 shrink-0" />
          <span class="text-gray-700">Founded {{ company.year_founded }}</span>
        </div>
      </div>

      <!-- Job postings -->
      <div v-if="company.is_hiring && company.job_postings?.length">
        <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <UBadge color="green" variant="solid">Now Hiring</UBadge>
          Open Positions
        </h2>
        <div class="flex flex-col gap-2">
          <UCard
            v-for="job in company.job_postings"
            :key="job.url"
            class="flex items-center justify-between gap-4"
          >
            <div>
              <p class="font-medium text-gray-900">{{ job.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                Posted {{ new Date(job.posted_at).toLocaleDateString() }}
              </p>
            </div>
            <UButton
              :href="job.url"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              color="primary"
              variant="outline"
              trailing-icon="i-heroicons-arrow-top-right-on-square-20-solid"
              external
            >
              Apply
            </UButton>
          </UCard>
        </div>
      </div>

      <!-- Photos gallery -->
      <div v-if="company.photos?.length">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Photos</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <img
            v-for="(photo, idx) in company.photos"
            :key="idx"
            :src="photo"
            :alt="`${company.name} photo ${idx + 1}`"
            class="rounded-lg object-cover w-full aspect-video bg-gray-100"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>
