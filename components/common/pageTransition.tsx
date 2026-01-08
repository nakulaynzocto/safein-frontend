"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition component to prevent white screen during navigation
 * Keeps previous content visible until new page is ready
 */
export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const previousPathname = useRef(pathname);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const childrenRef = useRef(children);

    useEffect(() => {
        childrenRef.current = children;
    }, [children]);

    useEffect(() => {
        if (previousPathname.current !== pathname) {
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }

            setIsTransitioning(true);

            const rafId = requestAnimationFrame(() => {
                transitionTimeoutRef.current = setTimeout(() => {
                    setDisplayChildren(childrenRef.current);
                    setTimeout(() => {
                        setIsTransitioning(false);
                        previousPathname.current = pathname;
                        transitionTimeoutRef.current = null;
                    }, 50);
                }, 150); // Increased delay to ensure new page is rendered
            });

            return () => {
                cancelAnimationFrame(rafId);
                if (transitionTimeoutRef.current) {
                    clearTimeout(transitionTimeoutRef.current);
                    transitionTimeoutRef.current = null;
                }
            };
        } else {
            setDisplayChildren(children);
        }
    }, [pathname]);

    useEffect(() => {
        if (!isTransitioning && previousPathname.current === pathname) {
            setDisplayChildren(children);
        }
    }, [children, isTransitioning, pathname]);

    return (
        <div
            className="min-h-screen transition-opacity duration-300 ease-in-out"
            style={{
                backgroundColor: "var(--background)",
                opacity: isTransitioning ? 0.95 : 1,
                willChange: "opacity",
                minHeight: "100vh",
            }}
        >
            {displayChildren}
        </div>
    );
}
