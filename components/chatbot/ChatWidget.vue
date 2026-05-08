<script setup lang="ts">
import { nextTick } from 'vue'
import { useChat, type UserContext } from '~/composables/useChat'
import { UTAH_COUNTIES, INDUSTRIES, COMMUNITIES } from '~/lib/constants'

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

const isOpen = ref(false)
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

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

function toggle() {
  isOpen.value = !isOpen.value
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
  await sendMessage(text, userContext.value)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleClear() {
  clearMessages()
  onboardingDone.value = false
  onboardingStep.value = 1
  userContext.value = { stage: '', industry: '', county: '', communities: [] }
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
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat card -->
    <div
      v-if="isOpen"
      class="mb-3 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      style="width: 420px; height: 600px"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 shrink-0" style="background-color: #1a365d">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-white" />
          <div>
            <span class="text-white font-semibold text-sm">Utah Startup Navigator</span>
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

      <!-- ONBOARDING -->
      <div v-if="!onboardingDone" class="flex-1 flex flex-col overflow-y-auto px-4 py-5 gap-4">

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
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'"
            >
              <template v-if="msg.content">{{ msg.content }}</template>
              <span v-else class="flex items-center gap-1 py-1">
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms" />
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms" />
              </span>
            </div>

            <!-- Resource cards -->
            <div
              v-if="msg.resources?.length"
              class="w-full mt-2 flex flex-col gap-2"
            >
              <ChatbotChatResourceCard
                v-for="r in msg.resources"
                :key="r.id"
                :resource="r"
              />
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

    <!-- Toggle button -->
    <UButton
      size="lg"
      class="rounded-full shadow-lg px-5"
      :style="{ backgroundColor: '#1a365d', borderColor: '#1a365d' }"
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
