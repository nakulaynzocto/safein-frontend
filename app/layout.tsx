import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/common/error-boundary"

export const metadata: Metadata = {
  title: "Gatekeeper - Visitor Appointment System",
  description: "Professional visitor appointment management system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Wrapped children with Error Boundary, Redux Provider and Suspense boundary */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Providers>{children}</Providers>
          </Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
