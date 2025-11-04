"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"
import { Navbar } from "./navbar"
import { Footer } from "./footer"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
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
    if (isInitialized && isAuthenticated && token) {
      router.push(routes.privateroute.DASHBOARD)
    }
  }, [isInitialized, isAuthenticated, token, router])

  // Don't return null - always show layout to prevent white screen during navigation
  // If authenticated, router.push will handle redirect
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {(!isClient || !isInitialized || isAuthenticated) ? (
          // Minimal placeholder during auth check - prevents white screen
          <div className="min-h-[60vh]" />
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  )
}
