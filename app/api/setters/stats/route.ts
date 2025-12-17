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

    // Get all setters
    const { data: setters, error: settersError } = await supabaseAdmin
      .from('setters')
      .select('id, name, email')

    if (settersError) {
      return NextResponse.json({ error: settersError.message }, { status: 500 })
    }

    // Build calls query with date filtering
    let callsQuery = supabaseAdmin
      .from('calls')
      .select('setter_id, result, revenue, booking_date')

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

    // Calculate stats for each setter
    const settersWithStats = setters?.map(setter => {
      const setterCalls = calls?.filter(call => call.setter_id === setter.id) || []

      const total_calls_booked = setterCalls.length
      const total_shows = setterCalls.filter(c => c.result === 'Live' || c.result === 'Closed').length
      const total_closes = setterCalls.filter(c => c.result === 'Closed').length
      const total_revenue_generated = setterCalls
        .filter(c => c.result === 'Closed')
        .reduce((sum, c) => sum + (c.revenue || 0), 0)
      const show_rate = total_calls_booked > 0 ? (total_shows / total_calls_booked) * 100 : 0
      const close_rate = total_calls_booked > 0 ? (total_closes / total_calls_booked) * 100 : 0

      return {
        ...setter,
        total_calls_booked,
        total_shows,
        total_closes,
        total_revenue_generated,
        show_rate,
        close_rate
      }
    }) || []

    // Sort by revenue generated
    settersWithStats.sort((a, b) => b.total_revenue_generated - a.total_revenue_generated)

    return NextResponse.json({ data: settersWithStats })
  } catch (error: any) {
    console.error('Error in setters stats API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
