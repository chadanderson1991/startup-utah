import Anthropic from '@anthropic-ai/sdk'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, readBody, setResponseHeaders, sendStream } from 'h3'
import { ENTREPRENEUR_JOURNEY } from '../utils/entrepreneur-journey'
import { INVESTOR_STATIC_SYSTEM } from '../utils/investor-system'
import type { UserProfile, Business } from '~/types/profile'

// Resource cache — 5-min TTL matches Anthropic's ephemeral cache TTL
let cachedResources: Record<string, unknown>[] | null = null
let cacheExpiry = 0

// Company database cache for investor mode — 5-min TTL
let cachedCompanyDb: string | null = null
let companyDbExpiry = 0

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
  businessId?: string
  mode?: 'entrepreneur' | 'investor'
}

// Static content — combined into one block for a single cache breakpoint.
// ENTREPRENEUR_JOURNEY is ~1500 tokens; system instructions ~700 tokens.
// Total cached: ~2200 tokens. Cache hit cost = 10% of normal input price.
const STATIC_SYSTEM = `You are Startup Sprig, the official AI assistant for startup.utah.gov — the Utah Governor's Office of Economic Opportunity startup platform. When asked who you are, say "I'm Startup Sprig."

YOUR SOLE PURPOSE: Help founders and entrepreneurs in Utah find the right state programs, resources, and support services for their specific situation.

STRICT GUARDRAILS
- ONLY answer questions about Utah entrepreneurship, state programs, business resources, funding, licensing, workforce, and the Utah startup ecosystem.
- Do NOT provide legal advice, tax advice, medical advice, financial planning advice, or general life advice.
- Do NOT discuss politics, news, sports, entertainment, or any topic unrelated to Utah entrepreneurship.
- Do NOT recommend resources that are not in the Utah programs and services information provided — never make up programs.
- If asked anything off-topic, respond only: "I'm focused on helping Utah entrepreneurs find state resources. Tell me about your business and I can point you to the right programs."

HOW TO HELP USERS — RESPONSE STYLE
The cards do the talking. Your prose is just a brief lead-in.

1. Use the USER PROFILE (if provided) to immediately tailor your response — don't ask for info you already have.
2. Match their profile (stage, industry, location, community) to the most relevant resources.
3. Recommend 3–5 resources max.
4. Keep your prose response to ONE short line — a single greeting/lead-in sentence (e.g., "Here are a few resources that fit your stage and industry:" or "These three programs are the best fit for what you're working on:"). DO NOT explain each resource in prose — the explanation goes in the resource card's "reason" field. DO NOT paste URLs in your prose — links live on the cards.
5. After that one-line lead-in, on its own line at the very end, append a resource card block in EXACTLY this format (no spaces before __RESOURCES__):
__RESOURCES__[{"id":1,"title":"Resource Name","link":"https://example.com","topics":["Funding"],"communities":["Veteran"],"reason":"One concise sentence (about 15–25 words) describing what this resource is and why it fits the user's specific situation. Combine what-it-does + why-it-fits."}]
6. Only include resources you explicitly recommended. If none fit, return a one-line apology and omit the __RESOURCES__ line entirely.
7. Use the RESOURCE DATABASE entries' description and topics to write each reason accurately — never invent capabilities a resource doesn't claim.
8. Only ask a follow-up question if you genuinely cannot recommend a resource without more info. Otherwise, recommend now.

${ENTREPRENEUR_JOURNEY}`

// Stage → topics mapping using real DB topic values
const STAGE_TOPICS: Record<string, string[]> = {
  idea:        ['Start a Business', 'Entrepreneurship Communities'],
  early:       ['Start a Business', 'Funding', 'Taxes and Finance'],
  growth:      ['Funding', 'Late Stage Growth', 'Marketing and Sales'],
  established: ['Late Stage Growth', 'International Trade'],
}

function filterResources(
  resources: Record<string, unknown>[],
  ctx?: UserContext,
): Record<string, unknown>[] {
  if (!ctx?.stage && !ctx?.industry && !ctx?.communities?.length) {
    return resources.slice(0, 40)
  }

  const stageTopics = ctx.stage ? STAGE_TOPICS[ctx.stage] ?? [] : []

  const scored = resources.map(r => {
    let score = 0
    const rTopics      = (r.topics      as string[]) ?? []
    const rCommunities = (r.communities as string[]) ?? []
    const rIndustries  = (r.industries  as string[]) ?? []

    if (stageTopics.length && rTopics.some(t => stageTopics.includes(t))) score += 3
    if (ctx.communities?.length && rCommunities.some(c =>
      ctx.communities!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
    )) score += 2
    if (ctx.industry && rIndustries.some(i =>
      i.toLowerCase().includes(ctx.industry!.toLowerCase())
    )) score += 2

    return { r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 40).map(x => x.r)
}

// Build a compact resource list — omit null/empty fields to save tokens.
function buildResourceBlock(resources: Record<string, unknown>[], ctx?: UserContext): string {
  const filtered = filterResources(resources, ctx)
  const compact = filtered.map(r => {
    const obj: Record<string, unknown> = { id: r.id, title: r.title }
    if (r.description)                                                obj.description = r.description
    if (r.link)                                                       obj.link        = r.link
    if ((r.communities as string[])?.length)                          obj.communities = r.communities
    if ((r.industries  as string[])?.length)                          obj.industries  = r.industries
    if ((r.topics      as string[])?.length)                          obj.topics      = r.topics
    return obj
  })
  return `UTAH PROGRAMS AND SERVICES (${compact.length} of ${resources.length} available, filtered for relevance)\n${JSON.stringify(compact)}`
}

function buildProfileBlock(profile: UserProfile | null, business: Business | null): string {
  const lines: string[] = ['USER INFORMATION']
  if (profile?.full_name)           lines.push(`Name: ${profile.full_name}`)
  if (profile?.county)              lines.push(`County: ${profile.county}`)
  if (profile?.industry)            lines.push(`Industry: ${profile.industry}`)
  if (profile?.communities?.length) lines.push(`Communities: ${profile.communities.join(', ')}`)
  if (profile?.bio)                 lines.push(`Bio: ${profile.bio}`)
  if (business) {
    lines.push(`Active business: ${business.name}`)
    lines.push(`Stage: ${business.stage}`)
    lines.push(`Journey step: ${business.journey_step} of 19`)
    if (business.industry)    lines.push(`Industry: ${business.industry}`)
    if (business.county)      lines.push(`County: ${business.county}`)
    if (business.description) lines.push(`Description: ${business.description}`)
    if (business.notes)       lines.push(`Notes: ${business.notes}`)
    if (business.is_hiring)   lines.push('Currently hiring: yes')
  }
  lines.push('Use this profile for all personalization. Skip questions about info already provided.')
  return lines.join('\n')
}

function buildContextBlock(ctx: UserContext): string {
  const lines: string[] = ['USER INFORMATION']
  if (ctx.stage)              lines.push(`Stage: ${ctx.stage}`)
  if (ctx.industry)           lines.push(`Industry: ${ctx.industry}`)
  if (ctx.county)             lines.push(`County: ${ctx.county}`)
  if (ctx.communities?.length) lines.push(`Communities: ${ctx.communities.join(', ')}`)
  if (ctx.description)        lines.push(`Description: ${ctx.description}`)
  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey as string })

  const body = await readBody<ChatBody>(event)
  const { message, history = [], userContext, businessId, mode } = body

  if (!message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  // Fetch authenticated user's profile + business server-side.
  // serverSupabaseUser throws "Auth session missing!" for anonymous users — that's expected here, so swallow it.
  let profile: UserProfile | null = null
  let business: Business | null = null
  let authUser: Awaited<ReturnType<typeof serverSupabaseUser>> | null = null
  try {
    authUser = await serverSupabaseUser(event)
  } catch {
    authUser = null
  }
  if (authUser) {
    const client = await serverSupabaseClient(event)
    const [profileRes, bizRes] = await Promise.all([
      client.from('user_profiles').select('*').eq('id', authUser.id).single(),
      businessId
        ? client.from('businesses').select('*').eq('id', businessId).single()
        : Promise.resolve({ data: null, error: null }),
    ])
    profile = profileRes.data as UserProfile | null
    if (businessId && bizRes.data) {
      business = bizRes.data as Business
    } else if (businessId) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
  }

  const isInvestorMode = mode === 'investor' || profile?.profile_type === 'investor'

  let systemBlocks: Anthropic.Messages.TextBlockParam[]

  if (isInvestorMode) {
    // Refresh company database cache every 5 min
    if (!cachedCompanyDb || Date.now() > companyDbExpiry) {
      const client = await serverSupabaseClient(event)
      const { data } = await client
        .from('companies')
        .select('id, name, sector, stage, employee_range, is_hiring, description, website, city')
        .eq('is_active', true)
      const companies = data ?? []
      const lines = companies.map(c => {
        const desc = c.description ? c.description.slice(0, 100) : ''
        return `- ${c.name} | ${c.sector ?? ''} | ${c.stage ?? ''} | Employees: ${c.employee_range ?? ''} | Hiring: ${c.is_hiring ? 'Yes' : 'No'} | City: ${c.city ?? ''} | ${desc}`
      })
      cachedCompanyDb = `UTAH STARTUP ECOSYSTEM (${companies.length} companies):\n${lines.join('\n')}`
      companyDbExpiry = Date.now() + 5 * 60 * 1000
    }

    systemBlocks = [
      {
        type: 'text',
        text: INVESTOR_STATIC_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text: cachedCompanyDb,
        cache_control: { type: 'ephemeral' },
      },
    ]
  } else {
    // Entrepreneur mode — refresh resource cache every 5 min (aligned with Anthropic cache TTL)
    if (!cachedResources || Date.now() > cacheExpiry) {
      const client = await serverSupabaseClient(event)
      const { data } = await client
        .from('resources')
        .select('id,title,description,link,communities,industries,locations,topics')
        .eq('is_active', true)
      cachedResources = data || []
      cacheExpiry = Date.now() + 5 * 60 * 1000
    }

    const resourceBlock = buildResourceBlock(cachedResources, userContext ?? undefined)

    // Profile or context block — small and user-specific, not cached
    const userBlock = (profile || business)
      ? buildProfileBlock(profile, business)
      : (userContext && Object.values(userContext).some(v => v && (!Array.isArray(v) || v.length)))
        ? buildContextBlock(userContext)
        : null

    systemBlocks = [
      // Block 1: static instructions + 19-step journey — cached (never changes)
      {
        type: 'text',
        text: STATIC_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
      // Block 2: resource database — cached (refreshes every 5 min, matches cache TTL)
      {
        type: 'text',
        text: resourceBlock,
        cache_control: { type: 'ephemeral' },
      },
      // Block 3: user profile — NOT cached (unique per user/request)
      ...(userBlock ? [{ type: 'text' as const, text: userBlock }] : []),
    ]
  }

  const messages: Anthropic.Messages.MessageParam[] = [
    ...history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-8) // keep last 8 messages (reduced from 12)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
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
        const stream = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          stream: true,
          system: systemBlocks,
          messages,
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
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
