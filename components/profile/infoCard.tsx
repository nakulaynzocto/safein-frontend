"use client"

import { memo, type ComponentType, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoRow } from "./infoRow"

interface InfoCardProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  fields: { label: string; value?: string | ReactNode }[]
}

export const InfoCard = memo(function InfoCard({
  icon: Icon,
  title,
  description,
  fields,
}: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f, i) => (
          <InfoRow key={i} label={f.label} value={typeof f.value === 'string' ? f.value : f.value as ReactNode} />
        ))}
      </CardContent>
    </Card>
  )
})
