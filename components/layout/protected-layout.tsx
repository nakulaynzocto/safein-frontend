"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { LoadingSpinner } from "@/components/common/loading-spinner"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push("/login")
  //   }
  // }, [isAuthenticated, isLoading, router])

  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <LoadingSpinner size="lg" />
  //     </div>
  //   )
  // }

  // if (!isAuthenticated) {
  //   return null
  // }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
