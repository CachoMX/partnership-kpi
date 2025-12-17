import * as fs from 'fs'
import * as path from 'path'
import * as Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

interface CSVRow {
  Timestamp: string
  'Date Of Booking': string
  'Lead Name': string
  'Lead Phone Number': string
  'Lead Email': string
  'Offer Made?': string
  Result: string
  Closer: string
  Rev: string
  Cash: string
  'Lead Source': string
  'Medium ': string
  Campagin: string
  'Call Recording Link': string
  Setter: string
  'Cash 2': string
  'Name Needs To Submit': string
}

function parseMoneyValue(value: string): number {
  if (!value || value === '') return 0
  // Remove $, commas, and parse
  return parseFloat(value.replace(/[$,]/g, '')) || 0
}

function parseDate(dateString: string): string | null {
  if (!dateString || dateString === '') return null

  try {
    // Handle format like "August 8 2025"
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch (e) {
    console.error('Error parsing date:', dateString, e)
  }

  return null
}

function parseTimestamp(timestamp: string): string | null {
  if (!timestamp || timestamp === '') return null

  try {
    // Handle format like "08/08/2025 17:55:06"
    const [datePart, timePart] = timestamp.split(' ')
    const [day, month, year] = datePart.split('/')
    const dateObj = new Date(`${year}-${month}-${day}T${timePart}`)

    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString()
    }
  } catch (e) {
    console.error('Error parsing timestamp:', timestamp, e)
  }

  return null
}

function normalizeResult(result: string): Database['public']['Enums']['call_result'] | null {
  if (!result || result === '') return null

  const normalized = result.trim()

  // Map variations to our enum values
  const resultMap: Record<string, Database['public']['Enums']['call_result']> = {
    'Closed': 'Closed',
    'Follow-Up Scheduled': 'Follow-Up Scheduled',
    'No Show': 'No Show',
    'DQ': 'DQ',
    'Reschedule': 'Reschedule'
  }

  return resultMap[normalized] || 'Other'
}

async function importCSV(filePath: string) {
  console.log('Reading CSV file...')

  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const { data, errors } = Papa.parse<CSVRow>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.error('CSV parsing errors:', errors)
  }

  console.log(`Parsed ${data.length} rows from CSV`)

  // First, collect unique closers and setters
  const closersSet = new Set<string>()
  const settersSet = new Set<string>()

  data.forEach(row => {
    if (row.Closer && row.Closer.trim() !== '') {
      closersSet.add(row.Closer.trim())
    }
    if (row.Setter && row.Setter.trim() !== '' && row.Setter.trim().toLowerCase() !== 'none') {
      settersSet.add(row.Setter.trim())
    }
  })

  console.log(`Found ${closersSet.size} unique closers and ${settersSet.size} unique setters`)

  // Insert closers
  const closersToInsert = Array.from(closersSet).map(name => ({
    name,
    email: null,
    commission_rate: 10.0
  }))

  console.log('Inserting closers...')
  const { data: insertedClosers, error: closersError } = await supabase
    .from('closers')
    .upsert(closersToInsert, { onConflict: 'name', ignoreDuplicates: false })
    .select()

  if (closersError) {
    console.error('Error inserting closers:', closersError)
    return
  }

  console.log(`Inserted ${insertedClosers?.length} closers`)

  // Insert setters
  const settersToInsert = Array.from(settersSet).map(name => ({
    name,
    email: null
  }))

  console.log('Inserting setters...')
  const { data: insertedSetters, error: settersError } = await supabase
    .from('setters')
    .upsert(settersToInsert, { onConflict: 'name', ignoreDuplicates: false })
    .select()

  if (settersError) {
    console.error('Error inserting setters:', settersError)
    return
  }

  console.log(`Inserted ${insertedSetters?.length} setters`)

  // Create maps for quick lookup
  const closerNameToId = new Map(
    insertedClosers?.map(c => [c.name, c.id]) || []
  )
  const setterNameToId = new Map(
    insertedSetters?.map(s => [s.name, s.id]) || []
  )

  // Process calls in batches
  const batchSize = 100
  let processed = 0

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)

    const callsToInsert = batch
      .filter(row => row.Closer && row.Closer.trim() !== '')
      .map(row => {
        const closerName = row.Closer.trim()
        const setterName = row.Setter?.trim()

        return {
          timestamp: parseTimestamp(row.Timestamp),
          booking_date: parseDate(row['Date Of Booking']),
          lead_name: row['Lead Name'] || null,
          lead_phone: row['Lead Phone Number'] || null,
          lead_email: row['Lead Email'] || null,
          offer_made: row['Offer Made?']?.toLowerCase() === 'yes',
          result: normalizeResult(row.Result),
          closer_id: closerNameToId.get(closerName) || null,
          closer_name: closerName,
          revenue: parseMoneyValue(row.Rev),
          cash_collected: parseMoneyValue(row.Cash),
          cash_collected_2: parseMoneyValue(row['Cash 2']),
          lead_source: row['Lead Source'] || null,
          medium: row['Medium '] || null,
          campaign: row.Campagin || null,
          call_recording_link: row['Call Recording Link'] || null,
          setter_id: setterName && setterName.toLowerCase() !== 'none'
            ? setterNameToId.get(setterName) || null
            : null,
          setter_name: setterName && setterName.toLowerCase() !== 'none' ? setterName : null,
          notes: row['Name Needs To Submit'] || null
        }
      })

    console.log(`Inserting batch ${i / batchSize + 1} (${callsToInsert.length} calls)...`)

    const { error: callsError } = await supabase
      .from('calls')
      .insert(callsToInsert)

    if (callsError) {
      console.error('Error inserting calls batch:', callsError)
      console.error('Failed batch:', JSON.stringify(callsToInsert.slice(0, 2), null, 2))
    } else {
      processed += callsToInsert.length
      console.log(`Progress: ${processed}/${data.length}`)
    }
  }

  console.log('Import complete!')
  console.log(`Total calls processed: ${processed}`)
}

// Run the import
const csvPath = process.argv[2] || 'c:/Users/uriel/Downloads/Tube Accelerator -  Data - Calendly Booked Calls.csv'

importCSV(csvPath)
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
