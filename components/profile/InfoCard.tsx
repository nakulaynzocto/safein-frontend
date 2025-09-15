"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoRow } from "./InfoRow"

export function InfoCard({
  icon: Icon,
  title,
  description,
  fields,
}: {
  icon: any
  title: string
  description: string
  fields: { label: string; value?: string }[]
}) {
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
          <InfoRow key={i} label={f.label} value={f.value} />
        ))}
      </CardContent>
    </Card>
  )
}
