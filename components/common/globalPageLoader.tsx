"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Global Page Loader - Shows loader during page reloads and navigation
 * Provides smooth loading experience for all page transitions
 */
export function GlobalPageLoader() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const previousPathname = useRef<string | null>(null);
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle initial page load
    useEffect(() => {
        if (isInitialLoad) {
            // Check if page is being reloaded using Performance API
            let isReload = false;
            try {
                const perfEntries = window.performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
                if (perfEntries.length > 0) {
                    isReload = perfEntries[0].type === "reload";
                } else if ((window.performance as any).navigation) {
                    // Fallback for older browsers
                    isReload = (window.performance as any).navigation.type === 1;
                }
            } catch (e) {
                // If Performance API is not available, assume it's a reload
                isReload = true;
            }

            // Wait for page to be fully loaded
            const handleInitialLoad = () => {
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                }

                loadingTimeoutRef.current = setTimeout(
                    () => {
                        setIsLoading(false);
                        setIsInitialLoad(false);
                        previousPathname.current = pathname;
                    },
                    isReload ? 600 : 400,
                );
            };

            if (document.readyState === "complete") {
                handleInitialLoad();
            } else {
                window.addEventListener("load", handleInitialLoad);
                return () => {
                    window.removeEventListener("load", handleInitialLoad);
                    if (loadingTimeoutRef.current) {
                        clearTimeout(loadingTimeoutRef.current);
                    }
                };
            }
        }
    }, [isInitialLoad, pathname]);

    // Handle route changes - smooth navigation
    useEffect(() => {
        if (!isInitialLoad && previousPathname.current !== null) {
            // Route changed - show loader immediately
            if (previousPathname.current !== pathname) {
                setIsLoading(true);

                // Hide loader after page content is ready (shorter delay for faster pages)
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                }

                // Use requestAnimationFrame for smoother transitions
                const rafId = requestAnimationFrame(() => {
                    loadingTimeoutRef.current = setTimeout(() => {
                        // Hide loader quickly - let page-specific loaders handle data loading
                        setIsLoading(false);
                        previousPathname.current = pathname;
                    }, 100); // Short delay for smooth transition
                });

                return () => {
                    cancelAnimationFrame(rafId);
                    if (loadingTimeoutRef.current) {
                        clearTimeout(loadingTimeoutRef.current);
                    }
                };
            }
        }

        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [pathname, isInitialLoad]);

    // Handle browser refresh/reload
    useEffect(() => {
        const handleBeforeUnload = () => {
            setIsLoading(true);
        };

        const handleLoad = () => {
            // Small delay to ensure smooth transition
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
            loadingTimeoutRef.current = setTimeout(() => {
                setIsLoading(false);
            }, 500);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("load", handleLoad);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("load", handleLoad);
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, []);

    // Listen for link clicks to show loader immediately
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target;
            if (!(target instanceof Element)) return;

            const anchor = target.closest("a");
            if (anchor && anchor.href) {
                // Skip if link has data-no-loader or data-skip-navigation attribute (for downloads, etc.)
                if (anchor.hasAttribute("data-no-loader") || anchor.hasAttribute("data-skip-navigation")) {
                    return;
                }

                try {
                    const url = new URL(anchor.href);
                    const currentUrl = new URL(window.location.href);

                    // Only for same-origin navigation
                    if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
                        // Show loader immediately on link click
                        setIsLoading(true);
                    }
                } catch (error) {
                    // Invalid URL, ignore
                }
            }
        };

        document.addEventListener("click", handleLinkClick, true);
        return () => {
            document.removeEventListener("click", handleLinkClick, true);
        };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm transition-opacity duration-300 ${
                isLoading ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            style={{
                backgroundColor: "var(--background)",
            }}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-[#3882a5]/20"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                </div>
                <p className="animate-pulse text-sm font-medium text-[#3882a5]">Loading...</p>
            </div>
        </div>
    );
}
