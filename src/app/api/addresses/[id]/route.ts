import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'
import { getAuthUserId } from '@/lib/auth-helper'
import type { CreateAddressRequest, ApiResponse } from '@/types/api'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/addresses/[id] - Get single address
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Address not found' },
          { status: 404 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: address
    })
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateAddressRequest = await request.json()

    // Check if address exists and belongs to user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        name: body.name,
        address: body.address,
        gst_number: body.gst_number || null,
      })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Address updated successfully'
    })
  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if address exists and belongs to user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Address deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}