// app/dashboard/page.tsx
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <DashboardClient user={user} />
}