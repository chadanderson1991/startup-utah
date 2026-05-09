import { serverSupabaseClient } from '#supabase/server'

// GET /api/companies/stats
// Public (no auth required). Used by map stats overlay.
// In-memory cache with 60-second TTL.

interface CompanyStats {
  total: number
  hiring: number
  bySector: Record<string, number>
}

let cachedStats: CompanyStats | null = null
let cacheExpiry = 0

export default defineEventHandler(async (event) => {
  if (cachedStats && Date.now() < cacheExpiry) {
    return cachedStats
  }

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('companies')
    .select('id, sector, is_hiring')
    .eq('is_active', true)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const companies = data ?? []
  const bySector: Record<string, number> = {}

  for (const company of companies) {
    if (company.sector) {
      bySector[company.sector] = (bySector[company.sector] ?? 0) + 1
    }
  }

  cachedStats = {
    total: companies.length,
    hiring: companies.filter(c => c.is_hiring).length,
    bySector,
  }
  cacheExpiry = Date.now() + 60 * 1000

  return cachedStats
})
