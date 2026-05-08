/**
 * Seed script: imports Resources List - Builder Day.xlsx into the resources table.
 * Run: npm run seed:resources
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_KEY.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

const EXCEL_PATH = resolve(__dirname, '../../Resources List - Builder Day.xlsx')

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
)

function splitPipe(value: unknown): string[] {
  if (!value || typeof value !== 'string') return []
  return value
    .split('|')
    .map(v => v.trim())
    .filter(Boolean)
}

interface RawRow {
  id: number | string
  Title: string
  description?: string
  Communities?: string
  Industries?: string
  Locations?: string
  Topics?: string
  link?: string
  email?: string
}

async function run() {
  console.log('Reading Excel file...')
  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' })

  console.log(`Found ${rows.length} rows`)

  const records = rows.map(row => ({
    id: Number(row.id),
    title: String(row.Title || '').trim(),
    description: String(row.description || '').trim() || null,
    link: String(row.link || '').trim() || null,
    email: String(row.email || '').trim() || null,
    communities: splitPipe(row.Communities),
    industries: splitPipe(row.Industries),
    locations: splitPipe(row.Locations),
    topics: splitPipe(row.Topics),
    is_active: true,
  })).filter(r => r.id && r.title)

  console.log(`Upserting ${records.length} resources...`)

  // Batch in chunks of 50 to stay under Supabase payload limits
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

  console.log('✓ Resources seeded successfully')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
