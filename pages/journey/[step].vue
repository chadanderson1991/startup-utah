<script setup lang="ts">
import type { UserProfile, Business } from '~/types/profile'
import { JOURNEY_STEPS, getStepByNumber, getPhaseForStep } from '~/utils/journey-data'

const route = useRoute()
const router = useRouter()

const stepNum = computed(() => {
  const n = parseInt(String(route.params.step), 10)
  return isNaN(n) ? 1 : Math.max(1, Math.min(19, n))
})

const stepData = computed(() => getStepByNumber(stepNum.value))
const phaseLabel = computed(() => getPhaseForStep(stepNum.value))

const prevStep = computed(() => stepNum.value > 1 ? stepNum.value - 1 : null)
const nextStep = computed(() => stepNum.value < 19 ? stepNum.value + 1 : null)

function onStepSelect(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  router.push(`/journey/${val}`)
}

useSeoMeta({
  title: computed(() => stepData.value ? `Step ${stepNum.value}: ${stepData.value.title} · Startup State Utah` : 'Startup State Utah'),
  description: computed(() => stepData.value?.goal ?? ''),
})

// Auth & journey state
const user = useSupabaseUser()
const profile = ref<UserProfile | null>(null)
const activeBusiness = ref<Business | null>(null)
const dataLoading = ref(false)
const updatingStep = ref(false)

onMounted(async () => {
  if (!user.value) return
  dataLoading.value = true
  try {
    const profileData = await $fetch<UserProfile>('/api/profile').catch(() => null)
    profile.value = profileData
    if (profileData?.active_business_id) {
      activeBusiness.value = await $fetch<Business>(
        `/api/businesses/${profileData.active_business_id}`,
      ).catch(() => null)
    }
  } finally {
    dataLoading.value = false
  }
})

const currentJourneyStep = computed(() => activeBusiness.value?.journey_step ?? null)
const isCurrentStep = computed(() => currentJourneyStep.value === stepNum.value)

async function setJourneyStep() {
  if (!activeBusiness.value) return
  updatingStep.value = true
  try {
    const updated = await $fetch<Business>(
      `/api/businesses/${activeBusiness.value.id}`,
      { method: 'PATCH', body: { journey_step: stepNum.value } },
    )
    activeBusiness.value = updated
  } catch {
    // silent
  } finally {
    updatingStep.value = false
  }
}

function resourceLink(topics: string[]) {
  return `/navigator?topics=${topics.map(encodeURIComponent).join(',')}`
}
</script>

<template>
  <div v-if="stepData">
    <!-- Hero -->
    <section
      class="relative text-white py-12 px-4"
      style="background-color: var(--brand-navy)"
    >
      <UContainer class="max-w-4xl">
        <!-- Phase + back breadcrumb row -->
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <NuxtLink
            to="/journey"
            class="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
            style="color: #a8b2d1"
          >
            <UIcon name="i-heroicons-arrow-left-20-solid" class="w-4 h-4" />
            All Steps
          </NuxtLink>
          <span style="color: #a8b2d1">/</span>
          <span
            class="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style="background-color: var(--brand-green-bright); color: #052e16"
          >
            {{ phaseLabel }}
          </span>
        </div>

        <!-- Step number + title -->
        <div class="flex items-start gap-4">
          <span
            class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold"
            style="background-color: var(--brand-green); color: #fff"
          >
            {{ stepNum }}
          </span>
          <div class="flex-1">
            <h1 class="text-3xl sm:text-4xl font-extrabold leading-tight">
              {{ stepData.title }}
            </h1>
            <p class="mt-2 text-base max-w-2xl" style="color: #a8b2d1">
              {{ stepData.goal }}
            </p>
          </div>
        </div>

        <!-- Theme chips -->
        <div class="flex flex-wrap gap-2 mt-5 ml-16">
          <span
            v-for="theme in stepData.themes"
            :key="theme"
            class="text-xs px-2.5 py-1 rounded-full font-medium"
            style="background-color: rgba(255,255,255,0.1); color: #e2e8f0"
          >
            {{ theme }}
          </span>
        </div>

        <!-- Actions row -->
        <div class="flex flex-wrap items-center gap-3 mt-6 ml-16">
          <!-- Find Resources -->
          <NuxtLink
            :to="resourceLink(stepData.topics)"
            class="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md transition-opacity hover:opacity-90"
            style="background-color: var(--brand-green); color: #fff"
          >
            <UIcon name="i-heroicons-magnifying-glass-20-solid" class="w-4 h-4" />
            Find Resources
          </NuxtLink>

          <!-- I'm on this step -->
          <button
            v-if="activeBusiness && !isCurrentStep"
            class="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md border transition-opacity"
            :style="{
              border: '1px solid var(--brand-green)',
              color: 'var(--brand-green-bright)',
              background: 'rgba(255,255,255,0.06)',
              opacity: updatingStep ? '0.6' : '1',
              cursor: updatingStep ? 'default' : 'pointer',
            }"
            :disabled="updatingStep"
            @click="setJourneyStep"
          >
            <UIcon name="i-heroicons-map-pin-20-solid" class="w-4 h-4" />
            <template v-if="updatingStep">Saving…</template>
            <template v-else>I'm on this step</template>
          </button>

          <!-- Current step badge -->
          <span
            v-if="activeBusiness && isCurrentStep"
            class="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md"
            style="background-color: rgba(255,255,255,0.12); color: var(--brand-green-bright)"
          >
            <UIcon name="i-heroicons-check-circle-20-solid" class="w-4 h-4" />
            Your current step
          </span>

          <!-- Sign in nudge -->
          <NuxtLink
            v-if="!user && !dataLoading"
            to="/login"
            class="text-sm font-medium transition-opacity hover:opacity-80"
            style="color: #a8b2d1"
          >
            Sign in to track your progress
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- Step selector bar -->
    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-16 lg:top-[112px] z-20">
      <UContainer class="max-w-4xl">
        <div class="flex items-center gap-3 py-3">
          <span class="text-sm font-semibold text-gray-500 shrink-0 hidden sm:block">Jump to step:</span>
          <select
            :value="stepNum"
            class="w-full max-w-xs text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            @change="onStepSelect"
          >
            <option
              v-for="s in JOURNEY_STEPS"
              :key="s.step"
              :value="s.step"
            >
              Step {{ s.step }}: {{ s.title }}
            </option>
          </select>
          <div class="flex items-center gap-1 ml-auto shrink-0">
            <NuxtLink
              v-if="prevStep"
              :to="`/journey/${prevStep}`"
              class="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
            >
              <UIcon name="i-heroicons-arrow-left-20-solid" class="w-4 h-4" />
              <span class="hidden sm:inline">Prev</span>
            </NuxtLink>
            <NuxtLink
              v-if="nextStep"
              :to="`/journey/${nextStep}`"
              class="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors text-white"
              style="background-color: var(--brand-green-dark)"
            >
              <span class="hidden sm:inline">Next</span>
              <UIcon name="i-heroicons-arrow-right-20-solid" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main content -->
    <div style="background-color: var(--brand-navy)" class="min-h-screen pb-20">
      <UContainer class="max-w-4xl py-10 px-4">

        <!-- Sections: single full-width column -->
        <div class="space-y-6">
          <div
            v-for="section in stepData.sections"
            :key="section.heading"
            class="bg-white rounded-xl p-6 shadow-sm"
            style="border: 1px solid #e5e7eb"
          >
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1 h-5 rounded-full shrink-0" style="background-color: var(--brand-green)" />
              <h2 class="text-lg font-bold" style="color: var(--brand-navy)">{{ section.heading }}</h2>
            </div>
            <p class="text-gray-600 leading-relaxed">{{ section.description }}</p>

            <!-- Per-section links -->
            <template v-if="section.links && section.links.length > 0">
              <div class="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <a
                  v-for="link in section.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-start gap-2 py-0.5 group w-full"
                >
                  <UIcon
                    name="i-heroicons-arrow-top-right-on-square-20-solid"
                    class="w-3.5 h-3.5 shrink-0 text-blue-400 mt-0.5"
                  />
                  <div>
                    <span class="text-sm font-medium leading-snug text-blue-600 group-hover:underline transition-colors">
                      {{ link.name }}
                    </span>
                    <p v-if="link.description" class="text-xs text-gray-500 mt-0.5 leading-snug">
                      {{ link.description }}
                    </p>
                  </div>
                </a>
              </div>
            </template>
          </div>
        </div>

        <!-- Bottom prev / next navigation -->
        <div class="flex items-center justify-between mt-12 pt-8 border-t border-white/15">
          <NuxtLink
            v-if="prevStep"
            :to="`/journey/${prevStep}`"
            class="flex items-center gap-2 group"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors group-hover:border-green-600"
              style="border-color: var(--brand-green)"
            >
              <UIcon name="i-heroicons-arrow-left-20-solid" class="w-4 h-4" style="color: var(--brand-green)" />
            </div>
            <div>
              <p class="text-xs font-medium" style="color: #a8b2d1">Previous</p>
              <p class="text-sm font-bold text-white">
                Step {{ prevStep }}: {{ JOURNEY_STEPS[prevStep - 1]?.title }}
              </p>
            </div>
          </NuxtLink>
          <div v-else />

          <NuxtLink
            v-if="nextStep"
            :to="`/journey/${nextStep}`"
            class="flex items-center gap-2 text-right group"
          >
            <div>
              <p class="text-xs font-medium" style="color: #a8b2d1">Next</p>
              <p class="text-sm font-bold text-white">
                Step {{ nextStep }}: {{ JOURNEY_STEPS[nextStep - 1]?.title }}
              </p>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors group-hover:border-green-600"
              style="border-color: var(--brand-green)"
            >
              <UIcon name="i-heroicons-arrow-right-20-solid" class="w-4 h-4" style="color: var(--brand-green)" />
            </div>
          </NuxtLink>
          <div v-else />
        </div>
      </UContainer>
    </div>
  </div>

  <!-- 404 fallback -->
  <div v-else class="flex flex-col items-center justify-center min-h-screen gap-4">
    <p class="text-gray-500">Step not found.</p>
    <NuxtLink to="/journey" class="text-sm font-semibold underline" style="color: var(--brand-green-dark)">
      Back to Journey
    </NuxtLink>
  </div>
</template>
