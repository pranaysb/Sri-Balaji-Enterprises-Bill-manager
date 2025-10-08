import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'

export const getAuthUserId = async (): Promise<string | null> => {
  try {
    const { userId } = await auth()
    return userId
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export const validateRequest = async (request: NextRequest): Promise<string | null> => {
  const userId = await getAuthUserId()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}