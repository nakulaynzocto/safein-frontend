"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname()
  
  // Use centralized hook for all auth and subscription logic
  const {
    isClient,
    isInitialized,
    isAuthenticated,
    token,
    isAllowedPageForAuthenticated,
  } = useAuthSubscription()

  // Define auth routes where navbar and footer should be hidden
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  
  // Dynamically check if current route is an auth route
  const shouldHideNavbar = authRoutes.includes(pathname)
  const shouldHideFooter = authRoutes.includes(pathname)

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-300" 
      style={{ backgroundColor: 'var(--background)' }}
    >
      {!shouldHideNavbar && <Navbar />}
      <main 
        className="flex-1 transition-opacity duration-300 ease-in-out" 
        style={{ backgroundColor: 'var(--background)', minHeight: shouldHideNavbar ? '100vh' : 'calc(100vh - 200px)' }}
      >
        {(!isClient || !isInitialized) ? (
          <div 
            className="min-h-[60vh] animate-pulse opacity-50" 
            style={{ backgroundColor: 'var(--background)' }}
          />
        ) : isAuthenticated && token && !isAllowedPageForAuthenticated ? (
          // Show loading for authenticated users on pages they shouldn't access (they should be redirected)
          <div 
            className="min-h-[60vh] animate-pulse opacity-50" 
            style={{ backgroundColor: 'var(--background)' }}
          />
        ) : (
          // Show content for: unauthenticated users OR allowed pages (even if authenticated)
          <div style={{ backgroundColor: 'var(--background)', minHeight: '100%' }}>
            {children}
          </div>
        )}
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  )
}
