<script setup lang="ts">
import type { UserProfile, Business } from '~/types/profile'

useSeoMeta({
  title: 'Start Your Journey · Startup State Utah',
  description:
    'Follow the 19-step Utah Entrepreneur Journey to start, grow, and scale your business.',
})

// ---------------------------------------------------------------------------
// Step & phase data
// ---------------------------------------------------------------------------

interface StepDef {
  step: number
  title: string
  goal: string
  themes: string[]
  topics: string[]
}

interface PhaseDef {
  number: number
  label: string
  description: string
  steps: number[]
}

const PHASES: PhaseDef[] = [
  { number: 1, label: 'Getting Started', description: 'Validate your idea and lay the foundation', steps: [1, 2, 3] },
  { number: 2, label: 'Build Your Business', description: 'Develop your product, brand, and business plan', steps: [4, 5, 6, 7, 8] },
  { number: 3, label: 'Launch & Fund', description: 'Secure funding, find your space, and get compliant', steps: [9, 10, 11, 12] },
  { number: 4, label: 'Scale & Grow', description: 'Expand your team, win contracts, and reach new markets', steps: [13, 14, 15, 16, 17] },
  { number: 5, label: 'Special Situations', description: 'Relocate to Utah or plan your business exit', steps: [18, 19] },
]

const STEPS: StepDef[] = [
  { step: 1, title: 'Find Your Big Idea', goal: 'Identify and evaluate a business concept worth pursuing.', themes: ['Brainstorming', 'Self-assessment', 'Monetizing your passion'], topics: ['Start a Business', 'Entrepreneurship Communities'] },
  { step: 2, title: 'Important Business Skills', goal: 'Build the foundational knowledge needed to run a business.', themes: ['Accounting basics', 'Marketing & sales', 'Hiring', 'Intellectual property'], topics: ['Start a Business'] },
  { step: 3, title: 'Business Validation', goal: 'Confirm real customer demand before investing heavily.', themes: ['Market research', 'Customer interviews', 'MVP testing', 'Competitive analysis'], topics: ['Start a Business'] },
  { step: 4, title: 'Build Your Product or Service', goal: 'Develop a functional prototype or service offering.', themes: ['Prototyping', 'Manufacturing', 'IP protection', 'Product testing'], topics: ['Start a Business'] },
  { step: 5, title: 'Develop Your Brand & Marketing', goal: 'Establish your brand identity and plan to reach customers.', themes: ['Mission & vision', 'Logo & website', 'Social media', 'Trademark'], topics: ['Marketing and Sales', 'Start a Business'] },
  { step: 6, title: 'Write Your Business Plan', goal: 'Create a roadmap that guides operations and attracts investors.', themes: ['Business plan formats', 'Value proposition', 'Financial projections'], topics: ['Start a Business', 'Funding'] },
  { step: 7, title: 'Registration & Licensure', goal: 'Legally establish and register your business with the state.', themes: ['LLC vs. corporation', 'FEIN registration', 'State registration', 'Professional licensing'], topics: ['Start a Business'] },
  { step: 8, title: 'Establish Business Operations', goal: 'Set up the systems needed to run a compliant business.', themes: ['Business bank account', 'Accounting software', 'HR basics', 'Business insurance'], topics: ['Start a Business', 'Taxes and Finance'] },
  { step: 9, title: 'Obtain Funding', goal: 'Secure capital to launch and operate your business.', themes: ['Grants', 'Crowdfunding', 'SBA loans', 'Angel investors', 'Venture capital'], topics: ['Funding'] },
  { step: 10, title: 'Find Office Space', goal: 'Secure a productive physical environment for your business.', themes: ['Coworking spaces', 'Traditional leases', 'Commercial real estate'], topics: ['Start a Business'] },
  { step: 11, title: 'Pay Your Taxes', goal: 'Understand and fulfill your business tax obligations in Utah.', themes: ['State tax compliance', 'Sales tax', 'Payroll tax', 'Tax planning'], topics: ['Taxes and Finance'] },
  { step: 12, title: 'Join a Community', goal: 'Connect with peers, mentors, and professional networks.', themes: ['Networking', 'Chambers of commerce', 'Industry associations', 'Mentorship'], topics: ['Entrepreneurship Communities'] },
  { step: 13, title: 'Growth Stage Funding', goal: 'Access capital to scale and expand an established business.', themes: ['Investor pitching', 'Growth grants', 'Accelerators', 'Venture capital'], topics: ['Funding', 'Late Stage Growth'] },
  { step: 14, title: 'Strategic Planning for Growth', goal: 'Build a structured plan for scaling operations and leadership.', themes: ['Growth planning', 'Leadership development', 'Organizational scaling'], topics: ['Late Stage Growth'] },
  { step: 15, title: 'Workforce & Talent Acquisition', goal: 'Attract and retain the skilled employees your growth requires.', themes: ['Competitive compensation', 'Talent pipelines', 'Workforce development'], topics: ['Late Stage Growth'] },
  { step: 16, title: 'Obtain Government Contracts', goal: 'Compete for government contracts as a stable revenue stream.', themes: ['Federal contracting', '8(a) program', 'Compliance requirements'], topics: ['Late Stage Growth'] },
  { step: 17, title: 'International Trade', goal: 'Expand your business into international markets.', themes: ['Export strategy', 'International IP protection', 'Trade relationships'], topics: ['International Trade'] },
  { step: 18, title: 'Relocate Your Business to Utah', goal: "Leverage Utah's tax incentives and business-friendly environment.", themes: ['Tax incentives', 'Relocation support', 'Economic development'], topics: ['Relocate a Business to Utah'] },
  { step: 19, title: 'Close Your Business', goal: 'Navigate selling or dissolving your business responsibly.', themes: ['Business valuation', 'Sale process', 'Legal dissolution'], topics: ['Close or Exit a Business'] },
]

const stepMap = new Map<number, StepDef>(STEPS.map(s => [s.step, s]))

// ---------------------------------------------------------------------------
// Auth & business state
// ---------------------------------------------------------------------------

const user = useSupabaseUser()
const profile = ref<UserProfile | null>(null)
const activeBusiness = ref<Business | null>(null)
const dataLoading = ref(false)

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

const currentStep = computed(() => activeBusiness.value?.journey_step ?? null)

const currentStepDef = computed<StepDef | null>(() => {
  if (currentStep.value == null) return null
  return stepMap.get(currentStep.value) ?? null
})

const progressPercent = computed(() => {
  if (currentStep.value == null) return 0
  return Math.round((currentStep.value / 19) * 100)
})

function jumpToStep(n: number) {
  document.getElementById(`step-${n}`)?.scrollIntoView({ behavior: 'smooth' })
}

</script>

<template>
  <div>
    <!-- ------------------------------------------------------------------ -->
    <!-- Hero                                                                 -->
    <!-- ------------------------------------------------------------------ -->
    <section
      class="relative text-white py-16 px-4"
      style="background-color: var(--brand-navy); background-image: linear-gradient(rgba(13, 25, 45, 0.45), rgba(13, 25, 45, 0.45)), url('/brand/journey-page-header.webp'); background-size: cover; background-position: center;"
    >
      <UContainer class="max-w-7xl">
        <span
          class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-5"
          style="background-color: var(--brand-green-bright); color: #052e16"
        >
          The Entrepreneur Journey
        </span>
        <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight max-w-3xl">
          19 Steps to Building Your Business in Utah
        </h1>
        <p class="mt-4 text-lg max-w-2xl" style="color: #a8b2d1">
          A clear, phase-by-phase framework that walks you from initial idea to
          scaling — or relocating — your Utah business.
        </p>

        <!-- Progress row (logged-in users with an active business + journey_step) -->
        <div
          v-if="currentStep != null && currentStepDef != null"
          class="mt-8 rounded-xl p-5 max-w-2xl"
          style="background-color: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15)"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span class="text-sm font-semibold" style="color: var(--brand-green-bright)">
              Step {{ currentStep }} of 19 &mdash; {{ currentStepDef.title }}
            </span>
            <button
              class="text-xs font-semibold px-3 py-1 rounded-md transition-colors"
              style="background-color: var(--brand-green); color: #fff"
              @click="jumpToStep(currentStep!)"
            >
              Jump to step
            </button>
          </div>
          <!-- Progress bar -->
          <div class="w-full rounded-full h-1.5" style="background-color: rgba(255,255,255,0.15)">
            <div
              class="h-1.5 rounded-full transition-all duration-500"
              style="background-color: var(--brand-green)"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <p class="mt-2 text-xs" style="color: #a8b2d1">{{ progressPercent }}% complete</p>
        </div>
      </UContainer>
    </section>

    <!-- ------------------------------------------------------------------ -->
    <!-- Phase sections                                                       -->
    <!-- ------------------------------------------------------------------ -->
    <div style="background-color: var(--brand-navy)" class="pb-20">
      <UContainer class="max-w-7xl py-12 px-4">

        <div
          v-for="phase in PHASES"
          :key="phase.number"
          class="mb-14"
        >
          <!-- Phase heading row -->
          <div class="border-t border-white/15 pt-8 mb-6">
            <div class="flex flex-wrap items-baseline gap-3">
              <span
                class="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style="background-color: var(--brand-green-bright); color: #052e16"
              >
                Phase {{ phase.number }}
              </span>
              <h2 class="text-2xl font-extrabold text-white">
                {{ phase.label }}
              </h2>
            </div>
            <p class="mt-1 text-sm" style="color: #a8b2d1">{{ phase.description }}</p>
          </div>

          <!-- Step cards grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <NuxtLink
              v-for="stepNum in phase.steps"
              :key="stepNum"
              :id="`step-${stepNum}`"
              :to="`/journey/${stepNum}`"
              class="relative bg-white rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md group"
              :style="{
                border: currentStep === stepNum
                  ? '2px solid var(--brand-green)'
                  : '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
              }"
            >
              <!-- Left accent bar -->
              <div
                class="absolute top-0 left-0 bottom-0 w-1"
                style="background-color: var(--brand-green)"
              />

              <!-- "Your step" badge pinned top-right -->
              <div
                v-if="currentStep === stepNum"
                class="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                style="background-color: var(--brand-green); color: #fff"
              >
                Your step
              </div>

              <!-- Card body -->
              <div class="pl-5 pr-4 pt-4 pb-4 flex items-start gap-3">
                <!-- Step number badge -->
                <span
                  class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold leading-none"
                  style="background-color: var(--brand-green-bright); color: #052e16"
                >
                  {{ stepNum }}
                </span>

                <div class="flex-1 min-w-0 pr-6">
                  <p class="font-bold text-base leading-snug" style="color: var(--brand-navy)">
                    {{ stepMap.get(stepNum)?.title }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500 leading-snug">
                    {{ stepMap.get(stepNum)?.goal }}
                  </p>
                </div>

              </div>
            </NuxtLink>
          </div>
        </div>

      </UContainer>
    </div>

    <ChatbotChatWidget />
  </div>
</template>
