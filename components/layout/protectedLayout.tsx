"use client"

import type React from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Use centralized hook for all auth and subscription logic
  const {
    isClient,
    isInitialized,
    isAuthenticated,
    token,
    shouldShowSidebar,
    shouldShowContent,
    isLoading,
    isCurrentRoutePrivate,
    isSubscriptionPage,
    hasActiveSubscription,
  } = useAuthSubscription()

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden" 
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar if user has active subscription AND token */}
        {shouldShowSidebar && (
          <div className="hidden md:block flex-shrink-0">
            <Sidebar />
          </div>
        )}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-200" 
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-5 md:p-6 max-w-full">
            {isLoading ? (
              // Show loading state
              <div 
                className="min-h-[60vh] animate-pulse opacity-50" 
                style={{ backgroundColor: 'var(--background)' }}
              />
            ) : shouldShowContent ? (
              // Show content if conditions are met
              <div className="animate-fade-in" style={{ backgroundColor: 'var(--background)' }}>
                {children}
              </div>
            ) : (
              // Default: show loading
              <div 
                className="min-h-[60vh] animate-pulse opacity-50" 
                style={{ backgroundColor: 'var(--background)' }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
