import Anthropic from '@anthropic-ai/sdk'
import { serverSupabaseClient } from '#supabase/server'
import { createError, defineEventHandler, readBody, setResponseHeaders, sendStream } from 'h3'

// Module-level cache
let cachedResources: Record<string, unknown>[] | null = null
let cacheExpiry = 0

interface ChatMessage {
  role: string
  content: string
}

interface ChatBody {
  message: string
  history?: ChatMessage[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

  const body = await readBody<ChatBody>(event)
  const { message, history = [] } = body

  if (!message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  // Fetch resources with 5-min cache
  if (!cachedResources || Date.now() > cacheExpiry) {
    const client = await serverSupabaseClient(event)
    const { data } = await client
      .from('resources')
      .select('id,title,description,link,email,communities,industries,locations,topics')
      .eq('is_active', true)
    cachedResources = data || []
    cacheExpiry = Date.now() + 5 * 60 * 1000
  }

  const systemPrompt = `You are the Utah Startup Navigator, an official AI assistant for startup.utah.gov — the Utah Governor's Office of Economic Opportunity startup platform.

YOUR SOLE PURPOSE: Help founders and entrepreneurs in Utah find the right state programs, resources, and support services for their specific situation.

STRICT GUARDRAILS:
- ONLY answer questions about Utah entrepreneurship resources, programs, funding, business support services, and the Utah startup ecosystem
- Never provide general legal, financial, tax, or medical advice
- Never discuss topics unrelated to Utah startups, entrepreneurship, or business resources
- If asked anything off-topic, respond: "I'm specifically here to help Utah entrepreneurs find state resources. Tell me about your business situation and I'll find the right programs for you."
- Do not make up resources. Only recommend what exists in the database below.

HOW TO HELP:
1. If you don't know their situation yet, ask: location in Utah (county), industry/business type, business stage (idea, early, growing), and community identity if relevant (veteran, woman-owned, rural, student, multicultural)
2. Match their profile to the most relevant resources using communities, industries, locations, and topics tags
3. Recommend 2-5 resources max — quality over quantity
4. For each recommendation: explain WHY it fits their specific situation, include the link
5. Ask follow-up questions to refine if needed

RESOURCE DATABASE (${cachedResources.length} Utah state resources):
${JSON.stringify(cachedResources, null, 2)}`

  const messages = [
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  setResponseHeaders(event, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const encoder = new TextEncoder()
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        })
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode('Sorry, I encountered an error. Please try again.'),
        )
      } finally {
        controller.close()
      }
    },
  })

  return sendStream(event, readableStream)
})
