<script setup lang="ts">
import { nextTick } from 'vue'
import { useChat, type UserContext } from '~/composables/useChat'
import { useActiveBusiness } from '~/composables/useActiveBusiness'
import { useSprigPanelVisibility } from '~/composables/useSprigPanelVisibility'
import { useQuickStartCards } from '~/composables/useQuickStartCards'

const user = useSupabaseUser()
const isOpen = ref(false)
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)
const sprigPanelInView = useSprigPanelVisibility()

// Strict: there is only ever ONE Sprig on screen. The bottom-right launcher
// is hidden any time the inline SprigChatPanel is in view — regardless of
// whether the popup is open. The popup itself is auto-closed by the watcher
// below, so the two Sprigs are mutually exclusive.
const showToggleButton = computed(() => !sprigPanelInView.value)

// Auto-close the popup when the inline SprigChatPanel scrolls back into view.
// The conversation continues seamlessly there (useChat shares state across
// both surfaces), and it stops the popup from hovering over its own larger
// counterpart.
watch(sprigPanelInView, (val) => {
  if (val && isOpen.value) isOpen.value = false
})

// Sprig launcher animation. Plays springystartup.gif each time the launcher
// appears (initial mount if visible, or transitions from hidden -> visible
// when scrolling past the inline panel), then reverts to the static idle pose.
// A cooldown prevents it from firing repeatedly while the user scrolls past
// the inline panel boundary back and forth.
const launcherImg = ref('/sprig/idle.png')
let launcherRevertTimer: ReturnType<typeof setTimeout> | null = null
let lastEntranceAt = 0
const SPRINGY_DURATION_MS = 1000
const ENTRANCE_COOLDOWN_MS = 30_000

function playLauncherEntrance() {
  const now = Date.now()
  if (now - lastEntranceAt < ENTRANCE_COOLDOWN_MS) return
  lastEntranceAt = now
  if (launcherRevertTimer) clearTimeout(launcherRevertTimer)
  // Cache-bust the query string so the browser actually replays the gif if
  // it's already cached from a prior appearance this session.
  launcherImg.value = `/sprig/springystartup.gif?t=${now}`
  launcherRevertTimer = setTimeout(() => {
    launcherImg.value = '/sprig/idle.png'
  }, SPRINGY_DURATION_MS)
}

// Animate on real hidden -> visible transitions only.
watch(showToggleButton, (val, old) => {
  if (val && !old) playLauncherEntrance()
})

// For the very first paint we can't use { immediate: true } — the launcher
// mounts in app.vue before SprigChatPanel mounts on the homepage, so the
// initial value of `sprigPanelInView` is always false (default) and we'd
// burn the 30s cooldown on a launcher that's about to be hidden. Defer the
// initial check by one frame so SprigChatPanel (when present on the route)
// has updated sprigPanelInView via its synchronous mount-time check.
onMounted(() => {
  requestAnimationFrame(() => {
    if (showToggleButton.value) playLauncherEntrance()
  })
})

onBeforeUnmount(() => {
  if (launcherRevertTimer) clearTimeout(launcherRevertTimer)
})

// Adaptive quick-start pills for the popup empty state — shared logic
// with the inline SprigChatPanel; investor vs entrepreneur set is picked
// inside the composable from profile.profile_type.
const quickStartCards = useQuickStartCards()

async function sendQuickStart(message: string) {
  if (isStreaming.value) return
  await sendMessage(message, userContext.value, activeBusinessId.value ?? undefined, profileMode.value)
}

// Whether the user has actually started a conversation (vs. just the greeting)
const hasStartedChat = computed(() => messages.value.some(m => m.role === 'user'))

// Shared profile + businesses + active-business state. The composable owns
// auth-aware loading so the chatbot picks up business context as soon as the
// Supabase session resolves, even though it mounts persistently in app.vue.
const { profile, businesses, activeBusiness, setActiveBusiness, ensureLoaded, refresh: refreshProfileAndBusinesses } = useActiveBusiness()
const activeBusinessId = computed<string | null>({
  get: () => activeBusiness.value?.id ?? null,
  set: (id) => { if (id) setActiveBusiness(id) },
})

// Investor mode — drives the `mode` parameter sent with each chat message
// and the placeholder copy on the input. The pill set itself is selected
// inside useQuickStartCards.
const profileMode = computed(() =>
  profile.value?.profile_type === 'investor'
    ? 'investor' as const
    : 'entrepreneur' as const,
)
watch(activeBusinessId, (val, old) => {
  if (val !== old && old !== null) {
    greetingFetched.value = false
    clearMessages()
    if (user.value) fetchPersonalizedGreeting()
  }
})

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
    messages.value[0].content = "Welcome back! I'm here to help you navigate Utah's startup resources. What would you like to work on today?"
  }
}

async function toggle() {
  // Refresh profile on open so investor/entrepreneur mode is current — the
  // ChatWidget is persistent in app.vue, so without this the popup could
  // open with a stale `profileMode` after the user toggled it elsewhere.
  if (!isOpen.value && user.value) await refreshProfileAndBusinesses()
  isOpen.value = !isOpen.value
  if (isOpen.value) fetchPersonalizedGreeting()
}

function close() {
  isOpen.value = false
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  inputText.value = ''
  await sendMessage(text, userContext.value, activeBusinessId.value ?? undefined, profileMode.value)
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

// Reset conversation when profile mode switches so investor/entrepreneur don't bleed together
watch(profileMode, (newMode, oldMode) => {
  if (newMode !== oldMode) handleClear()
})
</script>

<template>
  <!-- ============== Sprig launcher + bottom-right popup ============== -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat card -->
    <div
      v-if="isOpen && !sprigPanelInView"
      class="sprig-panel mb-3 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style="width: 420px; height: 600px"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3 shrink-0"
        style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
      >
        <div class="flex items-center gap-2">
          <span class="text-white font-semibold text-sm">Startup Sprig</span>
        </div>
        <div class="flex items-center gap-1">
          <UButton icon="i-heroicons-arrow-path" size="xs" variant="ghost" color="white" title="Start over" @click="handleClear" />
          <UButton icon="i-heroicons-x-mark" size="xs" variant="ghost" color="white" title="Close" @click="close" />
        </div>
      </div>

      <!-- CHAT -->
      <!-- Business selector (logged-in users with 2+ businesses) -->
        <div
          v-if="user && businesses && businesses.length > 1"
          class="px-3 pt-2 pb-2 shrink-0"
          style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
        >
          <select
            v-model="activeBusinessId"
            class="sprig-business-select w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none"
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

          <!-- Adaptive quick-start pills (empty-state only) — same set the
               inline SprigChatPanel renders, so the two surfaces match. -->
          <div v-if="!hasStartedChat" class="flex flex-wrap gap-2 mt-1">
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
                @click="sendQuickStart(card.message!)"
              >
                {{ card.label }}
              </button>
            </template>
          </div>
        </div>

        <!-- Input — matches the SprigChatPanel pill -->
        <div
          class="px-3 py-3 shrink-0"
          style="border-top: 1px solid rgba(255, 255, 255, 0.08);"
        >
          <div class="sprig-input-shell rounded-full flex items-center pl-4 pr-1.5 py-1.5">
            <input
              v-model="inputText"
              type="text"
              :placeholder="profileMode === 'investor'
                ? 'Ask about Utah startups, sectors, or funding stages...'
                : 'Ask about Utah startup resources...'"
              class="flex-1 bg-transparent border-0 focus:outline-none text-sm py-1"
              :disabled="isStreaming"
              @keydown="handleKeydown"
            />
            <button
              type="button"
              class="sprig-send-btn flex items-center justify-center"
              style="width: 2rem; height: 2rem;"
              :disabled="isStreaming || !inputText.trim()"
              aria-label="Send message"
              @click="handleSend"
            >
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
            </button>
          </div>
        </div>
    </div>

    <!-- Toggle button — Sprig mascot (hidden while the inline SprigChatPanel
         is on-screen) -->
    <button
      v-if="showToggleButton"
      type="button"
      class="sprig-launcher"
      :aria-label="isOpen ? 'Close chat' : 'Open Startup Sprig'"
      @click="toggle"
    >
      <img
        :src="launcherImg"
        alt=""
        class="sprig-launcher__img"
        draggable="false"
      />
    </button>
  </div>
</template>

<style scoped>
.sprig-launcher {
  width: 5rem;
  height: 5rem;
  background: transparent;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 150ms ease;
}
.sprig-launcher:hover {
  transform: translateY(-2px) scale(1.06);
}
.sprig-launcher:active {
  transform: translateY(0) scale(0.96);
}
.sprig-launcher__img {
  width: 100%;
  height: auto;
  pointer-events: none;
  user-select: none;
  /* Keep Sprig readable against light page backgrounds without putting him in a circle */
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
}

/* Business selector dropdown on the dark panel */
.sprig-business-select {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
}
.sprig-business-select:focus {
  border-color: var(--sprig-user-bg);
  box-shadow: 0 0 0 2px rgba(60, 227, 255, 0.25);
}
.sprig-business-select option {
  background-color: var(--sprig-bg);
  color: #ffffff;
}
</style>
