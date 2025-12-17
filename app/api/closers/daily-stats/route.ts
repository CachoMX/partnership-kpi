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
    const closerId = searchParams.get('closerId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!closerId) {
      return NextResponse.json({ error: 'closerId is required' }, { status: 400 })
    }

    // Get calls grouped by date for this closer
    let query = supabaseAdmin
      .from('calls')
      .select('booking_date, result, revenue, cash_collected')
      .eq('closer_id', closerId)

    // Apply date filters if provided
    if (dateFrom) {
      query = query.gte('booking_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('booking_date', dateTo)
    }

    query = query.order('booking_date', { ascending: true })

    const { data: calls, error } = await query

    if (error) {
      console.error('Error fetching daily stats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by date and calculate daily stats
    const dailyStatsMap = new Map<string, {
      date: string
      calls: number
      live_calls: number
      closed_deals: number
      revenue: number
      cash_collected: number
      commission: number
    }>()

    calls?.forEach(call => {
      const dateStr = call.booking_date
      if (!dailyStatsMap.has(dateStr)) {
        dailyStatsMap.set(dateStr, {
          date: dateStr,
          calls: 0,
          live_calls: 0,
          closed_deals: 0,
          revenue: 0,
          cash_collected: 0,
          commission: 0
        })
      }

      const stats = dailyStatsMap.get(dateStr)!
      stats.calls++

      if (call.result === 'Live') {
        stats.live_calls++
      }
      if (call.result === 'Closed') {
        stats.closed_deals++
        stats.revenue += call.revenue || 0
        stats.cash_collected += call.cash_collected || 0
        // Commission is calculated from revenue, not stored directly
        stats.commission += (call.revenue || 0) * 0.1 // Assuming 10% commission
      }
    })

    // Convert to array and sort by date
    const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Find best day
    const bestDay = dailyStats.reduce((best, current) => {
      return current.revenue > best.revenue ? current : best
    }, dailyStats[0] || { date: '', revenue: 0, closed_deals: 0 })

    return NextResponse.json({
      dailyStats,
      bestDay: {
        date: bestDay.date,
        revenue: bestDay.revenue,
        closed_deals: bestDay.closed_deals
      }
    })
  } catch (error: any) {
    console.error('Error in daily stats API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
