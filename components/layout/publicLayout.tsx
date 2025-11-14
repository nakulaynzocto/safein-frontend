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
      router.replace(routes.privateroute.DASHBOARD)
    }
  }, [isInitialized, isAuthenticated, token, router])

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-300" 
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Navbar />
      <main 
        className="flex-1 transition-opacity duration-300 ease-in-out" 
        style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 200px)' }}
      >
        {(!isClient || !isInitialized) ? (
          <div 
            className="min-h-[60vh] animate-pulse opacity-50" 
            style={{ backgroundColor: 'var(--background)' }}
          />
        ) : isAuthenticated && token ? (
          <div 
            className="min-h-[60vh] animate-pulse opacity-50" 
            style={{ backgroundColor: 'var(--background)' }}
          />
        ) : (
          <div style={{ backgroundColor: 'var(--background)', minHeight: '100%' }}>
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
