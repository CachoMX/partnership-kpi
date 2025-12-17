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
    const setterId = searchParams.get('setterId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!setterId) {
      return NextResponse.json({ error: 'setterId is required' }, { status: 400 })
    }

    // Get calls grouped by date for this setter
    let query = supabaseAdmin
      .from('calls')
      .select('booking_date, result, revenue')
      .eq('setter_id', setterId)

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
      calls_booked: number
      shows: number
      closes: number
      revenue_generated: number
    }>()

    calls?.forEach(call => {
      const dateStr = call.booking_date
      if (!dailyStatsMap.has(dateStr)) {
        dailyStatsMap.set(dateStr, {
          date: dateStr,
          calls_booked: 0,
          shows: 0,
          closes: 0,
          revenue_generated: 0
        })
      }

      const stats = dailyStatsMap.get(dateStr)!
      stats.calls_booked++

      if (call.result === 'Live' || call.result === 'Closed') {
        stats.shows++
      }
      if (call.result === 'Closed') {
        stats.closes++
        stats.revenue_generated += call.revenue || 0
      }
    })

    // Convert to array and sort by date
    const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Find best day
    const bestDay = dailyStats.reduce((best, current) => {
      return current.revenue_generated > best.revenue_generated ? current : best
    }, dailyStats[0] || { date: '', revenue_generated: 0, closes: 0 })

    return NextResponse.json({
      dailyStats,
      bestDay: {
        date: bestDay.date,
        revenue_generated: bestDay.revenue_generated,
        closes: bestDay.closes
      }
    })
  } catch (error: any) {
    console.error('Error in daily stats API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
