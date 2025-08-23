'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface UsageStats {
  todayBlocked: number
  weeklyBlocked: number
  mostBlockedCategory: string
}

export function UsageStatistics() {
  const [stats, setStats] = useState<UsageStats>({
    todayBlocked: 0,
    weeklyBlocked: 0,
    mostBlockedCategory: 'Loading...'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/usage/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Loading your content blocking activity...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>
          Track your content blocking activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Content Blocked Today</span>
          <span className="font-bold text-2xl text-red-600">{stats.todayBlocked}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Blocked This Week</span>
          <span className="font-bold text-lg text-gray-800">{stats.weeklyBlocked}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Most Blocked Category</span>
          <span className="font-medium text-gray-800">{stats.mostBlockedCategory}</span>
        </div>
        {stats.todayBlocked === 0 && stats.weeklyBlocked === 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              No activity detected. Install and activate the Chrome extension to start tracking blocked content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}