// website/app/api/extension/validate/route.ts - Validate extension requests
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Validate that the request is coming from your extension
    const origin = req.headers.get('origin')
    const userAgent = req.headers.get('user-agent')
    
    // Check if request is from Chrome extension
    if (!userAgent?.includes('Chrome') || !origin?.startsWith('chrome-extension://')) {
      return NextResponse.json({ error: 'Invalid request source' }, { status: 403 })
    }

    // Additional validation...
    const { extensionId, version } = await req.json()
    
    // Validate extension ID matches your published extension
    if (extensionId !== process.env.CHROME_EXTENSION_ID) {
      return NextResponse.json({ error: 'Invalid extension' }, { status: 403 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }
}