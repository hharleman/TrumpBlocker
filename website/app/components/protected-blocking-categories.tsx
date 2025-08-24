'use client'

import { useState } from 'react'
import { Switch } from '@/app/components/ui/switch'
import { Label } from '@/app/components/ui/label'
import { useLockdown } from './lockdown-context'

interface ProtectedSwitchProps {
  id: string
  label: string
  defaultChecked?: boolean
}

function ProtectedSwitch({ id, label, defaultChecked = false }: ProtectedSwitchProps) {
  const { verifyPin, blockingCategories, setBlockingCategories } = useLockdown()
  const checked = blockingCategories[id] ?? defaultChecked

  const handleChange = async (newChecked: boolean) => {
    const canChange = await verifyPin()
    if (canChange) {
      setBlockingCategories({
        ...blockingCategories,
        [id]: newChecked
      })
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={handleChange} />
    </div>
  )
}

export default function ProtectedBlockingCategories() {
  return (
    <div className="space-y-4">
      <ProtectedSwitch id="trump" label="Trump Content" defaultChecked />
      <ProtectedSwitch id="vance" label="JD Vance Content" defaultChecked />
      <ProtectedSwitch id="rightwing" label="Right Wing Influencers" defaultChecked />
      <ProtectedSwitch id="redpill" label="Red Pill Influencers" defaultChecked />
      <ProtectedSwitch id="foxnews" label="Fox News" defaultChecked />
      <ProtectedSwitch id="redpillcontent" label="Red Pill Content" defaultChecked />
    </div>
  )
}