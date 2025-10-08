import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'
import { getAuthUserId } from '@/lib/auth-helper'
import type { CreateAddressRequest, ApiResponse } from '@/types/api'

// GET /api/addresses - Get all addresses for user
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch addresses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: addresses
    })
  } catch (error) {
    console.error('Addresses fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateAddressRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Name and address are required' },
        { status: 400 }
      )
    }

    const addressData = {
      user_id: userId,
      name: body.name,
      address: body.address,
      gst_number: body.gst_number || null,
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Address created successfully'
    })
  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}