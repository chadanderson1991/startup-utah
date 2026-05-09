<script setup lang="ts">
import { nextTick } from 'vue'
import { useChat, type UserContext } from '~/composables/useChat'
import type { Business } from '~/types/profile'

const user = useSupabaseUser()
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

// Authenticated user's profile + active business (for personalized greeting / chat context)
const { data: profile } = await useAsyncData(
  'sprig-profile',
  async () => {
    if (!user.value) return null
    return $fetch('/api/profile')
  },
  { watch: [user] },
)
const { data: businesses } = await useAsyncData<Business[]>(
  'sprig-businesses',
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
  const saved = (profile.value as { active_business_id?: string | null } | null)?.active_business_id
  activeBusinessId.value = list.find(b => b.id === saved)?.id ?? list[0].id
}, { immediate: true })

const userContext = ref<UserContext>({
  stage: '', industry: '', county: '', communities: [],
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
    messages.value[0].content = 'Hello, what are you looking to do today?'
  }
}
onMounted(() => {
  if (user.value) fetchPersonalizedGreeting()
})
watch(user, (val) => {
  if (val) fetchPersonalizedGreeting()
})

// Quick-start cards adapt to auth + business state
//   1. Anonymous   → 4 generic journey-stage cards
//   2. Logged in, no business linked → starting-focused + a card to link a business
//   3. Logged in, business in idea/early stage → starting & funding focus
//   4. Logged in, business in growth/established stage → growth/scale/exit focus
type QuickStartCard =
  | { label: string; message: string; bg: string; to?: never }
  | { label: string; to: string;     bg: string; message?: never }

const quickStartCards = computed<QuickStartCard[]>(() => {
  if (!user.value) {
    return [
      { label: 'Thinking of starting my business', message: "I'm thinking about starting a business in Utah. Where do I start?", bg: '#1f5f3f' },
      { label: 'Starting my business',             message: "I'm ready to start my business in Utah. What are the steps?", bg: '#5e3a8a' },
      { label: 'Grow my business',                 message: 'I have an existing business in Utah and I want to grow it. What resources are available?', bg: '#1e3a8a' },
      { label: 'Sell or exit my business',         message: "I'm looking to sell or exit my business in Utah. What support is available?", bg: '#0e7490' },
    ]
  }

  const list = businesses.value ?? []

  // Logged in but no businesses linked → focus on starting + nudge to link a business
  if (!list.length) {
    return [
      { label: 'Thinking of starting my business', message: "I'm thinking about starting a business in Utah. Recommend the best resources for me to get oriented.", bg: '#1f5f3f' },
      { label: 'Starting my business',             message: "I'm ready to start my business in Utah. Walk me through the first steps and recommend the right state programs.", bg: '#5e3a8a' },
      { label: 'Link my existing business',        to: '/profile',                                                                                                                bg: '#0e7490' },
    ]
  }

  const business = list.find(b => b.id === activeBusinessId.value) ?? list[0]
  const stage = business.stage
  const where = business.county ? `${business.county} County` : 'Utah'

  if (stage === 'idea' || stage === 'early') {
    return [
      { label: 'Recommended for me right now',     message: `Based on my business "${business.name}" (${stage} stage in ${where}, journey step ${business.journey_step}/19), recommend the most relevant Utah state resources I should pursue right now.`, bg: '#1f5f3f' },
      { label: 'Early-stage funding',              message: `What funding options (grants, pitch competitions, micro-loans) are available for an ${stage}-stage business in ${where}?`,                                                                                  bg: '#5e3a8a' },
      { label: 'Find a mentor or program',         message: `What mentorship programs or accelerators in Utah would be a good fit for my business "${business.name}"?`,                                                                                                  bg: '#1e3a8a' },
      { label: 'My next journey step',             message: `I'm at journey step ${business.journey_step}/19 with my business "${business.name}". What should I focus on next, and which resources support that step?`,                                                  bg: '#0e7490' },
    ]
  }

  // growth / established
  return [
    { label: 'Resources to scale',                 message: `My business "${business.name}" is in the ${stage} stage in ${where}. Recommend Utah resources to help me scale.`, bg: '#1f5f3f' },
    { label: 'Growth-stage funding',               message: `What growth-stage funding (venture capital, growth funds, debt) is available to a ${stage}-stage business in ${where}?`,                                                                                                                              bg: '#5e3a8a' },
    { label: 'Talent & hiring',                    message: `What Utah resources can help me find and hire talent for my business "${business.name}"?`, bg: '#1e3a8a' },
    { label: 'Plan an exit',                       message: `I'm considering selling or exiting "${business.name}". What Utah resources, professional networks, or programs support that?`,                                                                              bg: '#0e7490' },
  ]
})

const hasStartedChat = computed(() => messages.value.some(m => m.role === 'user'))

// True when the given message is the active assistant reply still streaming text
function isAssistantStreaming(idx: number, msg: { role: string; content?: string }): boolean {
  return (
    isStreaming.value
    && msg.role === 'assistant'
    && idx === messages.value.length - 1
    && !!msg.content && msg.content !== '...'
  )
}

// Brief cyan ripple from the input pill when a user message is sent
const sendRippleActive = ref(false)
function flashSendRipple() {
  sendRippleActive.value = true
  setTimeout(() => { sendRippleActive.value = false }, 600)
}

// Sprig animation states:
//   • streaming        → bounce.gif
//   • idle "fidget"    → lookingaround.gif OR blinking.gif (random, every 20–30s, ~3s window)
//   • otherwise        → idle.png
const idleAnimation = ref<string | null>(null)
let idleTimer: ReturnType<typeof setTimeout> | null = null
let revertTimer: ReturnType<typeof setTimeout> | null = null

function clearTimers() {
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
  if (revertTimer) { clearTimeout(revertTimer); revertTimer = null }
}

// blinking.gif and lookingaround.gif are patched to NETSCAPE2.0 loopCount=1,
// so the browser plays them through exactly once and freezes on the last frame.
// The hold window below just covers the longest plausible single play before
// we swap the src back to idle.png.
const FIDGET_HOLD_MS = 4500

function scheduleIdleAnimation() {
  // Wait 20–30s before next fidget
  const delay = 20_000 + Math.random() * 10_000
  idleTimer = setTimeout(() => {
    // Skip if Sprig is currently bouncing for a request
    if (!isStreaming.value) {
      const choices = ['/sprig/lookingaround.gif', '/sprig/blinking.gif']
      idleAnimation.value = choices[Math.floor(Math.random() * choices.length)]
      revertTimer = setTimeout(() => {
        idleAnimation.value = null
        scheduleIdleAnimation()
      }, FIDGET_HOLD_MS)
    } else {
      scheduleIdleAnimation()
    }
  }, delay)
}

onMounted(() => scheduleIdleAnimation())
onBeforeUnmount(() => clearTimers())

const sprigImage = computed(() => {
  if (isStreaming.value) return '/sprig/bounce.gif'
  if (idleAnimation.value) return idleAnimation.value
  return '/sprig/idle.png'
})

async function send(text: string) {
  if (!text || isStreaming.value) return
  flashSendRipple()
  await sendMessage(text, userContext.value, activeBusinessId.value ?? undefined)
}
async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  await send(text)
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
  if (user.value) fetchPersonalizedGreeting()
}

watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })
</script>

<template>
  <!-- Outer relative wrapper so Sprig can overflow the panel's left edge -->
  <div class="relative">
    <!-- Desktop: Sprig overflows the panel's left edge, half-outside the panel -->
    <img
      :src="sprigImage"
      alt="Sprig the Startup State mascot"
      class="hidden lg:block absolute z-10 select-none pointer-events-none sprig-idle-glow"
      draggable="false"
      style="
        left: -5rem;
        top: 50%;
        transform: translateY(-50%);
        width: 11rem;
        height: auto;
      "
    />

    <div
      class="sprig-panel rounded-2xl px-6 sm:px-10 py-10 relative overflow-hidden"
      style="
        background-image:
          radial-gradient(circle at 20% 30%, rgba(19, 224, 131, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 85% 70%, rgba(89, 38, 165, 0.08) 0%, transparent 50%);
      "
    >
      <!-- Mobile/tablet: Sprig sits inline above content (no room for him to overflow) -->
      <div class="flex justify-center mb-6 lg:hidden">
        <img
          :src="sprigImage"
          alt="Sprig the Startup State mascot"
          class="w-32 h-auto select-none pointer-events-none sprig-idle-glow"
          draggable="false"
        />
      </div>

      <!-- Right-side content. On lg+ leave room for the half of Sprig that overlaps the panel. -->
      <div class="min-w-0 lg:pl-24">
        <!-- EMPTY STATE: bubble column + cards column (side-by-side on lg+, stacked on mobile) -->
        <div
          v-if="!hasStartedChat"
          class="flex flex-col lg:flex-row gap-6 items-start"
        >
          <!-- Greeting bubble (own column) -->
          <div
            class="sprig-bubble-ai relative rounded-2xl px-5 py-4 shadow-lg w-full lg:w-72 lg:shrink-0"
            style="border-bottom-left-radius: 6px;"
          >
            <p class="text-base leading-relaxed">
              {{ messages[0]?.content && messages[0].content !== '...'
                ? messages[0].content
                : 'Hello, what are you looking to do today?' }}
            </p>
            <span
              class="hidden lg:block absolute top-6 -left-2 w-4 h-4"
              style="background-color: var(--sprig-ai-bg); clip-path: polygon(100% 0, 100% 100%, 0 50%);"
            />
          </div>

          <!-- Cards column — wraps to a 2-column grid, up to 4 cards visible at a time -->
          <div class="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            <template v-for="card in quickStartCards" :key="card.label">
              <NuxtLink
                v-if="card.to"
                :to="card.to"
                class="rounded-lg p-4 text-left text-white font-bold uppercase tracking-wide text-sm leading-snug shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl no-underline block"
                :style="{ backgroundColor: card.bg }"
              >
                {{ card.label }}
              </NuxtLink>
              <button
                v-else
                :disabled="isStreaming"
                class="rounded-lg p-4 text-left text-white font-bold uppercase tracking-wide text-sm leading-snug shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                :style="{ backgroundColor: card.bg }"
                @click="send(card.message!)"
              >
                {{ card.label }}
              </button>
            </template>
          </div>
        </div>

        <!-- ACTIVE CHAT: thread takes the full right area -->
        <div
          v-else
          ref="messagesContainer"
          class="chat-scroll flex flex-col gap-3 overflow-y-auto pr-3"
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
              :class="[
                msg.role === 'user'
                  ? 'sprig-bubble-user rounded-br-sm'
                  : 'sprig-bubble-ai rounded-bl-sm',
                isAssistantStreaming(idx, msg) && 'sprig-bubble-streaming',
              ]"
            >
              <template v-if="msg.content && msg.content !== '...'">{{ msg.content }}</template>
              <span v-else class="flex items-center gap-1 py-1">
                <span class="sprig-typing-dot" />
                <span class="sprig-typing-dot" />
                <span class="sprig-typing-dot" />
              </span>
            </div>
            <div v-if="msg.resources?.length" class="w-full mt-2 flex flex-wrap gap-2">
              <div
                v-for="r in msg.resources"
                :key="r.id"
                class="w-full sm:w-[45%]"
              >
                <ChatbotChatResourceCard :resource="r" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Input below the panel -->
  <div
    class="sprig-input-shell mt-4 rounded-full shadow-2xl flex items-center pl-6 pr-2 py-2"
    :class="{ 'sprig-send-ripple': sendRippleActive }"
  >
    <input
      v-model="inputText"
      type="text"
      placeholder="I'm thinking of starting an agricultural business"
      class="flex-1 bg-transparent border-0 focus:outline-none text-base py-2"
      :disabled="isStreaming"
      @keydown="handleKeydown"
    />
    <button
      type="button"
      class="sprig-send-btn flex items-center justify-center"
      style="width: 2.5rem; height: 2.5rem;"
      :disabled="isStreaming || !inputText.trim()"
      :aria-label="'Send message'"
      @click="handleSend"
    >
      <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5" />
    </button>
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
</template>

<style scoped>
/* Custom scrollbar — 4px amber thumb, transparent track, no buttons */
.chat-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgb(255, 174, 0) transparent;
}
.chat-scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.chat-scroll::-webkit-scrollbar-track,
.chat-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
.chat-scroll::-webkit-scrollbar-thumb {
  background-color: rgb(255, 174, 0);
  border-radius: 2px;
}
.chat-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
</style>
