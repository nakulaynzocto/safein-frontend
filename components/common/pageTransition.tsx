"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * PageTransition component to prevent white screen during navigation
 * Keeps previous content visible until new page is ready
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    // When pathname changes, start transition
    if (previousPathname.current !== pathname) {
      setIsTransitioning(true)
      
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setIsTransitioning(false)
        previousPathname.current = pathname
      }, 30)

      return () => clearTimeout(timer)
    } else {
      // Pathname hasn't changed, just update children
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div 
      className="min-h-screen transition-opacity duration-150"
      style={{ 
        backgroundColor: 'var(--background)',
        opacity: isTransitioning ? 0.98 : 1,
        willChange: 'opacity'
      }}
    >
      {displayChildren}
    </div>
  )
}

