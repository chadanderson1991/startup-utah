/**
 * Seed script: imports resources_retagged.csv into the resources table.
 * Run: npm run seed:resources
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_KEY.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CSV_PATH = process.argv[2] ?? 'C:/Users/Chad Anderson/Downloads/resources_retagged.csv'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
)

function splitPipe(value: unknown): string[] {
  if (!value || typeof value !== 'string') return []
  return value.split('|').map(v => v.trim()).filter(Boolean)
}

interface RawRow {
  id: string
  title: string
  description?: string
  link?: string
  email?: string
  resource_type?: string
  stages?: string
  keywords?: string
  communities?: string
  industries?: string
  locations?: string
  topics?: string
}

async function run() {
  console.log('Reading CSV file...')
  const raw = readFileSync(CSV_PATH, 'utf-8')
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as RawRow[]

  console.log(`Found ${rows.length} rows`)

  const records = rows
    .map(row => ({
      id: Number(row.id),
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim() || null,
      link: String(row.link || '').trim() || null,
      email: String(row.email || '').trim() || null,
      resource_type: String(row.resource_type || '').trim() || null,
      stages: splitPipe(row.stages),
      keywords: splitPipe(row.keywords),
      communities: splitPipe(row.communities),
      industries: splitPipe(row.industries),
      locations: splitPipe(row.locations),
      topics: splitPipe(row.topics),
      is_active: true,
    }))
    .filter(r => r.id && r.title)

  console.log(`Upserting ${records.length} resources...`)

  const CHUNK = 50
  let inserted = 0
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('resources')
      .upsert(chunk, { onConflict: 'id' })
    if (error) {
      console.error(`Error upserting chunk starting at ${i}:`, error.message)
      process.exit(1)
    }
    inserted += chunk.length
    console.log(`  ${inserted}/${records.length} done`)
  }

  console.log('Done')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
