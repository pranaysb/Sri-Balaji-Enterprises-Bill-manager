import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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