import Groq from 'groq-sdk'
import { serverSupabaseClient } from '#supabase/server'
import { createError, defineEventHandler, readBody, setResponseHeaders, sendStream } from 'h3'
import { ENTREPRENEUR_JOURNEY } from '../utils/entrepreneur-journey'

let cachedResources: Record<string, unknown>[] | null = null
let cacheExpiry = 0

interface UserContext {
  stage?: string
  industry?: string
  county?: string
  communities?: string[]
  description?: string
}

interface ChatMessage {
  role: string
  content: string
}

interface ChatBody {
  message: string
  history?: ChatMessage[]
  userContext?: UserContext
}

const STATIC_SYSTEM = `You are the Utah Startup Navigator, an official AI assistant for startup.utah.gov — the Utah Governor's Office of Economic Opportunity startup platform.

YOUR SOLE PURPOSE: Help founders and entrepreneurs in Utah find the right state programs, resources, and support services for their specific situation. You have deep knowledge of both the Utah Entrepreneur Journey (19-step framework) and the full database of Utah state resources.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT GUARDRAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ONLY answer questions about Utah entrepreneurship, state programs, business resources, funding, licensing, workforce, and the Utah startup ecosystem.
- Do NOT provide legal advice, tax advice, medical advice, financial planning advice, or general life advice.
- Do NOT discuss politics, news, sports, entertainment, or any topic unrelated to Utah entrepreneurship.
- Do NOT recommend resources that are not in the database below — never make up programs.
- If asked anything off-topic, respond only with: "I'm focused on helping Utah entrepreneurs find state resources. Tell me about your business and I can point you to the right programs."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO HELP USERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Use the USER PROFILE (if provided) to immediately tailor your response — don't ask for info you already have.
2. Identify which of the 19 steps the user is currently on based on their situation.
3. Match their profile (stage, industry, location, community) to the most relevant resources using all available tags.
4. Recommend 3-5 resources max — quality over quantity. For each: explain WHY it fits, include the link.
5. Mention what step comes next so they understand the journey ahead.
6. Ask one focused follow-up question if you need more clarity.

${ENTREPRENEUR_JOURNEY}`

const STAGE_MAP: Record<string, string[]> = {
  idea:        ['idea', 'early_stage'],
  early:       ['early_stage', 'growth'],
  growth:      ['growth', 'mature'],
  established: ['mature'],
}

function filterResources(
  resources: Record<string, unknown>[],
  ctx?: UserContext,
): Record<string, unknown>[] {
  if (!ctx?.stage && !ctx?.industry && !ctx?.communities?.length) {
    return resources.slice(0, 50)
  }

  const relevantStages = ctx.stage ? STAGE_MAP[ctx.stage] ?? [] : []

  const scored = resources.map(r => {
    let score = 0
    const rStages = (r.stages as string[]) ?? []
    const rCommunities = (r.communities as string[]) ?? []
    const rIndustries = (r.industries as string[]) ?? []

    if (relevantStages.length && rStages.some(s => relevantStages.includes(s))) score += 3
    if (ctx.communities?.length && rCommunities.some(c =>
      ctx.communities!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
    )) score += 2
    if (ctx.industry && rIndustries.some(i =>
      i.toLowerCase().includes(ctx.industry!.toLowerCase())
    )) score += 2

    return { r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 60).map(x => x.r)
}

function buildResourceSection(resources: Record<string, unknown>[], ctx?: UserContext): string {
  const filtered = filterResources(resources, ctx)
  const compact = filtered.map(r => ({
    id: r.id,
    title: r.title,
    link: r.link,
    resource_type: r.resource_type,
    stages: r.stages,
    keywords: r.keywords,
    communities: r.communities,
    industries: r.industries,
    topics: r.topics,
  }))
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESOURCE DATABASE (showing ${compact.length} of ${resources.length} Utah state resources, filtered for relevance)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(compact)}`
}

function buildUserContextSection(ctx: UserContext): string {
  const lines: string[] = ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'USER PROFILE', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━']
  if (ctx.stage) lines.push(`Business stage: ${ctx.stage}`)
  if (ctx.industry) lines.push(`Industry: ${ctx.industry}`)
  if (ctx.county) lines.push(`Utah county: ${ctx.county}`)
  if (ctx.communities?.length) lines.push(`Community identity: ${ctx.communities.join(', ')}`)
  if (ctx.description) lines.push(`Their description: ${ctx.description}`)
  lines.push('Use this profile to personalize every response. Skip questions about info already provided above.')
  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const groq = new Groq({ apiKey: config.groqApiKey as string })

  const body = await readBody<ChatBody>(event)
  const { message, history = [], userContext } = body

  if (!message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  // Fetch resources with 5-min cache
  if (!cachedResources || Date.now() > cacheExpiry) {
    const client = await serverSupabaseClient(event)
    const { data } = await client
      .from('resources')
      .select('id,title,description,link,email,resource_type,stages,keywords,communities,industries,locations,topics')
      .eq('is_active', true)
    cachedResources = data || []
    cacheExpiry = Date.now() + 5 * 60 * 1000
  }

  let systemPrompt = `${STATIC_SYSTEM}\n\n${buildResourceSection(cachedResources, userContext)}`
  if (userContext && Object.values(userContext).some(v => v && (!Array.isArray(v) || v.length))) {
    systemPrompt += `\n\n${buildUserContextSection(userContext)}`
  }

  const messages = [
    ...history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
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
        const stream = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2048,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        })

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content
          if (text) controller.enqueue(encoder.encode(text))
        }
      } catch (err) {
        console.error('[chat] stream error:', err)
        controller.enqueue(encoder.encode('Sorry, I encountered an error. Please try again.'))
      } finally {
        controller.close()
      }
    },
  })

  return sendStream(event, readableStream)
})
