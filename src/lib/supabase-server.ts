import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Server-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
}

// Server-side Supabase client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to get Supabase client for authenticated users
export async function getSupabaseClient() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return supabase
}