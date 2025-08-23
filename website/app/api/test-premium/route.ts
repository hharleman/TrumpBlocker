import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Temporary endpoint for testing premium features
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Manually set user as premium for testing
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        isPremium: true,
        stripeCustomerId: 'test_customer',
        subscriptionId: 'test_subscription',
        subscriptionDate: new Date().toISOString(),
        testMode: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'User upgraded to premium (test mode)' 
    })
  } catch (error) {
    console.error('Error upgrading user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}