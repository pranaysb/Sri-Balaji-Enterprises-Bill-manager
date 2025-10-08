import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔧 Fetching bills for user:', userId)

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bills' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.bill_no || !body.billing_date || !body.quantity || !body.total_amount || !body.buyer_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate taxes
    const taxlessAmount = parseFloat(body.total_amount) / 1.28
    const taxAmount = taxlessAmount * 0.28
    const cgst = taxAmount / 2
    const sgst = taxAmount / 2
    
    const billData = {
      user_id: userId,
      bill_no: body.bill_no,
      billing_date: body.billing_date,
      vehicle_number: body.vehicle_number || null,
      quantity: parseInt(body.quantity),
      total_amount: parseFloat(body.total_amount),
      buyer_address: body.buyer_address,
      buyer_name: body.buyer_name || null,
      buyer_gst: body.buyer_gst || null,
      rate: Math.round((parseFloat(body.total_amount) / parseInt(body.quantity)) / 1.28),
      taxless_amount: Math.round(taxlessAmount),
      cgst_amount: Math.round(cgst),
      sgst_amount: Math.round(sgst),
      total_tax: Math.round(taxAmount),
    }

    let result
    if (body.editId) {
      // Update existing bill
      result = await supabase
        .from('bills')
        .update(billData)
        .eq('id', body.editId)
        .eq('user_id', userId)
    } else {
      // Create new bill
      result = await supabase
        .from('bills')
        .insert([billData])
        .select()
        .single()
    }

    if (result.error) {
      console.error('Supabase error:', result.error)
      return NextResponse.json(
        { success: false, error: 'Failed to save bill to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: body.editId ? 'Bill updated successfully' : 'Bill created successfully'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}