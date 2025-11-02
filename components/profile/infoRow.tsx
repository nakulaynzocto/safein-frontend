"use client"

import React from "react"

interface InfoRowProps {
  label: string
  value?: string | React.ReactNode
}

export const InfoRow = React.memo(function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="text-sm">{value}</div>
    </div>
  )
})

