import { ref } from 'vue'

export interface UserContext {
  stage?: string
  industry?: string
  county?: string
  communities?: string[]
  description?: string
}

const GREETING = "Hi! I'm the Utah Startup Navigator. I'll help you find the right state programs and resources for your specific situation."

export const useChat = () => {
  const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: GREETING },
  ])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (content: string, userContext?: UserContext) => {
    if (isStreaming.value) return
    messages.value.push({ role: 'user', content })
    const assistantIdx = messages.value.length
    messages.value.push({ role: 'assistant', content: '' })
    isStreaming.value = true
    error.value = null

    try {
      const history = messages.value.slice(0, -2)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, userContext }),
      })
      if (!response.ok || !response.body) throw new Error('Chat request failed')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        messages.value[assistantIdx].content += decoder.decode(value, { stream: true })
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
