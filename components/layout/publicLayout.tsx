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
      // Use replace for smoother navigation
      router.replace(routes.privateroute.DASHBOARD)
    }
  }, [isInitialized, isAuthenticated, token, router])

  // Don't return null - always show layout to prevent white screen during navigation
  // If authenticated, router.replace will handle redirect
  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-300" 
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Navbar />
      <main 
        className="flex-1 transition-opacity duration-300 ease-in-out" 
        style={{ backgroundColor: 'var(--background)' }}
      >
        {(!isClient || !isInitialized) ? (
          // Show loading state only during initial load
          <div 
            className="min-h-[60vh] animate-pulse opacity-50" 
            style={{ backgroundColor: 'var(--background)' }}
          />
        ) : isAuthenticated && token ? (
          // Show loading state while redirecting authenticated users
          <div 
            className="min-h-[60vh] animate-pulse opacity-50" 
            style={{ backgroundColor: 'var(--background)' }}
          />
        ) : (
          // Show content with smooth fade-in for unauthenticated users
          <div className="animate-fade-in transition-opacity duration-300" style={{ backgroundColor: 'var(--background)' }}>
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
