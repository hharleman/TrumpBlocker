'use client'

import { SignOutButton } from '@clerk/nextjs'
import { Button } from './button'
import { LogOut } from 'lucide-react'

export function SignOutButtonComponent() {
  return (
    <SignOutButton redirectUrl="/">
      <Button variant="outline" className="flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </SignOutButton>
  )
}