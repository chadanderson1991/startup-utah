<script setup lang="ts">
import { nextTick } from 'vue'
import { useChat } from '~/composables/useChat'

const isOpen = ref(false)
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

const { messages, isStreaming, sendMessage, clearMessages } = useChat()

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  inputText.value = ''
  await sendMessage(text)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// Auto-scroll to bottom when messages change
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
    <!-- Open chat card -->
    <div
      v-if="isOpen"
      class="mb-3 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      style="width: 400px; height: 580px"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3 shrink-0"
        style="background-color: #1a365d"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-white" />
          <span class="text-white font-semibold text-sm">Utah Startup Navigator</span>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            icon="i-heroicons-arrow-path"
            size="xs"
            variant="ghost"
            color="white"
            title="Clear conversation"
            @click="clearMessages"
          />
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            variant="ghost"
            color="white"
            title="Close"
            @click="close"
          />
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
      >
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            "
          >
            <template v-if="msg.content">{{ msg.content }}</template>
            <!-- Empty assistant message = streaming in progress -->
            <span v-else class="flex items-center gap-1 py-1">
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms" />
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms" />
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms" />
            </span>
          </div>
        </div>

        <!-- Streaming indicator when last message is assistant and already has content -->
        <div v-if="isStreaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content" class="flex justify-start">
          <div class="flex items-center gap-1 px-3 py-2">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms" />
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms" />
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms" />
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
