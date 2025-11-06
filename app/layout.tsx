import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/common/errorBoundary"
import { NavigationProgress } from "@/components/common/navigationProgress"
import { NavigationProgressProvider } from "@/components/common/navigationProgressProvider"
import { RouteOptimizer } from "@/components/common/routeOptimizer"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "SafeIn - SafeIn Appointment System",
  description: "Professional SafeIn appointment management system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/aynzo-logo.png" />
      </head>
      <body className="font-sans">
        {/* Navigation Progress Bar - wrapped in Suspense */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        
        {/* Route Optimizer for faster navigation */}
        <RouteOptimizer />
        
        {/* Wrapped children with Error Boundary, Redux Provider and Suspense boundary */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <NavigationProgressProvider>
              <Providers>{children}</Providers>
            </NavigationProgressProvider>
          </Suspense>
        </ErrorBoundary>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
