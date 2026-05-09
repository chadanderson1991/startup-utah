<script setup lang="ts">
import type { Company, CompanyClaim } from '~/types/company'
import type { UserProfile } from '~/types/profile'

const route = useRoute()
const user = useSupabaseUser()
const userProfile = ref<UserProfile | null>(null)
const profileLoading = ref(false)

onMounted(async () => {
  if (!user.value) {
    navigateTo(`/login?return=${route.path}`)
    return
  }
  profileLoading.value = true
  try {
    userProfile.value = await $fetch<UserProfile>('/api/profile')
  } finally {
    profileLoading.value = false
  }
})

const { data: company, pending: companyPending } = await useFetch<Company>(
  () => `/api/companies/${route.params.id}`,
)

useSeoMeta({
  title: computed(() =>
    company.value ? `Claim ${company.value.name} · Startup State Utah` : 'Claim Profile',
  ),
})

// Check if there's already a pending claim or the company is taken
const claimStatus = computed(() => {
  if (!company.value) return 'loading'
  if (company.value.claimed_by) return 'already_claimed'
  return 'available'
})

const needsProfile = computed(() =>
  user.value && !profileLoading.value && !userProfile.value?.full_name,
)

const verificationNote = ref('')
const isSubmitting = ref(false)
const submitted = ref(false)
const errorMessage = ref<string | null>(null)
const pendingClaimBlocked = ref(false)

async function handleSubmit() {
  if (!company.value) return
  isSubmitting.value = true
  errorMessage.value = null
  pendingClaimBlocked.value = false
  try {
    await $fetch<CompanyClaim>('/api/companies/claim', {
      method: 'POST',
      body: {
        company_id: company.value.id,
        verification_note: verificationNote.value || null,
      },
    })
    submitted.value = true
  } catch (err: unknown) {
    console.error('[claim] submit error:', err)
    const e = err as { data?: { statusMessage?: string } }
    const msg = e.data?.statusMessage ?? ''
    if (msg.includes('pending claim under review')) {
      pendingClaimBlocked.value = true
    } else if (msg.includes('already have a pending claim')) {
      submitted.value = true // treat as already submitted
    } else {
      errorMessage.value = msg || 'Failed to submit claim. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-lg py-10 px-4">
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
    <div v-if="companyPending" class="flex flex-col gap-3">
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-4 w-full" />
    </div>

    <!-- Success — checked early so it always wins after submission -->
    <div v-else-if="submitted" class="flex flex-col items-center gap-4 py-12 text-center">
      <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-500" />
      <h2 class="text-xl font-bold text-gray-900">Claim Submitted</h2>
      <p class="text-gray-500 max-w-sm">
        Your claim for <strong>{{ company?.name }}</strong> is pending admin review.
        We'll be in touch soon.
      </p>
      <UButton to="/map" color="primary">Back to Map</UButton>
    </div>

    <!-- Profile required -->
    <div v-else-if="needsProfile" class="flex flex-col items-center gap-4 py-12 text-center">
      <UIcon name="i-heroicons-user-circle" class="w-14 h-14 text-gray-300" />
      <h2 class="text-xl font-bold text-gray-900">Set Up Your Profile First</h2>
      <p class="text-gray-500 max-w-sm">
        Before claiming <strong>{{ company?.name }}</strong>, you need to complete your profile.
        This helps us verify that you represent the company.
      </p>
      <UButton :to="`/profile?return=${route.path}`" color="primary">Complete Your Profile</UButton>
    </div>

    <!-- Already claimed -->
    <div v-else-if="claimStatus === 'already_claimed'" class="flex flex-col items-center gap-4 py-12 text-center">
      <UIcon name="i-heroicons-lock-closed" class="w-14 h-14 text-gray-300" />
      <h2 class="text-xl font-bold text-gray-900">Profile Already Claimed</h2>
      <p class="text-gray-500 max-w-sm">
        <strong>{{ company?.name }}</strong> has already been claimed by another user.
        If you believe this is an error, please <NuxtLink to="/contact" class="text-blue-600 hover:underline">contact us</NuxtLink>.
      </p>
      <UButton to="/map" variant="outline" color="gray">Back to Map</UButton>
    </div>

    <!-- Pending claim from someone else -->
    <div v-else-if="pendingClaimBlocked" class="flex flex-col items-center gap-4 py-12 text-center">
      <UIcon name="i-heroicons-clock" class="w-14 h-14 text-yellow-400" />
      <h2 class="text-xl font-bold text-gray-900">Claim Pending Review</h2>
      <p class="text-gray-500 max-w-sm">
        <strong>{{ company?.name }}</strong> already has a claim under admin review.
        A new claim cannot be submitted until the existing one is resolved.
        If you believe this is an error, please <NuxtLink to="/contact" class="text-blue-600 hover:underline">contact us</NuxtLink>.
      </p>
      <UButton to="/map" variant="outline" color="gray">Back to Map</UButton>
    </div>

    <!-- Form -->
    <div v-else-if="company">
      <h1 class="text-2xl font-extrabold text-gray-900 mb-1">Claim this Profile</h1>
      <p class="text-gray-500 mb-6">
        You're claiming <span class="font-semibold text-gray-800">{{ company.name }}</span>.
        An admin will verify your claim before granting access.
      </p>

      <UAlert
        v-if="errorMessage"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        :description="errorMessage"
        class="mb-4"
      />

      <div class="flex flex-col gap-5">
        <UFormGroup
          label="How can you verify you represent this company?"
          help="Share your role, work email, LinkedIn, or other evidence. The more detail, the faster we can approve."
        >
          <UTextarea
            v-model="verificationNote"
            placeholder="E.g., I'm the CEO — my work email is jane@acme.com and I can be found at linkedin.com/in/jane"
            :rows="5"
          />
        </UFormGroup>

        <UButton
          color="primary"
          block
          size="lg"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          Submit Claim
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
