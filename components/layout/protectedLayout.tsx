"use client"
import { PageSkeleton } from "@/components/common/pageSkeleton"

import { type ReactNode } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"
import { useAppointmentSocket } from "@/hooks/useSocket"

interface ProtectedLayoutProps {
  children: ReactNode
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

  // 🔌 Initialize WebSocket for real-time appointment updates
  // Auto-connects when user is authenticated and auto-disconnects on logout
  useAppointmentSocket()

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Navbar variant="dashboard" />
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar if user has active subscription AND token */}
        {shouldShowSidebar && <Sidebar />}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-200"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 max-w-full">
            {isLoading ? (
              <PageSkeleton />
            ) : shouldShowContent ? (
              // Show content if conditions are met
              <div className="animate-fade-in" style={{ backgroundColor: 'var(--background)' }}>
                {children}
              </div>
            ) : (
              <PageSkeleton />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
