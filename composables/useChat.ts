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

export interface ChatCompany {
  id: string
  name: string
  sector?: string | null
  stage?: string | null
  website?: string | null
  city?: string | null
  is_hiring?: boolean
  description?: string | null
  reason?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  resources?: ChatResource[]
  companies?: ChatCompany[]
}

const GREETING = "Hi! I'm Startup Sprig. I'll help you find the right state programs and resources for your specific situation. Sign in or create a profile and I can tailor my recommendations to your business."

// Lenient marker matchers — Sprig is told to emit exactly `__COMPANIES__` and
// `__RESOURCES__`, but the model occasionally decorates them (angle brackets,
// asterisks, code-fence backticks). The strict matchers below capture the
// marker + any surrounding decoration AND require the JSON `[` so we know
// exactly where the array starts. The streaming matcher is permissive — it
// fires as soon as any plausible marker prefix appears so the bare word
// doesn't briefly flash to the user before the `[` arrives.
const COMPANY_MARKER_RE = /[<_*`]+\s*_*COMPANIES_*\s*[>_*`]*\s*\[/i
const RESOURCE_MARKER_RE = /[<_*`]+\s*_*RESOURCES_*\s*[>_*`]*\s*\[/i
const STREAMING_MARKER_RE = /[<_*`]+\s*_*(COMPANIES|RESOURCES)/i

interface MarkerHit { startCut: number; jsonStart: number }

function findMarker(raw: string, re: RegExp): MarkerHit | null {
  const m = re.exec(raw)
  if (!m) return null
  return { startCut: m.index, jsonStart: m.index + m[0].length - 1 } // -1 to keep the [
}

// Earliest index of any structured-card marker in the raw stream, or -1.
function firstMarkerIdx(raw: string): number {
  const r = findMarker(raw, RESOURCE_MARKER_RE)
  const c = findMarker(raw, COMPANY_MARKER_RE)
  if (!r) return c?.startCut ?? -1
  if (!c) return r.startCut
  return Math.min(r.startCut, c.startCut)
}

// Walk the JSON starting at idx and return the index AFTER the matching `]`.
// Honors string boundaries so brackets inside strings don't fool us.
function findArrayEnd(raw: string, startBracket: number): number {
  let depth = 0
  let inString = false
  let escape = false
  for (let i = startBracket; i < raw.length; i++) {
    const ch = raw[i]
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return i + 1
    }
  }
  return -1
}

function parseMessage(raw: string): {
  content: string
  resources?: ChatResource[]
  companies?: ChatCompany[]
} {
  const cutAt = firstMarkerIdx(raw)
  if (cutAt === -1) return { content: raw.trim() }

  const content = raw.slice(0, cutAt).trim()

  let resources: ChatResource[] | undefined
  let companies: ChatCompany[] | undefined

  const rHit = findMarker(raw, RESOURCE_MARKER_RE)
  if (rHit) {
    const end = findArrayEnd(raw, rHit.jsonStart)
    if (end > 0) {
      try { resources = JSON.parse(raw.slice(rHit.jsonStart, end)) as ChatResource[] } catch { /* ignore */ }
    }
  }

  const cHit = findMarker(raw, COMPANY_MARKER_RE)
  if (cHit) {
    const end = findArrayEnd(raw, cHit.jsonStart)
    if (end > 0) {
      try { companies = JSON.parse(raw.slice(cHit.jsonStart, end)) as ChatCompany[] } catch { /* ignore */ }
    }
  }

  return { content, resources, companies }
}

// Module-scoped state so every caller of useChat() shares the same conversation.
// Lets the inline SprigChatPanel on the homepage and the floating ChatWidget see the same messages.
const messages = ref<ChatMessage[]>([
  { role: 'assistant', content: GREETING },
])
const isStreaming = ref(false)
const error = ref<string | null>(null)

export const useChat = () => {
  const sendMessage = async (content: string, userContext?: UserContext, businessId?: string, mode?: 'entrepreneur' | 'investor') => {
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
        body: JSON.stringify({ message: content, history, userContext, businessId, mode }),
      })
      if (!response.ok || !response.body) throw new Error('Chat request failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
        // Stream only the visible portion. Use the permissive regex so any
        // partial marker prefix (e.g. `__COMP`) is hidden the moment it
        // arrives, instead of briefly flashing to the user.
        const m = STREAMING_MARKER_RE.exec(raw)
        messages.value[assistantIdx].content = m ? raw.slice(0, m.index).trimEnd() : raw
      }

      // Once complete, parse out structured card data
      const parsed = parseMessage(raw)
      messages.value[assistantIdx].content = parsed.content
      if (parsed.resources?.length) {
        messages.value[assistantIdx].resources = parsed.resources
      }
      if (parsed.companies?.length) {
        messages.value[assistantIdx].companies = parsed.companies
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
