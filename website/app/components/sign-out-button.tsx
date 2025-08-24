'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <Button 
      onClick={handleSignOut}
      variant="outline"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  )
}