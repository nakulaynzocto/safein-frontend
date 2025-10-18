"use client"

import { useEffect } from "react"
import NProgress from "nprogress"

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08,
      easing: 'ease',
      speed: 500,
    })

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

    // Intercept router.push calls
    const handleBeforeUnload = () => {
      NProgress.start()
    }

    document.addEventListener("click", handleClick)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("click", handleClick)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return <>{children}</>
}

