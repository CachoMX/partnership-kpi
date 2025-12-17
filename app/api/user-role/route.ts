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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Fetch user role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role, email, name')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({
        error: 'User not found',
        role: null
      }, { status: 404 })
    }

    // If closer or setter, get their IDs
    let closerId, setterId

    if (userData.role === 'closer') {
      const { data: closerData } = await supabaseAdmin
        .from('closers')
        .select('id')
        .eq('email', email)
        .single()
      closerId = closerData?.id
    } else if (userData.role === 'setter') {
      const { data: setterData } = await supabaseAdmin
        .from('setters')
        .select('id')
        .eq('email', email)
        .single()
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
