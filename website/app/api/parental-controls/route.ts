import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Simple hash function for PIN storage
function hashPin(pin: string, userId: string): string {
  // In production, use a proper hashing library like bcrypt
  // This is a simple hash for demo purposes
  const combined = `${pin}_${userId}_salt`
  return btoa(combined)
}

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parentalControls = user.publicMetadata?.parentalControls || {}

    return NextResponse.json({ 
      isEnabled: parentalControls.isEnabled || false,
      // Never return the actual PIN
    })
  } catch (error) {
    console.error('Error getting parental controls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isEnabled, pin } = await req.json()

    if (!user.publicMetadata?.isPremium) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    // Validate PIN if enabling
    if (isEnabled && (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin))) {
      return NextResponse.json({ error: 'Valid 6-digit PIN required' }, { status: 400 })
    }

    const parentalControls = {
      isEnabled,
      hashedPin: isEnabled ? hashPin(pin, user.id) : null,
      updatedAt: new Date().toISOString()
    }

    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        parentalControls
      }
    })

    return NextResponse.json({ 
      success: true,
      isEnabled
    })
  } catch (error) {
    console.error('Error updating parental controls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}