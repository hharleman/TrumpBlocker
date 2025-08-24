import { NextResponse } from 'next/server'

// Dynamic usage stats that simulate realistic blocking activity
export async function GET() {
  // Generate realistic daily stats based on current time
  const now = new Date()
  const hour = now.getHours()
  
  // More blocking during peak hours (9am-11pm)
  const peakMultiplier = hour >= 9 && hour <= 23 ? 1.5 : 0.5
  const baseDaily = Math.floor(Math.random() * 20 + 15) // 15-35 base
  const todayBlocked = Math.floor(baseDaily * peakMultiplier)
  
  // Weekly stats (today + previous 6 days)
  const weeklyBase = todayBlocked * 7 + Math.floor(Math.random() * 50)
  
  // Rotate through different top categories
  const categories = ['Trump Content', 'Political Posts', 'Fox News', 'Red Pill Content', 'Right Wing Influencers']
  const topCategory = categories[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % categories.length]
  
  return NextResponse.json({
    today: todayBlocked,
    week: weeklyBase,
    topCategory: todayBlocked > 0 ? topCategory : '',
    totalAllTime: weeklyBase * 4 + Math.floor(Math.random() * 100),
    lastUpdated: now.toISOString()
  })
}
