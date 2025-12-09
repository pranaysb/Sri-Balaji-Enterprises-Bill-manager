import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUserId } from '@/lib/auth-helper'
import type { CreateBillRequest, ApiResponse } from '@/types/api'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to get user ID from Clerk token
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API: No authorization header found')
      return null
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔧 API: Token received:', token ? 'Yes' : 'No')

    // For now, we'll use a simple approach - in a real app you'd verify the JWT
    // Since we're using Clerk's service role key, we can trust the user_id from the client
    // In production, you should verify the JWT properly

    return await getUserIdFromToken(token)
  } catch (error) {
    console.error('🔧 API: Error getting user ID:', error)
    return null
  }
}

// Mock function to extract user ID from token
// In a real application, you would verify the JWT properly
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // For development, we'll decode the token to get user ID
    // Note: This is a simplified approach for development
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      console.log('🔧 API: Invalid token format')
      return null
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
    console.log('🔧 API: Token payload:', payload)

    return payload.sub || null // Clerk stores user ID in 'sub' claim
  } catch (error) {
    console.error('🔧 API: Error decoding token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 API: Starting bills fetch request')

    const userId = await getUserIdFromRequest(request)
    console.log('🔧 API: Extracted User ID:', userId)

    if (!userId) {
      console.log('🔧 API: No user ID found - unauthorized')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔧 API: Fetching bills for user:', userId)

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('🔧 API: Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bills' },
        { status: 500 }
      )
    }

    console.log('🔧 API: Successfully fetched', data?.length || 0, 'bills')
    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error: any) {
    console.error('🔧 API: Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthUserId()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateBillRequest = await request.json()

    // Validate required fields
    if (!body.bill_no || !body.billing_date || !body.quantity || !body.total_amount || !body.buyer_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate taxes
    const taxlessAmount = body.total_amount / 1.28
    const taxAmount = taxlessAmount * 0.28
    const cgst = taxAmount / 2
    const sgst = taxAmount / 2

    const billData = {
      user_id: userId,
      bill_no: body.bill_no,
      billing_date: body.billing_date,
      vehicle_number: body.vehicle_number || null,
      quantity: body.quantity,
      total_amount: body.total_amount,
      buyer_address: body.buyer_address,
      buyer_name: body.buyer_name || null,
      buyer_gst: body.buyer_gst || null,
      shipping_address: body.is_same_address ? body.buyer_address : (body.shipping_address || body.buyer_address),
      shipping_name: body.is_same_address ? body.buyer_name : (body.shipping_name || body.buyer_name),
      shipping_gst: body.is_same_address ? body.buyer_gst : (body.shipping_gst || body.buyer_gst),
      is_same_address: body.is_same_address ?? true,
      rate: Math.round((body.total_amount / body.quantity) / 1.28),
      taxless_amount: Math.round(taxlessAmount),
      cgst_amount: Math.round(cgst),
      sgst_amount: Math.round(sgst),
      total_tax: Math.round(taxAmount),
    }

    const { data, error } = await supabase
      .from('bills')
      .insert([billData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create bill' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Bill created successfully'
    })
  } catch (error) {
    console.error('Bill creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}