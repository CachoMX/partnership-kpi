import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const { callId, closerId, closerName, setterId, setterName } = await request.json()

    if (!callId) {
      return NextResponse.json({ error: 'Missing callId' }, { status: 400 })
    }

    const updateData: any = {}

    // Update closer if provided
    if (closerId !== undefined) {
      updateData.closer_id = closerId || null
      updateData.closer_name = closerName || ''
    }

    // Update setter if provided
    if (setterId !== undefined) {
      updateData.setter_id = setterId || null
      updateData.setter_name = setterName || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('calls')
      .update(updateData)
      .eq('id', callId)

    if (error) {
      console.error('Error updating call:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in sales update API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
