import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Shield, Chrome, Zap, Users } from 'lucide-react'

export default async function HomePage() {
  const user = await currentUser()
  return (
    <div className="min-h-screen gradient-bg">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Trump Blocker Logo" className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-gray-800">Trump Blocker</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-red-600 text-white hover:bg-red-700">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <SignInButton mode="modal" redirectUrl="/dashboard">
              <Button className="bg-red-600 text-white hover:bg-red-700">
                Go to Dashboard
              </Button>
            </SignInButton>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Clean Up Your Internet Experience
          </h2>
          <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
            Block unwanted political content across the web with our powerful Chrome extension.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center bg-white/70 rounded-full px-4 py-2 text-gray-800">
              <span className="mr-2">🚫</span>
              Donald Trump
            </div>
            <div className="flex items-center bg-white/70 rounded-full px-4 py-2 text-gray-800">
              <span className="mr-2">🚫</span>
              JD Vance
            </div>
            <div className="flex items-center bg-white/70 rounded-full px-4 py-2 text-gray-800">
              <span className="mr-2">🚫</span>
              Fox News
            </div>
            <div className="flex items-center bg-white/70 rounded-full px-4 py-2 text-gray-800">
              <span className="mr-2">🚫</span>
              Far Right Influencers
            </div>
            <div className="flex items-center bg-white/70 rounded-full px-4 py-2 text-gray-800">
              <span className="mr-2">🚫</span>
              Red Pill Content
            </div>
          </div>
          
          <div className="w-[768px] h-[432px] mx-auto mb-8 rounded-lg overflow-hidden shadow-lg max-w-full">
            <iframe 
              width="768" 
              height="432" 
              src="https://www.youtube.com/embed/rg18Kf4en2o" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-red-600 text-white hover:bg-red-700 text-lg px-8 py-4">
                Get Started Free
              </Button>
            </SignUpButton>
            <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-blue-800 text-white hover:bg-blue-900 text-lg px-8 py-4">
                <Chrome className="mr-2 h-5 w-5" />
                Download Extension
              </Button>
            </a>
          </div>
          
          <div className="flex justify-center space-x-6">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="card-gradient text-gray-800 border-gray-200">
            <CardHeader>
              <Shield className="h-12 w-12 mb-4 text-gray-800" />
              <CardTitle>Smart Filtering</CardTitle>
              <CardDescription className="text-gray-600">
                Advanced keyword detection blocks unwanted content automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient text-gray-800 border-gray-200">
            <CardHeader>
              <Chrome className="h-12 w-12 mb-4 text-gray-800" />
              <CardTitle>Chrome Extension</CardTitle>
              <CardDescription className="text-gray-600">
                Seamless integration with your browser for effortless blocking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient text-gray-800 border-gray-200">
            <CardHeader>
              <Zap className="h-12 w-12 mb-4 text-gray-800" />
              <CardTitle>Custom Keywords</CardTitle>
              <CardDescription className="text-gray-600">
                Premium users can add up to 100 custom keywords for personalized filtering
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient text-gray-800 border-gray-200">
            <CardHeader>
              <Users className="h-12 w-12 mb-4 text-gray-800" />
              <CardTitle>Parental Controls</CardTitle>
              <CardDescription className="text-gray-600">
                2FA protection prevents children from disabling the extension
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Simple Pricing</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="card-gradient text-gray-800 border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription className="text-gray-600">
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
                  <Button className="w-full mt-6 bg-red-600 text-white hover:bg-red-700">
                    Get Started Free
                  </Button>
                </SignUpButton>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="card-gradient text-gray-800 border-gray-200 ring-2 ring-yellow-400">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  Premium 
                  <span className="ml-2 text-yellow-400">⭐</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
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
                    Up to 100 custom keywords
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    2FA parental controls
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <SignUpButton mode="modal">
                  <Button className="w-full mt-6 bg-red-600 text-white hover:bg-red-700">
                    Start Premium Trial
                  </Button>
                </SignUpButton>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="text-center">
          <Card className="card-gradient text-gray-800 border-gray-200 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Your Privacy Matters</CardTitle>
              <CardDescription className="text-gray-600">
                We take your privacy seriously. Your data is never sold or shared with third parties.
                All filtering happens locally in your browser for maximum privacy and security.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2024 Trump Blocker. Made with ❤️. All rights reserved.</p>
      </footer>
    </div>
  )
}