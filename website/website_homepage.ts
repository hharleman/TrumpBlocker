// app/page.tsx
import { SignInButton, SignUpButton, UserButton, currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Chrome, Zap, Users } from 'lucide-react'

export default async function HomePage() {
  const user = await currentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🚫</div>
          <h1 className="text-2xl font-bold text-white">Trump Blocker</h1>
        </div>
        <div className="flex space-x-4">
          <SignInButton mode="modal">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              Get Started
            </Button>
          </SignUpButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Clean Up Your<br />Internet Experience
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Block unwanted political content across the web with our powerful Chrome extension. 
            Take control of your browsing experience today.
          </p>
          
          {/* Trump Image Placeholder */}
          <div className="w-64 h-64 mx-auto mb-8 bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
            <div className="text-white/60 text-lg">Trump Image Placeholder</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4">
                Get Started Free
              </Button>
            </SignUpButton>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-4"
              onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
            >
              <Chrome className="mr-2 h-5 w-5" />
              Download Extension
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="card-gradient text-white border-white/10">
            <CardHeader>
              <Shield className="h-12 w-12 mb-4 text-white" />
              <CardTitle>Smart Filtering</CardTitle>
              <CardDescription className="text-white/70">
                Advanced keyword detection blocks unwanted content automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient text-white border-white/10">
            <CardHeader>
              <Chrome className="h-12 w-12 mb-4 text-white" />
              <CardTitle>Chrome Extension</CardTitle>
              <CardDescription className="text-white/70">
                Seamless integration with your browser for effortless blocking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient text-white border-white/10">
            <CardHeader>
              <Zap className="h-12 w-12 mb-4 text-white" />
              <CardTitle>Custom Keywords</CardTitle>
              <CardDescription className="text-white/70">
                Premium users can add up to 20 custom keywords for personalized filtering
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient text-white border-white/10">
            <CardHeader>
              <Users className="h-12 w-12 mb-4 text-white" />
              <CardTitle>Parental Controls</CardTitle>
              <CardDescription className="text-white/70">
                2FA protection prevents children from disabling the extension
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">Simple Pricing</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="card-gradient text-white border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription className="text-white/70">
                  Perfect for getting started
                </CardDescription>
                <div className="text-4xl font-bold mt-4">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Block 6 predefined categories
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Works on all websites
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Email filtering support
                  </li>
                </ul>
                <SignUpButton mode="modal">
                  <Button className="w-full mt-6 bg-white text-purple-600 hover:bg-gray-100">
                    Get Started Free
                  </Button>
                </SignUpButton>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="card-gradient text-white border-white/10 ring-2 ring-yellow-400">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  Premium 
                  <span className="ml-2 text-yellow-400">⭐</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Advanced features for power users
                </CardDescription>
                <div className="text-4xl font-bold mt-4">
                  $2<span className="text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Everything in Free
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Up to 20 custom keywords
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    2FA parental controls
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Multiple device management
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <SignUpButton mode="modal">
                  <Button className="w-full mt-6 bg-yellow-400 text-black hover:bg-yellow-300">
                    Start Premium Trial
                  </Button>
                </SignUpButton>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="text-center">
          <Card className="card-gradient text-white border-white/10 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Your Privacy Matters</CardTitle>
              <CardDescription className="text-white/70">
                We take your privacy seriously. Your data is never sold or shared with third parties.
                All filtering happens locally in your browser for maximum privacy and security.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-white/60 border-t border-white/10">
        <p>&copy; 2024 Trump Blocker. All rights reserved. Made with ❤️ for a cleaner internet.</p>
      </footer>
    </div>
  )
}