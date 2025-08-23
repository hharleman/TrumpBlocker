'use client'

import { useUser } from '@clerk/nextjs'
import { Button } from './button'

export function DashboardButton() {
  const { isSignedIn, isLoaded } = useUser()

  const handleClick = () => {
    if (isSignedIn) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/sign-in'
    }
  }

  if (!isLoaded) {
    return (
      <Button className="bg-red-600 text-white hover:bg-red-700" disabled>
        Loading...
      </Button>
    )
  }

  return (
    <Button 
      className="bg-red-600 text-white hover:bg-red-700"
      onClick={handleClick}
    >
      Go to Dashboard
    </Button>
  )
}