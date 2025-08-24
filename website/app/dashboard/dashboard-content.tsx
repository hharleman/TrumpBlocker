'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Chrome, Shield, Zap, Users, Download, Save } from 'lucide-react'
import BillingSection from '@/app/components/billing-section'
import UpgradeButton from '@/app/components/upgrade-button'
import PinProtectedToggle from '@/app/components/pin-protected-toggle'
import CustomKeywordsToggle from '@/app/components/custom-keywords-toggle'
import ProtectedBlockingCategories from '@/app/components/protected-blocking-categories'
import { LockdownProvider } from '@/app/components/lockdown-context'
import SaveSettingsButton from '@/app/components/save-settings-button'

interface DashboardContentProps {
  isPremium: boolean
  stats: {
    today: number
    week: number
    topCategory: string
  }
}

export default function DashboardContent({ isPremium, stats }: DashboardContentProps) {
  return (
    <LockdownProvider>
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Chrome className="h-5 w-5" />
                  Extension Status
                </CardTitle>
                <CardDescription>
                  Download and install the Chrome extension to start blocking content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Not Installed</span>
                  </div>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download Extension
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Blocking Categories
                </CardTitle>
                <CardDescription>
                  Choose which types of content to block across the web
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProtectedBlockingCategories />
              </CardContent>
            </Card>

            {/* Custom Keywords: free users see a disabled card */}
            <Card className={isPremium ? '' : 'opacity-50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Custom Keywords
                  {!isPremium && <Badge variant="secondary">Premium</Badge>}
                </CardTitle>
                <CardDescription>
                  Add your own custom keywords to block (up to 100)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomKeywordsToggle isPremium={isPremium} />
              </CardContent>
            </Card>

            {/* PIN Protected Controls gated by premium tier */}
            <Card className={isPremium ? '' : 'opacity-50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  PIN Protected
                  {!isPremium && <Badge variant="secondary">Premium</Badge>}
                </CardTitle>
                <CardDescription>
                  Require a 6-digit PIN to modify extension settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PinProtectedToggle isPremium={isPremium} />
                <p className="text-sm text-gray-500 mt-2">
                  When enabled, changes to extension settings will require a 6-digit PIN
                </p>
              </CardContent>
            </Card>

            {/* Billing section placed directly below Parental Controls */}
            <BillingSection isPremium={isPremium} />
          </div>

          <div className="space-y-6">
            {!isPremium ? (
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">
                    🌟 Upgrade to Premium
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Unlock advanced features for better control
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Up to 100 custom keywords
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      PIN protected controls
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Priority support
                    </li>
                  </ul>
                  <div className="flex flex-col gap-2">
                    <a href="https://buy.stripe.com/test_7sYaEWePM80j7wv0jG7IY00" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                        Monthly - $2/month
                      </Button>
                    </a>
                    <a href="https://buy.stripe.com/test_14A7sK6jg5Sb4kjgiE7IY01" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                        Annual - $20/year (Save $4!)
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    ✅ Your Premium Subscription is Active
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    You have access to all premium features
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Add upgrade prompt above Usage Statistics for free users */}
            {!isPremium && (
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">
                    🚀 Upgrade to Premium Today!
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Get unlimited custom keywords and PIN protection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <a href="https://buy.stripe.com/test_7sYaEWePM80j7wv0jG7IY00" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                        Start Premium - $2/month
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <span className="font-bold text-2xl text-red-600">{stats.today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Blocked This Week</span>
                  <span className="font-bold text-lg text-gray-800">{stats.week}</span>
                </div>
                {stats.topCategory && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Blocked Category</span>
                    <span className="font-medium text-gray-800">{stats.topCategory}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <SaveSettingsButton />
          </div>
        </div>
      </main>
    </LockdownProvider>
  )
}