"use client"

import { useEffect, useState, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"

/**
 * PageTransition component to prevent white screen during navigation
 * Keeps previous content visible until new page is ready
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousPathname = useRef(pathname)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // When pathname changes, start transition
    if (previousPathname.current !== pathname) {
      // Keep previous content visible during transition
      setIsTransitioning(true)
      
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      
      // Update content after a short delay to ensure smooth transition
      // This prevents white screen by keeping old content visible
      transitionTimeoutRef.current = setTimeout(() => {
        setDisplayChildren(children)
        setIsTransitioning(false)
        previousPathname.current = pathname
        transitionTimeoutRef.current = null
      }, 100) // Increased delay to ensure new page is ready

      return () => {
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
          transitionTimeoutRef.current = null
        }
      }
    } else {
      // Pathname hasn't changed, just update children immediately
      setDisplayChildren(children)
    }
  }, [pathname, children])

  // Always keep displayChildren in sync when not transitioning
  useEffect(() => {
    if (!isTransitioning) {
      setDisplayChildren(children)
    }
  }, [children, isTransitioning])

  return (
    <div 
      className="min-h-screen transition-opacity duration-200 ease-in-out"
      style={{ 
        backgroundColor: 'var(--background)',
        opacity: isTransitioning ? 0.95 : 1,
        willChange: 'opacity',
        minHeight: '100vh'
      }}
    >
      {displayChildren}
    </div>
  )
}

