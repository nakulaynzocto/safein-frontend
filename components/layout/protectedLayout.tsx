"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { LoadingSpinner } from "@/components/common/loadingSpinner"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Current path
  const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

  // Initialize authentication
  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !token) {
      router.push(routes.publicroute.LOGIN)
    }
  }, [isInitialized, isAuthenticated, token, router])


  // ====== Render Logic ======

  // Hydration/auth initialization
  if (!isClient || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Not authenticated → redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }



  // Default Layout
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
