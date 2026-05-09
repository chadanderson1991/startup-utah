import { ref } from 'vue'

export interface UserContext {
  stage?: string
  industry?: string
  county?: string
  communities?: string[]
  description?: string
}

export interface ChatResource {
  id: number
  title: string
  link?: string | null
  resource_type?: string | null
  topics?: string[]
  communities?: string[]
  reason?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  resources?: ChatResource[]
}

const RESOURCE_MARKER = '__RESOURCES__'
const GREETING = "Hi! I'm the Utah Startup Navigator. I'll help you find the right state programs and resources for your specific situation."

function parseMessage(raw: string): { content: string; resources?: ChatResource[] } {
  const idx = raw.indexOf(RESOURCE_MARKER)
  if (idx === -1) return { content: raw.trim() }
  const content = raw.slice(0, idx).trim()
  try {
    const resources = JSON.parse(raw.slice(idx + RESOURCE_MARKER.length).trim()) as ChatResource[]
    return { content, resources }
  } catch {
    return { content }
  }
}

export const useChat = () => {
  const messages = ref<ChatMessage[]>([
    { role: 'assistant', content: GREETING },
  ])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (content: string, userContext?: UserContext, businessId?: string) => {
    if (isStreaming.value) return
    messages.value.push({ role: 'user', content })
    const assistantIdx = messages.value.length
    messages.value.push({ role: 'assistant', content: '' })
    isStreaming.value = true
    error.value = null

    try {
      // Strip __RESOURCES__ blocks from history before sending to API
      const history = messages.value.slice(0, -2).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, userContext, businessId }),
      })
      if (!response.ok || !response.body) throw new Error('Chat request failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
        // Stream the visible portion (before the marker) live
        const markerIdx = raw.indexOf(RESOURCE_MARKER)
        messages.value[assistantIdx].content = markerIdx === -1
          ? raw
          : raw.slice(0, markerIdx)
      }

      // Once complete, parse out resources
      const parsed = parseMessage(raw)
      messages.value[assistantIdx].content = parsed.content
      if (parsed.resources?.length) {
        messages.value[assistantIdx].resources = parsed.resources
      }
    } catch (err) {
      messages.value[assistantIdx].content = 'Sorry, I ran into an issue. Please try again.'
      error.value = String(err)
    } finally {
      isStreaming.value = false
    }
  }

  const clearMessages = () => {
    messages.value = [{ role: 'assistant', content: GREETING }]
  }

  return { messages, isStreaming, error, sendMessage, clearMessages }
}
