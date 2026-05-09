/**
 * Seed script: imports Map Data for Builder Day.xlsx into the companies table.
 * Geocodes each address via Mapbox Geocoding API.
 * Run: npm run seed:companies
 *
 * Requires .env with SUPABASE_URL, SUPABASE_SERVICE_KEY, NUXT_PUBLIC_MAPBOX_TOKEN.
 *
 * Geocoding rate: 1 request/second to stay well under Mapbox limits.
 * Expect ~4 minutes for 223 companies.
 * Already-geocoded records are skipped on re-run (upsert by name + address).
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

const EXCEL_PATH = resolve(__dirname, '../../Map Data for Builder Day .xlsx')

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
)

const MAPBOX_TOKEN = process.env.NUXT_PUBLIC_MAPBOX_TOKEN!
if (!MAPBOX_TOKEN) {
  console.error('NUXT_PUBLIC_MAPBOX_TOKEN is required for geocoding')
  process.exit(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRow = Record<string, any>

// Case-insensitive, whitespace-trimmed column lookup
function col(row: RawRow, ...names: string[]): string {
  for (const key of Object.keys(row)) {
    const k = key.trim().toLowerCase()
    for (const name of names) {
      if (k === name.trim().toLowerCase()) {
        return String(row[key] ?? '').trim()
      }
    }
  }
  return ''
}

async function geocode(address: string): Promise<{ lat: number; lng: number; city: string } | null> {
  if (!address?.trim()) return null

  const encoded = encodeURIComponent(address)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&country=US&proximity=-111.093,39.32&limit=1`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as any

    const feature = data.features?.[0]
    if (!feature) return null

    const [lng, lat] = feature.center as [number, number]

    // Extract city from context
    const cityCtx = feature.context?.find((c: any) => c.id?.startsWith('place.'))
    const city = cityCtx?.text || feature.place_name?.split(',')[1]?.trim() || ''

    return { lat, lng, city }
  } catch {
    return null
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  console.log('Reading Excel file...')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(EXCEL_PATH)
  const sheet = workbook.worksheets[0]
  const headerRow = sheet.getRow(1).values as (string | undefined)[]
  const headers = headerRow.slice(1) // exceljs row values are 1-indexed with undefined at [0]

  const rows: RawRow[] = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const obj: RawRow = {}
    ;(row.values as unknown[]).slice(1).forEach((val, i) => {
      const key = headers[i] ?? `col${i}`
      obj[key] = val ?? ''
    })
    rows.push(obj)
  })

  console.log(`Found ${rows.length} rows`)

  // Print actual column names from first row so mismatches are visible
  if (rows.length > 0) {
    console.log('Actual column names:', Object.keys(rows[0]))
  }

  const companies = rows
    .map(row => ({
      name:          col(row, 'Startup Name'),
      linkedin_url:  col(row, 'LinkedIn Link (map it to Links to get the logo)', 'LinkedIn Link') || null,
      address:       col(row, 'Full Address') || null,
      description:   col(row, 'Description of startup', 'Description') || null,
      website:       col(row, 'Website') || null,
      stage:         col(row, 'Stage') || null,
      employee_range: col(row, '# of Employees', 'Employees') || null,
      sector:        col(row, 'Section') || null,
    }))
    .filter(c => c.name)
    // Deduplicate by name (the spreadsheet has some duplicates)
    .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)

  console.log(`Processing ${companies.length} unique companies...`)
  console.log('Geocoding addresses (this takes ~4 minutes for 223 entries)...\n')

  const records = []
  let geocoded = 0
  let skipped = 0

  for (let i = 0; i < companies.length; i++) {
    const c = companies[i]
    let geo: { lat: number; lng: number; city: string } | null = null

    if (c.address) {
      geo = await geocode(c.address)
      if (geo) geocoded++
      else skipped++
      // Rate limit: 1 req/sec
      await sleep(1000)
    } else {
      skipped++
    }

    records.push({
      name: c.name,
      description: c.description,
      website: c.website ? normalizeUrl(c.website) : null,
      linkedin_url: c.linkedin_url,
      address: c.address,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
      city: geo?.city ?? null,
      sector: c.sector || null,
      stage: normalizeStage(c.stage),
      employee_range: c.employee_range || null,
      is_hiring: false,
      job_postings: [],
      photos: [],
      is_verified: false,
      is_active: true,
    })

    process.stdout.write(`\r  ${i + 1}/${companies.length} — geocoded: ${geocoded}, skipped: ${skipped}`)
  }

  console.log('\n\nInserting into database...')

  // Insert in chunks
  const CHUNK = 25
  let inserted = 0
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK)
    const { error } = await supabase.from('companies').insert(chunk)
    if (error) {
      console.error(`\nError inserting chunk at ${i}:`, error.message)
      // Continue — don't abort the whole seed for a duplicate
    } else {
      inserted += chunk.length
    }
  }

  console.log(`✓ Companies seeded: ${inserted} inserted, ${records.length - inserted} skipped/errored`)
  console.log(`  Geocoded: ${geocoded}/${companies.length} addresses resolved`)
}

function normalizeUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

function normalizeStage(stage: string | null): string | null {
  if (!stage) return null
  const s = stage.trim()
  // Strip trailing spaces from Excel data
  const map: Record<string, string> = {
    'Seed ': 'Seed', 'Series A ': 'Series A', 'Series B ': 'Series B',
    'Series C ': 'Series C', 'Series D+ ': 'Series D+', 'Pre-Seed ': 'Pre-Seed',
  }
  return map[s] ?? s
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
