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
  const [shouldShowLayout, setShouldShowLayout] = useState(true)

  // Current path
  const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

  // API to check if company exists
  const {
    data: companyCheck,
    isLoading: companyCheckLoading,
    error: companyCheckError,
  } = useCheckCompanyExistsQuery(undefined, {
    skip: !isAuthenticated || !token || currentPath === routes.privateroute.COMPANYCREATE,
    refetchOnMountOrArgChange: false,
  })

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

  // Check company existence and handle redirects
  useEffect(() => {
    if (isAuthenticated && token && !companyCheckLoading) {
      const path = window.location.pathname

      if (companyCheck) {
        const companyExists = companyCheck.exists

        // STRICT: If company does not exist → only allow /company/create
        if (!companyExists) {
          if (path !== routes.privateroute.COMPANYCREATE) {
            router.push(routes.privateroute.COMPANYCREATE)
          }
          setShouldShowLayout(false)
        }
        // If company exists but user is on /company/create → redirect to dashboard
        else if (companyExists && path === routes.privateroute.COMPANYCREATE) {
          router.push(routes.privateroute.DASHBOARD)
          setShouldShowLayout(true)
        } else {
          // Normal case → company exists and valid route
          setShouldShowLayout(true)
        }
      }
      // If API error → treat as "no company" and force /company/create
      else if (companyCheckError) {
        if (path !== routes.privateroute.COMPANYCREATE) {
          router.push(routes.privateroute.COMPANYCREATE)
        }
        setShouldShowLayout(false)
      }
    }
  }, [isAuthenticated, token, companyCheck, companyCheckLoading, companyCheckError, router])

  // Show spinner during company check loading (except on /company/create)
  const shouldShowCompanyCheckLoading =
    companyCheckLoading &&
    currentPath !== routes.privateroute.COMPANYCREATE &&
    !companyCheckError

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

  // Company existence check loading
  if (shouldShowCompanyCheckLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If layout should not show (e.g., company create page)
  if (!shouldShowLayout) {
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
