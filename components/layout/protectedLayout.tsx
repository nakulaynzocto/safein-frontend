"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const shouldHideSidebar = pathname === routes.privateroute.NOTIFICATIONS

  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !token) {
      router.replace(routes.publicroute.LOGIN)
    }
  }, [isInitialized, isAuthenticated, token, router])

  // Don't return null - always show layout to prevent white screen during navigation
  // If not authenticated, router.replace will handle redirect
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {!shouldHideSidebar && (
          <div className="hidden md:block flex-shrink-0">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 md:p-6">
            {(!isClient || !isInitialized || !isAuthenticated || !token) ? (
              // Minimal placeholder during auth check - prevents white screen
              <div className="min-h-[60vh]" />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
