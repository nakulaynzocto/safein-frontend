"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { RegisterForm } from "@/components/auth/registerForm"
import { PublicLayout } from "@/components/layout/publicLayout"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { routes } from "@/utils/routes"

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize authentication
  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated && token) {
      router.push(routes.privateroute.DASHBOARD)
    }
  }, [isInitialized, isAuthenticated, token, router])

  // Show loading during hydration and auth initialization
  if (!isClient || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show loading if user is authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 overflow-hidden">
        <RegisterForm />
      </div>
    </PublicLayout>
  )
}
