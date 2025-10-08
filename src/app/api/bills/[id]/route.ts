import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'
import { getAuthUserId } from '@/lib/auth-helper'
import type { UpdateBillRequest, ApiResponse } from '@/types/api'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/bills/[id] - Get single bill
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

    const { data: bill, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Bill not found' },
          { status: 404 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bill' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: bill
    })
  } catch (error) {
    console.error('Bill fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bills/[id] - Update bill
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

    const body: UpdateBillRequest = await request.json()

    // Check if bill exists and belongs to user
    const { data: existingBill, error: checkError } = await supabase
      .from('bills')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingBill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      )
    }

    // Calculate taxes if total_amount or quantity changed
    let updateData: any = { ...body }
    if (body.total_amount !== undefined || body.quantity !== undefined) {
      const totalAmount = body.total_amount || existingBill.total_amount
      const quantity = body.quantity || existingBill.quantity
      
      const taxlessAmount = totalAmount / 1.28
      const taxAmount = taxlessAmount * 0.28
      const cgst = taxAmount / 2
      const sgst = taxAmount / 2
      
      updateData = {
        ...updateData,
        rate: Math.round((totalAmount / quantity) / 1.28),
        taxless_amount: Math.round(taxlessAmount),
        cgst_amount: Math.round(cgst),
        sgst_amount: Math.round(sgst),
        total_tax: Math.round(taxAmount),
      }
    }

    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update bill' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Bill updated successfully'
    })
  } catch (error) {
    console.error('Bill update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bills/[id] - Delete bill
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

    // Check if bill exists and belongs to user
    const { data: existingBill, error: checkError } = await supabase
      .from('bills')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingBill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete bill' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Bill deleted successfully'
    })
  } catch (error) {
    console.error('Bill deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}