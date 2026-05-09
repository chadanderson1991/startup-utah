<script setup lang="ts">
import { nextTick } from 'vue'
import { useChat, type UserContext } from '~/composables/useChat'
import { useActiveBusiness } from '~/composables/useActiveBusiness'
import { useSprigPanelVisibility } from '~/composables/useSprigPanelVisibility'
import { useQuickStartCards } from '~/composables/useQuickStartCards'
import { SECTORS, STAGES, EMPLOYEE_RANGES } from '~/lib/constants'

const user = useSupabaseUser()
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)
const panelRoot = ref<HTMLDivElement | null>(null)
const sprigPanelInView = useSprigPanelVisibility()

// Anonymous-user flow state. Only meaningful when !user.value — drives the
// pill set + greeting text. 'initial' shows the 4 top-level pills; the others
// route into branched experiences. Authenticated users skip this entirely.
type AnonFlow = 'initial' | 'investor' | 'founder' | 'browsing'
const anonFlow = ref<AnonFlow>('initial')

const ANON_GREETINGS: Record<AnonFlow, string> = {
  initial: "Hi! I'm Startup Sprig. I'll help you find the right state programs and resources for your specific situation. Sign in or create a profile and I can tailor my recommendations to your business.",
  investor: "Great! Tell me what kinds of Utah companies you'd like to discover and I'll drop you on the startup map with those filters pre-applied.",
  founder: "Awesome — let's get you oriented. Where are you in your business journey?",
  browsing: "Sounds good. Let me know if you're browsing for anything specific and I'll see how I can help.",
}

// Investor sub-flow selections — drive the /map URL filters.
const investorSectors = ref<string[]>([])
const investorStages = ref<string[]>([])
const investorTeamSizes = ref<string[]>([])

const investorMapUrl = computed(() => {
  const params = new URLSearchParams()
  if (investorSectors.value.length) params.set('sectors', investorSectors.value.join(','))
  if (investorStages.value.length) params.set('stages', investorStages.value.join(','))
  if (investorTeamSizes.value.length) params.set('employee_ranges', investorTeamSizes.value.join(','))
  const qs = params.toString()
  return qs ? `/map?${qs}` : '/map'
})

// Build a natural-language query from the investor chip selections and
// send it to Sprig (in investor mode — see profileMode below). Sprig's
// investor system prompt + injected company DB will return the matches.
function findCompaniesFromSelections() {
  const parts: string[] = []
  if (investorSectors.value.length)
    parts.push(`in the ${investorSectors.value.join(', ')} sector${investorSectors.value.length > 1 ? 's' : ''}`)
  if (investorStages.value.length)
    parts.push(`at the ${investorStages.value.join(', ')} stage${investorStages.value.length > 1 ? 's' : ''}`)
  if (investorTeamSizes.value.length)
    parts.push(`with a team size of ${investorTeamSizes.value.join(' or ')}`)

  const query = parts.length
    ? `Find me Utah startups ${parts.join(' ')}. List the top matches with their sector, stage, and a one-line description.`
    : 'List a handful of interesting Utah startups across different sectors and stages.'
  send(query)
}

type InvestorFilterKey = 'sectors' | 'stages' | 'teamSizes'
function toggleInvestor(key: InvestorFilterKey, value: string) {
  // Refs are auto-unwrapped when passed through a template handler, so we
  // dispatch to the right ref by key here instead of taking the ref itself.
  const target =
    key === 'sectors' ? investorSectors
    : key === 'stages' ? investorStages
    : investorTeamSizes
  target.value = target.value.includes(value)
    ? target.value.filter(v => v !== value)
    : [...target.value, value]
}

// Shared profile + businesses + active-business state (auth-aware loading is
// handled inside the composable, so the panel has business context as soon as
// the Supabase session resolves).
const { profile, activeBusiness, ensureLoaded } = useActiveBusiness()
const activeBusinessId = computed(() => activeBusiness.value?.id ?? null)

// Investor mode — drives both pill set (via useQuickStartCards) and the
// `mode` parameter sent with each chat message.
// Anonymous users who picked "I am an investor" in the welcome flow also
// route through investor mode so Sprig has the company DB + the right
// system prompt (entrepreneur mode would refuse company-listing queries).
const profileMode = computed(() =>
  profile.value?.profile_type === 'investor' ||
  (!user.value && anonFlow.value === 'investor')
    ? 'investor' as const
    : 'entrepreneur' as const,
)

const userContext = ref<UserContext>({
  stage: '', industry: '', county: '', communities: [],
})

const { messages, isStreaming, sendMessage, clearMessages } = useChat()

function chooseAnonFlow(flow: AnonFlow) {
  anonFlow.value = flow
  // Update the greeting bubble to match the new stage. Authenticated users
  // get their personalized greeting elsewhere, so we only touch this when anon.
  if (!user.value) {
    messages.value[0].content = ANON_GREETINGS[flow]
  }
}

const greetingFetched = ref(false)
async function fetchPersonalizedGreeting() {
  if (greetingFetched.value || !user.value) return
  greetingFetched.value = true
  messages.value[0].content = '...'
  try {
    // Wait for the active-business data to land so the greeting endpoint
    // gets a real businessId (otherwise it produces a generic greeting
    // that ignores the user's business name + journey step).
    await ensureLoaded()
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

// Adaptive quick-start pills (investor mode handled inside the composable;
// logic shared with the floating ChatWidget popup).
const quickStartCards = useQuickStartCards()

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
  // Wait 10–15s before next fidget
  const delay = 10_000 + Math.random() * 5_000
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

// Publish whether the inline panel is in the viewport so the floating
// Navigator button (rendered in app.vue) can hide while the panel is visible.
// The IntersectionObserver fires its first callback async, which leaves a
// frame where the launcher would render alongside the panel mascot. We do
// a synchronous bounding-rect check first so the launcher is suppressed
// from the first paint when the panel is in view at mount time.
let visibilityObserver: IntersectionObserver | null = null
onMounted(() => {
  if (!panelRoot.value) return
  const rect = panelRoot.value.getBoundingClientRect()
  sprigPanelInView.value = rect.bottom > 0 && rect.top < (window.innerHeight || 0)
  if (typeof IntersectionObserver === 'undefined') return
  visibilityObserver = new IntersectionObserver(
    ([entry]) => { sprigPanelInView.value = entry.isIntersecting },
    { threshold: 0 },
  )
  visibilityObserver.observe(panelRoot.value)
})
onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  sprigPanelInView.value = false
})

const sprigImage = computed(() => {
  if (isStreaming.value) return '/sprig/bounce.gif'
  if (idleAnimation.value) return idleAnimation.value
  return '/sprig/idle.png'
})

async function send(text: string) {
  if (!text || isStreaming.value) return
  flashSendRipple()
  await sendMessage(text, userContext.value, activeBusinessId.value ?? undefined, profileMode.value)
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
  // Reset anonymous flow back to the top-level pill set.
  anonFlow.value = 'initial'
  investorSectors.value = []
  investorStages.value = []
  investorTeamSizes.value = []
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
  <div ref="panelRoot" class="relative">
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
            <p
              v-if="messages[0]?.content && messages[0].content !== '...'"
              class="text-base leading-relaxed"
            >
              {{ messages[0].content }}
            </p>
            <span v-else class="flex items-center gap-1 py-2">
              <span class="sprig-typing-dot" />
              <span class="sprig-typing-dot" />
              <span class="sprig-typing-dot" />
            </span>
            <span
              class="hidden lg:block absolute top-6 -left-2 w-4 h-4"
              style="background-color: var(--sprig-ai-bg); clip-path: polygon(100% 0, 100% 100%, 0 50%);"
            />
          </div>

          <!-- Right column: flow-dependent content -->
          <div class="flex-1 w-full">

            <!-- Anonymous: top-level "who are you?" pills -->
            <div
              v-if="!user && anonFlow === 'initial'"
              class="flex flex-wrap gap-2 content-start"
            >
              <button class="sprig-pill" @click="chooseAnonFlow('investor')">I am an investor</button>
              <button class="sprig-pill" @click="chooseAnonFlow('founder')">I am a founder</button>
              <button class="sprig-pill" @click="chooseAnonFlow('browsing')">I am just browsing</button>
              <NuxtLink to="/login" class="sprig-pill no-underline">
                <span>Sign in / Create profile</span>
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 ml-1.5 shrink-0" />
              </NuxtLink>
            </div>

            <!-- Anonymous: investor sub-flow (multi-select chips) -->
            <div v-else-if="!user && anonFlow === 'investor'" class="flex flex-col gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide mb-2 text-white/70">
                  Sector
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="s in SECTORS"
                    :key="s"
                    class="sprig-chip"
                    :class="{ 'sprig-chip--active': investorSectors.includes(s) }"
                    @click="toggleInvestor('sectors', s)"
                  >
                    {{ s }}
                  </button>
                </div>
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-wide mb-2 text-white/70">
                  Stage
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="s in STAGES"
                    :key="s"
                    class="sprig-chip"
                    :class="{ 'sprig-chip--active': investorStages.includes(s) }"
                    @click="toggleInvestor('stages', s)"
                  >
                    {{ s }}
                  </button>
                </div>
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-wide mb-2 text-white/70">
                  Team Size
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="r in EMPLOYEE_RANGES"
                    :key="r"
                    class="sprig-chip"
                    :class="{ 'sprig-chip--active': investorTeamSizes.includes(r) }"
                    @click="toggleInvestor('teamSizes', r)"
                  >
                    {{ r }}
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 items-center pt-1">
                <button
                  type="button"
                  class="sprig-pill"
                  :disabled="isStreaming"
                  @click="findCompaniesFromSelections"
                >
                  <UIcon name="i-heroicons-magnifying-glass-20-solid" class="w-4 h-4 mr-1.5 shrink-0" />
                  <span>Find companies</span>
                </button>
                <NuxtLink :to="investorMapUrl" class="sprig-pill no-underline">
                  <span>View companies on the map</span>
                  <UIcon name="i-heroicons-arrow-right-20-solid" class="w-4 h-4 ml-1.5 shrink-0" />
                </NuxtLink>
                <button
                  type="button"
                  class="text-xs font-semibold text-white/70 hover:text-white transition-colors"
                  @click="chooseAnonFlow('initial')"
                >
                  Back
                </button>
              </div>
            </div>

            <!-- Anonymous: browsing — no pills, just a quiet back link -->
            <div v-else-if="!user && anonFlow === 'browsing'">
              <button
                type="button"
                class="text-xs font-semibold text-white/70 hover:text-white transition-colors"
                @click="chooseAnonFlow('initial')"
              >
                Back
              </button>
            </div>

            <!-- Authenticated users + anonymous founder flow: existing pills -->
            <div v-else class="flex flex-wrap gap-2 content-start">
              <template v-for="card in quickStartCards" :key="card.label">
                <NuxtLink
                  v-if="card.to"
                  :to="card.to"
                  class="sprig-pill no-underline"
                >
                  <span>{{ card.label }}</span>
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 ml-1.5 shrink-0" />
                </NuxtLink>
                <button
                  v-else
                  :disabled="isStreaming"
                  class="sprig-pill"
                  @click="send(card.message!)"
                >
                  {{ card.label }}
                </button>
              </template>
              <button
                v-if="!user && anonFlow === 'founder'"
                type="button"
                class="text-xs font-semibold text-white/70 hover:text-white transition-colors w-full mt-1"
                @click="chooseAnonFlow('initial')"
              >
                Back
              </button>
            </div>

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
            <div v-if="msg.companies?.length" class="w-full mt-2 flex flex-wrap gap-2">
              <div
                v-for="c in msg.companies"
                :key="c.id"
                class="w-full sm:w-[48%]"
              >
                <ChatbotChatCompanyCard :company="c" />
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
      :placeholder="profileMode === 'investor'
        ? 'Ask about Utah startups, sectors, or funding stages...'
        : 'I\'m thinking of starting an agricultural business'"
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
/* Multi-select chips for the investor sub-flow */
.sprig-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
}
.sprig-chip:hover {
  background-color: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.32);
}
.sprig-chip--active {
  background-color: #ffffff;
  color: #0d192d;
  border-color: #ffffff;
}
.sprig-chip--active:hover {
  background-color: #ffffff;
  color: #0d192d;
}

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
