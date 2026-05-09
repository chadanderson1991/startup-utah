<script setup lang="ts">
import { nextTick } from 'vue'
import { useChat, type UserContext } from '~/composables/useChat'
import { UTAH_COUNTIES, INDUSTRIES, COMMUNITIES } from '~/lib/constants'
import type { Business } from '~/types/profile'

const BUSINESS_STAGES = [
  { value: 'idea', label: 'Just an idea', sub: 'Still exploring concepts' },
  { value: 'early', label: 'Early stage', sub: 'Getting started (0–2 yrs)' },
  { value: 'growth', label: 'Growing', sub: 'Scaling up (2–5 yrs)' },
  { value: 'established', label: 'Established', sub: '5+ years in business' },
]

const COMMUNITY_OPTIONS = COMMUNITIES.filter(c => c !== 'Any').map(c => ({
  value: c.toLowerCase().replace(/\s+/g, '_'),
  label: c,
}))

const user = useSupabaseUser()
const isOpen = ref(false)
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

// Display mode — compact bottom-right widget OR full expanded panel.
// Set at toggle time based on scroll position so it doesn't flip while open.
const displayMode = ref<'compact' | 'expanded'>('compact')
const isAtTop = ref(true)

function updateScrollPos() {
  if (typeof window !== 'undefined') {
    isAtTop.value = window.scrollY < 80
  }
}

onMounted(() => {
  updateScrollPos()
  window.addEventListener('scroll', updateScrollPos, { passive: true })
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateScrollPos)
  }
})

// Quick-start cards shown in the expanded view's empty state
const quickStartCards = [
  {
    label: 'Thinking of starting my business',
    message: "I'm thinking about starting a business in Utah. Where do I start?",
    bg: '#1f5f3f',
  },
  {
    label: 'Starting my business',
    message: "I'm ready to start my business in Utah. What are the steps?",
    bg: '#5e3a8a',
  },
  {
    label: 'Grow my business',
    message: 'I have an existing business in Utah and I want to grow it. What resources are available?',
    bg: '#1e3a8a',
  },
  {
    label: 'Sell or exit my business',
    message: "I'm looking to sell or exit my business in Utah. What support is available?",
    bg: '#0e7490',
  },
]

async function sendQuickStart(message: string) {
  if (isStreaming.value) return
  await sendMessage(message, userContext.value, activeBusinessId.value ?? undefined)
}

// Whether the user has actually started a conversation (vs. just the greeting)
const hasStartedChat = computed(() => messages.value.some(m => m.role === 'user'))

// Authenticated user's profile + businesses
const { data: profile, refresh: refreshProfile } = await useAsyncData(
  'chat-profile',
  async () => {
    if (!user.value) return null
    return $fetch('/api/profile')
  },
  { watch: [user] },
)
const { data: businesses } = await useAsyncData<Business[]>(
  'chat-businesses',
  async () => {
    if (!user.value) return []
    return $fetch<Business[]>('/api/businesses')
  },
  { watch: [user] },
)
const activeBusinessId = ref<string | null>(null)
watch([profile, businesses, user], () => {
  if (!user.value) { activeBusinessId.value = null; return }
  const list = businesses.value ?? []
  if (!list.length) { activeBusinessId.value = null; return }
  // Prefer profile's saved active business
  const saved = (profile.value as { active_business_id?: string | null } | null)?.active_business_id
  activeBusinessId.value = list.find(b => b.id === saved)?.id ?? list[0].id
}, { immediate: true })
watch(activeBusinessId, (val, old) => {
  if (val !== old && old !== null) {
    greetingFetched.value = false
    clearMessages()
    if (user.value) fetchPersonalizedGreeting()
  }
})

// Onboarding state
const onboardingStep = ref(1)
const onboardingDone = ref(false)
const userContext = ref<UserContext>({
  stage: '',
  industry: '',
  county: '',
  communities: [],
})

const { messages, isStreaming, sendMessage, clearMessages } = useChat()

const greetingFetched = ref(false)

async function fetchPersonalizedGreeting() {
  if (greetingFetched.value || !user.value) return
  greetingFetched.value = true
  messages.value[0].content = '...'
  try {
    const { greeting } = await $fetch<{ greeting: string }>('/api/chat/greeting', {
      method: 'POST',
      body: { businessId: activeBusinessId.value ?? undefined },
    })
    messages.value[0].content = greeting
  } catch {
    messages.value[0].content = "Welcome back! I'm here to help you navigate Utah's startup resources. What would you like to work on today?"
  }
}

function toggle() {
  if (!isOpen.value) {
    // Decide expanded vs compact at open time so it doesn't flip mid-session
    displayMode.value = isAtTop.value ? 'expanded' : 'compact'
  }
  isOpen.value = !isOpen.value
  if (isOpen.value) fetchPersonalizedGreeting()
}

function close() {
  isOpen.value = false
}

function selectStage(stage: string) {
  userContext.value.stage = stage
  onboardingStep.value = 2
}

function finishOnboarding() {
  onboardingDone.value = true
}

function skipOnboarding() {
  onboardingDone.value = true
}

function toggleCommunity(val: string) {
  const list = userContext.value.communities ?? []
  const idx = list.indexOf(val)
  if (idx === -1) list.push(val)
  else list.splice(idx, 1)
  userContext.value.communities = [...list]
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  inputText.value = ''
  await sendMessage(text, userContext.value, activeBusinessId.value ?? undefined)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleClear() {
  clearMessages()
  greetingFetched.value = false
  onboardingDone.value = false
  onboardingStep.value = 1
  userContext.value = { stage: '', industry: '', county: '', communities: [] }
  if (user.value) fetchPersonalizedGreeting()
}

watch(
  messages,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  },
  { deep: true },
)
</script>

<template>
  <!-- ============== EXPANDED MODE (Sprig hero panel) ============== -->
  <div v-if="isOpen && displayMode === 'expanded'" class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div
      class="absolute inset-0"
      style="background-color: rgba(8, 25, 46, 0.85); backdrop-filter: blur(4px);"
      @click="close"
    />

    <!-- Centered panel container -->
    <div class="relative h-full overflow-y-auto flex items-start justify-center pt-24 pb-12 px-4">
      <div class="relative w-full max-w-6xl pointer-events-auto">
        <!-- Close button -->
        <button
          class="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-semibold"
          @click="close"
        >
          Close
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>

        <!-- Chat panel -->
        <div
          class="rounded-2xl px-6 sm:px-10 py-10 relative overflow-hidden"
          style="
            background-color: var(--brand-navy);
            border: 1px solid rgba(17, 223, 129, 0.35);
            background-image:
              radial-gradient(circle at 20% 30%, rgba(17, 223, 129, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 85% 70%, rgba(94, 58, 138, 0.06) 0%, transparent 50%);
          "
        >
          <div class="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            <!-- Sprig mascot (left) -->
            <div class="flex flex-col items-center shrink-0 w-full lg:w-44">
              <img
                src="/sprig/thinking.png"
                alt="Sprig the Startup State mascot"
                class="w-32 lg:w-40 h-auto select-none pointer-events-none"
                draggable="false"
              />
            </div>

            <!-- Right side content -->
            <div class="flex-1 w-full flex flex-col gap-5 min-w-0">
              <!-- Greeting bubble (top of right side) -->
              <div
                v-if="!hasStartedChat"
                class="relative bg-white rounded-2xl px-5 py-4 max-w-md shadow-lg"
                style="border-bottom-left-radius: 6px;"
              >
                <p class="text-gray-800 text-base leading-relaxed">
                  {{ messages[0]?.content && messages[0].content !== '...'
                    ? messages[0].content
                    : 'Hello, what are you looking to do today?' }}
                </p>
                <!-- Pointer arrow toward Sprig (left side) -->
                <span
                  class="hidden lg:block absolute top-6 -left-2 w-4 h-4 bg-white"
                  style="clip-path: polygon(100% 0, 100% 100%, 0 50%);"
                />
              </div>

              <!-- Quick-start cards OR chat thread -->
              <div v-if="!hasStartedChat" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  v-for="card in quickStartCards"
                  :key="card.label"
                  :disabled="isStreaming"
                  class="rounded-lg p-5 text-left text-white font-bold uppercase tracking-wide text-sm leading-snug shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  :style="{ backgroundColor: card.bg }"
                  @click="sendQuickStart(card.message)"
                >
                  {{ card.label }}
                </button>
              </div>

              <!-- Chat thread (after first user message) -->
              <div
                v-else
                ref="messagesContainer"
                class="flex flex-col gap-3 overflow-y-auto"
                style="max-height: 50vh;"
              >
                <div
                  v-for="(msg, idx) in messages"
                  :key="idx"
                  class="flex flex-col"
                  :class="msg.role === 'user' ? 'items-end' : 'items-start'"
                >
                  <div
                    class="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md"
                    :class="msg.role === 'user'
                      ? 'sprig-bubble-user rounded-br-sm'
                      : 'sprig-bubble-ai rounded-bl-sm'"
                  >
                    <template v-if="msg.content && msg.content !== '...'">{{ msg.content }}</template>
                    <span v-else class="flex items-center gap-1 py-1">
                      <span class="sprig-typing-dot" />
                      <span class="sprig-typing-dot" />
                      <span class="sprig-typing-dot" />
                    </span>
                  </div>
                  <div
                    v-if="msg.resources?.length"
                    class="w-full mt-2 flex flex-wrap gap-2"
                  >
                    <div
                      v-for="r in msg.resources"
                      :key="r.id"
                      class="w-[45%]"
                    >
                      <ChatbotChatResourceCard :resource="r" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input below panel -->
        <div class="mt-4 bg-white rounded-full shadow-2xl flex items-center pl-6 pr-2 py-2">
          <input
            v-model="inputText"
            type="text"
            placeholder="I'm thinking of starting an agricultural business"
            class="flex-1 bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-400 text-base py-2"
            :disabled="isStreaming"
            @keydown="handleKeydown"
          />
          <UButton
            icon="i-heroicons-paper-airplane"
            color="primary"
            class="rounded-full"
            size="lg"
            :disabled="isStreaming || !inputText.trim()"
            @click="handleSend"
          />
        </div>

        <!-- Restart link (only when chat has started) -->
        <div v-if="hasStartedChat" class="mt-3 flex justify-end">
          <button
            class="text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1"
            @click="handleClear"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            Start over
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ============== COMPACT MODE (existing bottom-right widget) ============== -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat card -->
    <div
      v-if="isOpen && displayMode === 'compact'"
      class="mb-3 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      style="width: 420px; height: 600px"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3 shrink-0"
        style="background-color: var(--brand-green-dark)"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-white" />
          <div>
            <span class="text-white font-semibold text-sm">Startup Sprig</span>
            <p v-if="onboardingDone && userContext.stage" class="text-blue-200 text-xs leading-none mt-0.5">
              {{ BUSINESS_STAGES.find(s => s.value === userContext.stage)?.label }}
              <template v-if="userContext.industry"> · {{ userContext.industry }}</template>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <UButton icon="i-heroicons-arrow-path" size="xs" variant="ghost" color="white" title="Start over" @click="handleClear" />
          <UButton icon="i-heroicons-x-mark" size="xs" variant="ghost" color="white" title="Close" @click="close" />
        </div>
      </div>

      <!-- ONBOARDING (only for logged-out users) -->
      <div v-if="!onboardingDone && !user" class="flex-1 flex flex-col overflow-y-auto px-4 py-5 gap-4">

        <!-- Step 1: Business stage -->
        <div v-if="onboardingStep === 1">
          <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Step 1 of 3</p>
          <p class="text-sm font-semibold text-gray-800 mb-3">What stage is your business?</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in BUSINESS_STAGES"
              :key="s.value"
              class="text-left rounded-xl border-2 px-3 py-2.5 transition-all"
              :class="userContext.stage === s.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'"
              @click="selectStage(s.value)"
            >
              <p class="text-sm font-medium text-gray-800">{{ s.label }}</p>
              <p class="text-xs text-gray-500">{{ s.sub }}</p>
            </button>
          </div>
        </div>

        <!-- Step 2: Location + Industry -->
        <div v-if="onboardingStep === 2" class="flex flex-col gap-3">
          <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Step 2 of 3</p>
          <p class="text-sm font-semibold text-gray-800">Where is your business?</p>
          <USelect
            v-model="userContext.county"
            :options="[{ label: 'Select a county...', value: '' }, ...UTAH_COUNTIES.map(c => ({ label: c + ' County', value: c }))]"
            size="sm"
          />
          <p class="text-sm font-semibold text-gray-800 mt-1">What industry are you in?</p>
          <USelect
            v-model="userContext.industry"
            :options="[{ label: 'Select an industry...', value: '' }, ...INDUSTRIES.map(i => ({ label: i, value: i }))]"
            size="sm"
          />
          <UButton color="primary" block size="sm" class="mt-1" @click="onboardingStep = 3">
            Continue
          </UButton>
        </div>

        <!-- Step 3: Community identity -->
        <div v-if="onboardingStep === 3" class="flex flex-col gap-3">
          <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Step 3 of 3</p>
          <p class="text-sm font-semibold text-gray-800">Do any of these describe you? <span class="text-gray-400 font-normal">(optional)</span></p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in COMMUNITY_OPTIONS"
              :key="c.value"
              class="px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
              :class="userContext.communities?.includes(c.value)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-600 hover:border-blue-400'"
              @click="toggleCommunity(c.value)"
            >
              {{ c.label }}
            </button>
          </div>
          <div class="flex gap-2 mt-1">
            <UButton variant="outline" color="gray" size="sm" class="flex-1" @click="skipOnboarding">
              Skip
            </UButton>
            <UButton color="primary" size="sm" class="flex-1" @click="finishOnboarding">
              Start Chat
            </UButton>
          </div>
        </div>

      </div>

      <!-- CHAT -->
      <template v-else>
        <!-- Business selector (logged-in users with 2+ businesses) -->
        <div v-if="user && businesses && businesses.length > 1" class="px-3 pt-2 pb-1 border-b border-gray-100 shrink-0">
          <select
            v-model="activeBusinessId"
            class="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option v-for="b in businesses" :key="b.id" :value="b.id">
              {{ b.name }} — Step {{ b.journey_step }}/19
            </option>
          </select>
        </div>
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <!-- Bubble -->
            <div
              class="max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              :class="msg.role === 'user'
                ? 'sprig-bubble-user rounded-br-sm'
                : 'sprig-bubble-ai rounded-bl-sm'"
            >
              <template v-if="msg.content && msg.content !== '...'">{{ msg.content }}</template>
              <span v-else class="flex items-center gap-1 py-1">
                <span class="sprig-typing-dot" />
                <span class="sprig-typing-dot" />
                <span class="sprig-typing-dot" />
              </span>
            </div>

            <!-- Resource cards -->
            <div
              v-if="msg.resources?.length"
              class="w-full mt-2 flex flex-wrap gap-2"
            >
              <div
                v-for="r in msg.resources"
                :key="r.id"
                class="w-[45%]"
              >
                <ChatbotChatResourceCard :resource="r" />
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="px-3 py-3 border-t border-gray-100 flex gap-2 shrink-0">
          <UInput
            v-model="inputText"
            placeholder="Ask about Utah startup resources..."
            class="flex-1"
            :disabled="isStreaming"
            @keydown="handleKeydown"
          />
          <UButton
            icon="i-heroicons-paper-airplane"
            color="primary"
            :disabled="isStreaming || !inputText.trim()"
            @click="handleSend"
          />
        </div>
      </template>
    </div>

    <!-- Toggle button (hidden while the expanded panel is open) -->
    <UButton
      v-if="!(isOpen && displayMode === 'expanded')"
      size="lg"
      class="rounded-full shadow-lg px-5"
      :style="{ backgroundColor: 'var(--brand-green-dark)', borderColor: 'var(--brand-green-dark)' }"
      @click="toggle"
    >
      <template #leading>
        <UIcon
          :name="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-chat-bubble-left-ellipsis'"
          class="w-5 h-5 text-white"
        />
      </template>
      <span class="text-white font-medium">Navigator</span>
    </UButton>
  </div>
</template>
