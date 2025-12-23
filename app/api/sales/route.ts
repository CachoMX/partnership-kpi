import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const closerId = searchParams.get('closerId')
    const setterId = searchParams.get('setterId')
    const result = searchParams.get('result')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : null

    // First get total count
    let countQuery = supabaseAdmin
      .from('calls')
      .select('id', { count: 'exact', head: true })

    if (dateFrom) countQuery = countQuery.gte('booking_date', dateFrom)
    if (dateTo) countQuery = countQuery.lte('booking_date', `${dateTo}T23:59:59`)
    if (closerId) countQuery = countQuery.eq('closer_id', closerId)
    if (setterId) countQuery = countQuery.eq('setter_id', setterId)
    if (result) countQuery = countQuery.eq('result', result)

    const { count: totalCount } = await countQuery

    let query = supabaseAdmin
      .from('calls')
      .select('id, timestamp, booking_date, lead_name, lead_email, lead_phone, result, revenue, cash_collected, cash_collected_2, closer_id, closer_name, setter_id, setter_name, notes')
      .order('booking_date', { ascending: false })

    // Apply date filters
    if (dateFrom) {
      query = query.gte('booking_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('booking_date', `${dateTo}T23:59:59`)
    }

    // Apply closer filter
    if (closerId) {
      query = query.eq('closer_id', closerId)
    }

    // Apply setter filter
    if (setterId) {
      query = query.eq('setter_id', setterId)
    }

    // Apply result filter
    if (result) {
      query = query.eq('result', result)
    }

    // Apply limit only if specified
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching sales:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, totalCount })
  } catch (error: any) {
    console.error('Error in sales API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
