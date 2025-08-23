import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Same hash function as in parental-controls
function hashPin(pin: string, userId: string): string {
  const combined = `${pin}_${userId}_salt`
  return btoa(combined)
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pin } = await req.json()

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    const parentalControls = user.publicMetadata?.parentalControls || {}
    
    if (!parentalControls.isEnabled) {
      return NextResponse.json({ 
        success: true, 
        message: 'Parental controls not enabled' 
      })
    }

    const hashedPin = hashPin(pin, user.id)
    const isValid = hashedPin === parentalControls.hashedPin

    if (isValid) {
      return NextResponse.json({ 
        success: true, 
        message: 'PIN verified successfully' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Incorrect PIN' 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}