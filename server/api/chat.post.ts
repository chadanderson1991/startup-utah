import Anthropic from '@anthropic-ai/sdk'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError, defineEventHandler, readBody, setResponseHeaders, sendStream } from 'h3'
import { ENTREPRENEUR_JOURNEY } from '../utils/entrepreneur-journey'
import { INVESTOR_STATIC_SYSTEM } from '../utils/investor-system'
import type { UserProfile } from '~/types/profile'
import type { Company } from '~/types/company'

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

YOUR PURPOSES:
1. Help founders and entrepreneurs in Utah find the right state programs, resources, and support services.
2. Help anyone discover Utah startup companies — by sector, stage, hiring status, OR by what the company does (matching the user's natural-language description against company descriptions in the database).

STRICT GUARDRAILS
- ONLY answer questions about Utah entrepreneurship, state programs, business resources, funding, licensing, workforce, OR Utah startup companies in the provided database.
- Do NOT provide legal advice, tax advice, medical advice, financial planning advice, or general life advice.
- Do NOT discuss politics, news, sports, entertainment, or any topic unrelated to Utah entrepreneurship or the Utah startup ecosystem.
- Do NOT recommend resources or companies that are not in the provided databases — never make up entries.
- If asked anything truly off-topic (not about Utah entrepreneurship and not about Utah companies), respond only: "I can help with Utah entrepreneurship resources or finding Utah startup companies. What are you looking for?"

HOW TO HANDLE RESOURCE QUESTIONS (founder asks for state programs, funding, licensing, etc.)
The cards do the talking. Your prose is just a brief lead-in.

1. Use the USER PROFILE (if provided) to immediately tailor your response — don't ask for info you already have.
2. Match their profile (stage, industry, location, community) to the most relevant resources.
3. Recommend 3–5 resources max.
4. Keep your prose response to ONE short line — a single greeting/lead-in sentence. DO NOT explain each resource in prose — the explanation goes in the resource card's "reason" field. DO NOT paste URLs in your prose.
5. After that one-line lead-in, on its own line at the very end, append a resource card block in EXACTLY this format (no spaces before __RESOURCES__):
__RESOURCES__[{"id":1,"title":"Resource Name","link":"https://example.com","topics":["Funding"],"communities":["Veteran"],"reason":"One concise sentence (about 15–25 words) describing what this resource is and why it fits the user's specific situation."}]
6. Only include resources you explicitly recommended. If none fit, return a one-line apology and omit the __RESOURCES__ line entirely.
7. Use the RESOURCE DATABASE entries' description and topics to write each reason accurately — never invent capabilities a resource doesn't claim.
8. Only ask a follow-up question if you genuinely cannot recommend a resource without more info. Otherwise, recommend now.

HOW TO HANDLE COMPANY-DISCOVERY QUESTIONS (e.g. "any companies that specialize in kids phones", "what Utah startups make AI tutors", "show me Utah security companies")
1. Search the UTAH STARTUP ECOSYSTEM block — match the user's request against each company's name, sector, AND description. Description matching is essential for "what they do" / "who specializes in X" queries.
2. Recommend 3–6 matching companies. If none match, say so honestly and omit the card block.
3. Keep your prose response to ONE short lead-in sentence (e.g. "A few Utah startups working on phones for kids:"). Do NOT list company names in prose — the cards do that.
4. After the lead-in, on its own line at the very end, append a card block in EXACTLY this format. Start the line with the literal characters underscore-underscore-COMPANIES-underscore-underscore (no angle brackets, no markdown, no spaces) immediately followed by a JSON array. Example:
__COMPANIES__[{"id":"the-uuid-from-the-database","name":"Acme","sector":"Consumer","stage":"Seed","website":"https://acme.com","city":"Lehi","is_hiring":true,"description":"short snippet","reason":"one sentence on why this matches the user's ask"}]
5. The "id" MUST exactly match the value that appears as [id:...] in the company database — copy it verbatim. Never invent ids and never wrap the marker in angle brackets, asterisks, or backticks.
6. The "reason" should be 15–25 words tied to the user's specific question (e.g. "Makes a kid-friendly smartphone with parental controls — directly matches your search.").
7. NEVER mix __RESOURCES__ and __COMPANIES__ in the same response. Pick whichever the question is about.

${ENTREPRENEUR_JOURNEY}`

// Stage → topics mapping using real DB topic values
const STAGE_TOPICS: Record<string, string[]> = {
  idea:        ['Start a Business', 'Entrepreneurship Communities'],
  early:       ['Start a Business', 'Funding', 'Taxes and Finance'],
  growth:      ['Funding', 'Late Stage Growth', 'Marketing and Sales'],
  established: ['Late Stage Growth', 'International Trade'],
}

// Common words to drop when tokenizing the user's message — they don't carry
// matching signal and would otherwise pull in noise resources.
const STOPWORDS = new Set([
  'a','about','an','and','any','are','as','at','be','been','but','by','can','could','do','does',
  'did','for','from','had','has','have','he','her','here','him','his','how','i','if','in','into',
  'is','it','its','just','lately','like','many','me','more','most','my','no','not','of','on','or',
  'our','out','over','recent','recently','same','she','should','so','some','such','that','the',
  'their','them','then','there','these','they','this','those','through','to','too','up','us',
  'was','we','were','what','when','where','which','while','who','whom','why','will','with',
  'would','you','your','yours',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOPWORDS.has(t))
}

// Score a resource against tokens from the user's message. Title hits weigh
// most, topic/industry/community hits next, description hits last.
function scoreMessageMatch(r: Record<string, unknown>, tokens: string[]): number {
  if (!tokens.length) return 0
  const title       = String(r.title       ?? '').toLowerCase()
  const description = String(r.description ?? '').toLowerCase()
  const topics      = ((r.topics      as string[]) ?? []).join(' ').toLowerCase()
  const industries  = ((r.industries  as string[]) ?? []).join(' ').toLowerCase()
  const communities = ((r.communities as string[]) ?? []).join(' ').toLowerCase()

  let score = 0
  for (const tok of tokens) {
    if (title.includes(tok))       score += 5
    if (topics.includes(tok))      score += 4
    if (industries.includes(tok))  score += 3
    if (communities.includes(tok)) score += 3
    if (description.includes(tok)) score += 2
  }
  return score
}

function filterResources(
  resources: Record<string, unknown>[],
  ctx?: UserContext,
  message?: string,
): Record<string, unknown>[] {
  const tokens = message ? tokenize(message) : []
  const hasProfileSignal = !!(ctx?.stage || ctx?.industry || ctx?.communities?.length)

  // Nothing to score on at all → fall back to first 40 by DB order.
  if (!tokens.length && !hasProfileSignal) {
    return resources.slice(0, 40)
  }

  const stageTopics = ctx?.stage ? STAGE_TOPICS[ctx.stage] ?? [] : []

  const scored = resources.map(r => {
    let score = 0
    const rTopics      = (r.topics      as string[]) ?? []
    const rCommunities = (r.communities as string[]) ?? []
    const rIndustries  = (r.industries  as string[]) ?? []

    if (stageTopics.length && rTopics.some(t => stageTopics.includes(t))) score += 3
    if (ctx?.communities?.length && rCommunities.some(c =>
      ctx.communities!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
    )) score += 2
    if (ctx?.industry && rIndustries.some(i =>
      i.toLowerCase().includes(ctx.industry!.toLowerCase())
    )) score += 2

    score += scoreMessageMatch(r, tokens)

    return { r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 40).map(x => x.r)
}

// Build a compact resource list — omit null/empty fields to save tokens.
function buildResourceBlock(
  resources: Record<string, unknown>[],
  ctx?: UserContext,
  message?: string,
): string {
  const filtered = filterResources(resources, ctx, message)
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

function buildProfileBlock(profile: UserProfile | null, business: Company | null): string {
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
  let business: Company | null = null
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
        ? client.from('companies').select('*').eq('id', businessId).single()
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

  // Company DB is now used in both modes — entrepreneurs can ask about Utah
  // companies (e.g. "any companies that specialize in kids' phones?") and
  // Sprig responds with a __COMPANIES__ card block. Cache for 5 min.
  if (!cachedCompanyDb || Date.now() > companyDbExpiry) {
    const client = await serverSupabaseClient(event)
    const { data } = await client
      .from('companies')
      .select('id, name, sector, stage, employee_range, is_hiring, description, website, city')
      .eq('is_active', true)
    const companies = data ?? []
    const lines = companies.map(c => {
      const desc = c.description ? c.description.slice(0, 100) : ''
      return `- [id:${c.id}] ${c.name} | Sector: ${c.sector ?? ''} | Stage: ${c.stage ?? ''} | Employees: ${c.employee_range ?? ''} | Hiring: ${c.is_hiring ? 'Yes' : 'No'} | City: ${c.city ?? ''} | Website: ${c.website ?? ''} | ${desc}`
    })
    cachedCompanyDb = `UTAH STARTUP ECOSYSTEM (${companies.length} companies):\n${lines.join('\n')}`
    companyDbExpiry = Date.now() + 5 * 60 * 1000
  }

  let systemBlocks: Anthropic.Messages.TextBlockParam[]

  if (isInvestorMode) {
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

    const resourceBlock = buildResourceBlock(cachedResources, userContext ?? undefined, message)

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
      // Block 3: company database — cached, shared with investor mode. Lets
      // Sprig answer founder-side questions about Utah startups too.
      {
        type: 'text',
        text: cachedCompanyDb,
        cache_control: { type: 'ephemeral' },
      },
      // Block 4: user profile — NOT cached (unique per user/request)
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
