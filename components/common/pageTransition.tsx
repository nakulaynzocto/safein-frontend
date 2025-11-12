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
  const childrenRef = useRef(children)

  // Always keep childrenRef updated
  useEffect(() => {
    childrenRef.current = children
  }, [children])

  useEffect(() => {
    // When pathname changes, start transition
    if (previousPathname.current !== pathname) {
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }

      // Start transition - keep old content visible
      setIsTransitioning(true)
      
      // Use requestAnimationFrame to ensure smooth transition
      // Then update content after a delay to let Next.js render
      const rafId = requestAnimationFrame(() => {
        transitionTimeoutRef.current = setTimeout(() => {
          // Update to new content
          setDisplayChildren(childrenRef.current)
          
          // Small delay before ending transition for smooth fade
          setTimeout(() => {
            setIsTransitioning(false)
            previousPathname.current = pathname
            transitionTimeoutRef.current = null
          }, 50)
        }, 150) // Increased delay to ensure new page is rendered
      })

      return () => {
        cancelAnimationFrame(rafId)
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
          transitionTimeoutRef.current = null
        }
      }
    } else {
      // Pathname hasn't changed, just update children immediately
      setDisplayChildren(children)
    }
  }, [pathname])

  // Always sync displayChildren when not transitioning
  useEffect(() => {
    if (!isTransitioning && previousPathname.current === pathname) {
      setDisplayChildren(children)
    }
  }, [children, isTransitioning, pathname])

  return (
    <div 
      className="min-h-screen transition-opacity duration-300 ease-in-out"
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

