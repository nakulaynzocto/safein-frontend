"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { routes } from "@/utils/routes"

/**
 * RouteOptimizer component to prefetch and optimize route transitions
 * This helps reduce navigation time by preloading data
 */
export function RouteOptimizer() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get all private routes dynamically from routes.ts
    const commonRoutes = [
      routes.privateroute.DASHBOARD,
      routes.privateroute.APPOINTMENTLIST,
      routes.privateroute.VISITORLIST,
      routes.privateroute.EMPLOYEELIST,
      routes.privateroute.NOTIFICATIONS,
      routes.privateroute.PROFILE,
    ]

    // Prefetch routes in the background
    commonRoutes.forEach((route) => {
      if (route !== pathname) {
        router.prefetch(route)
      }
    })
  }, [pathname, router])

  // Prefetch on hover for visible links
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target
      
      // Check if target is an Element (has closest method)
      if (!(target instanceof Element)) {
        return
      }
      
      const anchor = target.closest("a")
      
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href)
          const currentUrl = new URL(window.location.href)
          
          // Only prefetch internal links
          if (url.origin === currentUrl.origin) {
            router.prefetch(url.pathname)
          }
        } catch (error) {
          // Ignore invalid URLs
        }
      }
    }

    // Add event listeners for all links
    document.addEventListener("mouseenter", handleMouseEnter, true)

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, true)
    }
  }, [router])

  return null
}

