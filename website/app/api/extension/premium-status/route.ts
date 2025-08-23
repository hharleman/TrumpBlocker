import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isPremium = user.publicMetadata?.isPremium === true
    const parentalControls = user.publicMetadata?.parentalControls || {}

    return NextResponse.json({ 
      success: true, 
      isPremium,
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      parentalControls: {
        isEnabled: parentalControls.isEnabled || false
      }
    })
  } catch (error) {
    console.error('Error checking premium status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}