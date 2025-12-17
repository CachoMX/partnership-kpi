import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Get all closers
    const { data: closers, error: closersError } = await supabaseAdmin
      .from('closers')
      .select('id, name, email, commission_rate')

    if (closersError) {
      return NextResponse.json({ error: closersError.message }, { status: 500 })
    }

    // Build calls query with date filtering
    let callsQuery = supabaseAdmin
      .from('calls')
      .select('closer_id, result, revenue, cash_collected, offer_made, booking_date')

    if (dateFrom) {
      callsQuery = callsQuery.gte('booking_date', dateFrom)
    }
    if (dateTo) {
      callsQuery = callsQuery.lte('booking_date', dateTo)
    }

    const { data: calls, error: callsError } = await callsQuery

    if (callsError) {
      return NextResponse.json({ error: callsError.message }, { status: 500 })
    }

    // Calculate stats for each closer
    const closersWithStats = closers?.map(closer => {
      const closerCalls = calls?.filter(call => call.closer_id === closer.id) || []

      const total_calls = closerCalls.length
      const live_calls = closerCalls.filter(c => c.result === 'Live').length
      const closed_deals = closerCalls.filter(c => c.result === 'Closed').length
      const no_shows = closerCalls.filter(c => c.result === 'No Show').length
      const offers_made = closerCalls.filter(c => c.offer_made).length
      const total_revenue = closerCalls
        .filter(c => c.result === 'Closed')
        .reduce((sum, c) => sum + (c.revenue || 0), 0)
      const total_cash_collected = closerCalls
        .filter(c => c.result === 'Closed')
        .reduce((sum, c) => sum + (c.cash_collected || 0), 0)
      const total_commission = total_revenue * (closer.commission_rate / 100)

      return {
        ...closer,
        total_calls,
        live_calls,
        closed_deals,
        no_shows,
        offers_made,
        total_revenue,
        total_cash_collected,
        total_commission
      }
    }) || []

    // Sort by cash collected
    closersWithStats.sort((a, b) => b.total_cash_collected - a.total_cash_collected)

    return NextResponse.json({ data: closersWithStats })
  } catch (error: any) {
    console.error('Error in closers stats API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
