<script setup lang="ts">
import type { Company, CompanyClaim } from '~/types/company'

const route = useRoute()
const user = useSupabaseUser()

// Redirect if not authenticated
onMounted(() => {
  if (!user.value) {
    navigateTo('/login')
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

const verificationNote = ref('')
const isSubmitting = ref(false)
const submitted = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit() {
  if (!company.value) return
  isSubmitting.value = true
  errorMessage.value = null
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
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Failed to submit claim. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-lg py-10 px-4">
    <UButton
      :to="`/company/${route.params.id}`"
      variant="ghost"
      color="gray"
      size="sm"
      icon="i-heroicons-arrow-left-20-solid"
      class="mb-6"
    >
      Back to Profile
    </UButton>

    <!-- Loading -->
    <div v-if="companyPending" class="flex flex-col gap-3">
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-4 w-full" />
    </div>

    <!-- Success -->
    <div v-else-if="submitted" class="flex flex-col items-center gap-4 py-12 text-center">
      <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-500" />
      <h2 class="text-xl font-bold text-gray-900">Claim Submitted</h2>
      <p class="text-gray-500 max-w-sm">
        Your claim for <strong>{{ company?.name }}</strong> is pending admin
        review. We'll be in touch soon.
      </p>
      <UButton :to="`/company/${route.params.id}`" color="primary">
        Back to Profile
      </UButton>
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
