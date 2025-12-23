import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json()

    if (!rawEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Normalize email to lowercase for consistent lookup
    const email = rawEmail.toLowerCase().trim()

    // Fetch user role (using ilike for case-insensitive match as fallback)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role, email, name')
      .ilike('email', email)
      .single()

    if (userError || !userData) {
      // User exists in auth but not in users table
      // Return 200 with null role so frontend can handle it
      return NextResponse.json({
        role: null,
        name: null,
        closerId: null,
        setterId: null
      }, { status: 200 })
    }

    // If closer or setter, get their IDs
    let closerId, setterId

    if (userData.role === 'closer') {
      const { data: closerData } = await supabaseAdmin
        .from('closers')
        .select('id')
        .ilike('email', email)
        .maybeSingle()
      closerId = closerData?.id
    } else if (userData.role === 'setter') {
      const { data: setterData } = await supabaseAdmin
        .from('setters')
        .select('id')
        .ilike('email', email)
        .maybeSingle()
      setterId = setterData?.id
    }

    return NextResponse.json({
      role: userData.role,
      name: userData.name,
      closerId,
      setterId
    })
  } catch (error: any) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
