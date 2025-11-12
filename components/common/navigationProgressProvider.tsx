"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import NProgress from "nprogress"

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08,
      easing: 'ease',
      speed: 300,
    })
  }, [])

  useEffect(() => {
    // Detect pathname changes
    if (previousPathname.current !== pathname) {
      // Pathname changed, navigation is happening
      NProgress.start()
      
      // Complete progress after a short delay
      const timer = setTimeout(() => {
        NProgress.done()
        previousPathname.current = pathname
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  useEffect(() => {
    // Intercept all link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target
      
      // Check if target is an Element (has closest method)
      if (!(target instanceof Element)) {
        return
      }
      
      const anchor = target.closest("a")
      
      if (anchor && anchor.href && !anchor.target && !anchor.download) {
        try {
          const url = new URL(anchor.href)
          const currentUrl = new URL(window.location.href)
          
          // Only show progress for internal navigation
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            NProgress.start()
          }
        } catch (error) {
          // Ignore invalid URLs
        }
      }
    }

    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [])

  return <>{children}</>
}

