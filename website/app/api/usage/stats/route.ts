import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get usage stats from user metadata
    const stats = user.publicMetadata?.usageStats || {
      todayBlocked: 0,
      weeklyBlocked: 0,
      mostBlockedCategory: 'None',
      lastUpdateDate: new Date().toISOString().split('T')[0],
      categoryStats: {}
    }

    return NextResponse.json({ 
      success: true, 
      stats: {
        todayBlocked: stats.todayBlocked || 0,
        weeklyBlocked: stats.weeklyBlocked || 0,
        mostBlockedCategory: stats.mostBlockedCategory || 'None'
      }
    })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}