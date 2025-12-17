import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('booking_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Find or create closer
    let closerId = body.closer_id

    if (!closerId && body.closer_name) {
      const { data: existingCloser } = await supabase
        .from('closers')
        .select('id')
        .eq('name', body.closer_name)
        .single()

      if (existingCloser) {
        closerId = existingCloser.id
      } else {
        const { data: newCloser, error: closerError } = await supabase
          .from('closers')
          .insert({ name: body.closer_name, commission_rate: 10.0 })
          .select('id')
          .single()

        if (closerError) {
          return NextResponse.json({ error: closerError.message }, { status: 500 })
        }

        closerId = newCloser.id
      }
    }

    // Find or create setter
    let setterId = body.setter_id

    if (!setterId && body.setter_name && body.setter_name.toLowerCase() !== 'none') {
      const { data: existingSetter } = await supabase
        .from('setters')
        .select('id')
        .eq('name', body.setter_name)
        .single()

      if (existingSetter) {
        setterId = existingSetter.id
      } else {
        const { data: newSetter, error: setterError } = await supabase
          .from('setters')
          .insert({ name: body.setter_name })
          .select('id')
          .single()

        if (setterError) {
          return NextResponse.json({ error: setterError.message }, { status: 500 })
        }

        setterId = newSetter.id
      }
    }

    const { data, error } = await supabase
      .from('calls')
      .insert({
        ...body,
        closer_id: closerId,
        setter_id: setterId
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
