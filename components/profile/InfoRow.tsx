"use client"

export function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <p className="text-sm">{value}</p>
    </div>
  )
}

