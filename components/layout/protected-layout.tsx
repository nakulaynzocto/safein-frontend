"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { useCheckCompanyExistsQuery } from "@/store/api/companyApi"
import { routes } from "@/utils/routes"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { LoadingSpinner } from "@/components/common/loading-spinner"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [shouldShowLayout, setShouldShowLayout] = useState(false)
  
  // Check company existence only if authenticated and not on company creation page
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const { data: companyCheck, isLoading: companyCheckLoading, error: companyCheckError } = useCheckCompanyExistsQuery(undefined, {
    skip: !isAuthenticated || !token || currentPath === routes.privateroute.COMPANYCREATE,
    // Add timeout to prevent hanging
    refetchOnMountOrArgChange: false,
  })

  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !token) {
      router.push(routes.publicroute.LOGIN)
    }
  }, [isInitialized, isAuthenticated, token, router])

  // Check company existence and redirect if needed
  useEffect(() => {
    if (isAuthenticated && token && !companyCheckLoading) {
      const currentPath = window.location.pathname
      
      // If company check succeeded
      if (companyCheck) {
        const companyExists = companyCheck.exists
        
        // STRICT PROTECTION: If company doesn't exist, ONLY allow /company/create
        if (!companyExists) {
          if (currentPath !== routes.privateroute.COMPANYCREATE) {
            router.push(routes.privateroute.COMPANYCREATE)
          }
          // Don't show layout when no company exists (company creation page is standalone)
          setShouldShowLayout(false)
        }
        // If company exists and user is on company creation page, redirect to dashboard
        else if (companyExists && currentPath === routes.privateroute.COMPANYCREATE) {
          router.push(routes.privateroute.DASHBOARD)
        } else {
          // Company exists and user is on a valid route - show full layout
          setShouldShowLayout(true)
        }
      }
      // If company check failed (error), assume company doesn't exist and STRICTLY redirect
      else if (companyCheckError) {
        if (currentPath !== routes.privateroute.COMPANYCREATE) {
          router.push(routes.privateroute.COMPANYCREATE)
        }
        // Don't show layout when company check fails (company creation page is standalone)
        setShouldShowLayout(false)
      }
    }
  }, [isAuthenticated, token, companyCheck, companyCheckLoading, companyCheckError, router])

  // Skip company check loading for company creation page or when there's an error
  // Also skip if we're on company creation page
  const shouldShowCompanyCheckLoading = companyCheckLoading && currentPath !== routes.privateroute.COMPANYCREATE && !companyCheckError
  

  // Show loading during hydration and auth initialization
  if (!isClient || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show loading while checking company existence (except on company creation page)
  if (shouldShowCompanyCheckLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render layout if we shouldn't show it (waiting for company check or redirecting)
  if (!shouldShowLayout) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
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
