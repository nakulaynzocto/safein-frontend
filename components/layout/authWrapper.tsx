"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

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

  // Don't return null - always render children to prevent white screen
  // If not authenticated, router.push will handle redirect
  // Show minimal placeholder during initialization/auth check
  if (!isClient || !isInitialized || !isAuthenticated || !token) {
    return <div className="min-h-[60vh]" />
  }

  return <>{children}</>
}
