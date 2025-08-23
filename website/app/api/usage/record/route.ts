import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { blockedCount, category } = await req.json()

    // Get current usage stats from user metadata
    const currentStats = user.publicMetadata?.usageStats || {
      todayBlocked: 0,
      weeklyBlocked: 0,
      lastUpdateDate: new Date().toISOString().split('T')[0],
      categoryStats: {}
    }

    const today = new Date().toISOString().split('T')[0]
    const currentWeek = getWeekNumber(new Date())
    const lastWeek = currentStats.lastWeek || currentWeek

    // Reset daily/weekly counters if needed
    if (currentStats.lastUpdateDate !== today) {
      currentStats.todayBlocked = 0
      currentStats.lastUpdateDate = today
    }

    if (lastWeek !== currentWeek) {
      currentStats.weeklyBlocked = 0
      currentStats.lastWeek = currentWeek
    }

    // Update counters
    currentStats.todayBlocked += blockedCount || 1
    currentStats.weeklyBlocked += blockedCount || 1

    // Update category stats
    if (category) {
      currentStats.categoryStats[category] = (currentStats.categoryStats[category] || 0) + (blockedCount || 1)
    }

    // Find most blocked category
    const mostBlockedCategory = Object.entries(currentStats.categoryStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None'

    currentStats.mostBlockedCategory = mostBlockedCategory

    // Update user metadata
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        usageStats: currentStats
      }
    })

    return NextResponse.json({ 
      success: true, 
      stats: currentStats 
    })
  } catch (error) {
    console.error('Error recording usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}