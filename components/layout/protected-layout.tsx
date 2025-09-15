"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { LoadingSpinner } from "@/components/common/loading-spinner"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push("/login")
    }
  }, [isClient, isAuthenticated, router])

  // Show loading during hydration
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Fixed and stable */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>
        {/* Main content area - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
