"use client"

import type React from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  // Use centralized hook for all auth and subscription logic
  const {
    isClient,
    isInitialized,
    isAuthenticated,
    token,
    isAllowedPageForAuthenticated,
  } = useAuthSubscription()

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-300" 
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Navbar />
      <main 
        className="flex-1 transition-opacity duration-300 ease-in-out" 
        style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 200px)' }}
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
      <Footer />
    </div>
  )
}
