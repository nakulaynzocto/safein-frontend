"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import NProgress from "nprogress"

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08,
      easing: 'ease',
      speed: 300,
    })
  }, [])

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      NProgress.start()
      
      const timer = setTimeout(() => {
        NProgress.done()
        previousPathname.current = pathname
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target
      
      if (!(target instanceof Element)) {
        return
      }
      
      const anchor = target.closest("a")
      
      if (anchor && anchor.href && !anchor.target && !anchor.download) {
        try {
          const url = new URL(anchor.href)
          const currentUrl = new URL(window.location.href)
          
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            NProgress.start()
          }
        } catch (error) {
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

