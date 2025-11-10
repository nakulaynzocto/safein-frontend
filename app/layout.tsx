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
import { PageTransition } from "@/components/common/pageTransition"

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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/aynzo-logo.png" />
      </head>
      <body className="font-sans" style={{ backgroundColor: 'var(--background)' }}>
        {/* Navigation Progress Bar - wrapped in Suspense */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        
        {/* Route Optimizer for faster navigation */}
        <RouteOptimizer />
        
        {/* Wrapped children with Error Boundary, Redux Provider and Suspense boundary */}
        <ErrorBoundary>
          <NavigationProgressProvider>
            <Providers>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="animate-spin">
                    <div className="h-8 w-8 border-4 border-[#3882a5] border-t-transparent rounded-full"></div>
                  </div>
                </div>
              }>
                <PageTransition>
                  {children}
                </PageTransition>
              </Suspense>
            </Providers>
          </NavigationProgressProvider>
        </ErrorBoundary>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
