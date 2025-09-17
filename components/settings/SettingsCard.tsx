"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SettingsCardProps {
  icon?: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  )
}

