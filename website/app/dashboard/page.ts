// app/dashboard/page.tsx
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Chrome, Shield, Zap, Users, Settings, Download } from 'lucide-react'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🚫</div>
            <h1 className="text-xl font-bold text-gray-900">Trump Blocker Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Free Plan
            </Badge>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Extension Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extension Status */}
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

            {/* Blocking Categories */}
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
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trump">Trump Content</Label>
                  <Switch id="trump" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vance">Vance Content</Label>
                  <Switch id="vance" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="rightwing">Right Wing Content</Label>
                  <Switch id="rightwing" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="redpill">Red Pill Content</Label>
                  <Switch id="redpill" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="foxnews">Fox News</Label>
                  <Switch id="foxnews" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="redpillcontent">Red Pill Ideology</Label>
                  <Switch id="redpillcontent" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Custom Keywords (Premium) */}
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Custom Keywords
                  <Badge variant="secondary">Premium</Badge>
                </CardTitle>
                <CardDescription>
                  Add your own custom keywords to block (up to 20)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter custom keywords separated by commas..."
                  disabled
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-2">0/20 keywords</p>
              </CardContent>
            </Card>

            {/* Parental Controls (Premium) */}
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parental Controls
                  <Badge variant="secondary">Premium</Badge>
                </CardTitle>
                <CardDescription>
                  Require 2FA authentication to modify extension settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="parental">Enable 2FA Protection</Label>
                  <Switch id="parental" disabled />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  When enabled, changes to extension settings will require email verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upgrade & Stats */}
          <div className="space-y-6">
            {/* Upgrade Card */}
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
                    Up to 20 custom keywords
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    2FA parental controls
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Multiple device sync
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-