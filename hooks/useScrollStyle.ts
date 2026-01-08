"use client";

import { useState, useEffect, useMemo } from "react";

interface UseScrollStyleOptions {
    /**
     * Scroll threshold in pixels. When scroll position exceeds this value, isScrolled becomes true.
     * @default 10
     */
    threshold?: number;

    /**
     * Whether to track scroll on mount. If false, hook will only track after component mounts.
     * @default true
     */
    trackOnMount?: boolean;

    /**
     * Debounce delay in milliseconds for scroll events (optional, for performance)
     * @default 0 (no debounce)
     */
    debounceMs?: number;
}

interface UseScrollStyleReturn {
    /**
     * Whether the page has been scrolled beyond the threshold
     */
    isScrolled: boolean;

    /**
     * Current scroll position in pixels
     */
    scrollY: number;

    /**
     * Scroll percentage (0-100) based on document height
     */
    scrollPercentage: number;

    /**
     * Whether the scroll listener is active
     */
    isTracking: boolean;
}

/**
 * Hook for tracking scroll position and providing scroll-based styling states
 *
 * @example
 * ```tsx
 * const { isScrolled, scrollY } = useScrollStyle({ threshold: 20 })
 *
 * return (
 *   <nav className={isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}>
 *     Navbar
 *   </nav>
 * )
 * ```
 */
export function useScrollStyle(options: UseScrollStyleOptions = {}): UseScrollStyleReturn {
    const { threshold = 10, trackOnMount = true, debounceMs = 0 } = options;

    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        // Only track on client side
        if (typeof window === "undefined") return;

        // Initialize scroll state
        if (trackOnMount) {
            const initialScrollY = window.scrollY;
            const initialIsScrolled = initialScrollY > threshold;
            setScrollY(initialScrollY);
            setIsScrolled(initialIsScrolled);
            setIsTracking(true);

            // Calculate initial scroll percentage
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                setScrollPercentage((initialScrollY / docHeight) * 100);
            }
        } else {
            setIsTracking(true);
        }

        // Scroll handler function
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const currentIsScrolled = currentScrollY > threshold;

            setScrollY(currentScrollY);
            setIsScrolled(currentIsScrolled);

            // Calculate scroll percentage
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const percentage = (currentScrollY / docHeight) * 100;
                setScrollPercentage(Math.min(100, Math.max(0, percentage)));
            } else {
                setScrollPercentage(0);
            }
        };

        // Debounced scroll handler (if debounce is enabled)
        let timeoutId: NodeJS.Timeout | null = null;
        const debouncedHandleScroll =
            debounceMs > 0
                ? () => {
                      if (timeoutId) clearTimeout(timeoutId);
                      timeoutId = setTimeout(handleScroll, debounceMs);
                  }
                : handleScroll;

        // Add scroll event listener
        window.addEventListener("scroll", debouncedHandleScroll, { passive: true });

        // Cleanup
        return () => {
            window.removeEventListener("scroll", debouncedHandleScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [threshold, trackOnMount, debounceMs]);

    return {
        isScrolled,
        scrollY,
        scrollPercentage,
        isTracking,
    };
}

/**
 * Hook specifically for navbar scroll-based styling
 * Provides common navbar styling states based on scroll and authentication
 *
 * @example
 * ```tsx
 * const { shouldShowWhiteNavbar, linkText, linkHoverBgClass, ctaBtn } = useNavbarScrollStyle({
 *   isAuthenticated: true,
 *   isMounted: true
 * })
 *
 * return (
 *   <nav className={shouldShowWhiteNavbar ? 'bg-white' : 'bg-transparent'}>
 *     <Link className={linkText}>Home</Link>
 *   </nav>
 * )
 * ```
 */
interface UseNavbarScrollStyleOptions {
    /**
     * Whether user is authenticated (affects navbar styling)
     */
    isAuthenticated: boolean;

    /**
     * Whether component is mounted (prevents SSR issues)
     */
    isMounted: boolean;

    /**
     * Scroll threshold for navbar styling
     * @default 10
     */
    threshold?: number;
}

interface UseNavbarScrollStyleReturn {
    /**
     * Whether to show white navbar background
     */
    shouldShowWhiteNavbar: boolean;

    /**
     * Text color class for links (white or dark)
     */
    linkText: string;

    /**
     * Hover background class for links
     */
    linkHoverBgClass: string;

    /**
     * CTA button styling class
     */
    ctaBtn: string;

    /**
     * Whether page is scrolled
     */
    isScrolled: boolean;

    /**
     * Current scroll position
     */
    scrollY: number;
}

export function useNavbarScrollStyle(options: UseNavbarScrollStyleOptions): UseNavbarScrollStyleReturn {
    const { isAuthenticated, isMounted, threshold = 10 } = options;

    const { isScrolled, scrollY } = useScrollStyle({
        threshold,
        trackOnMount: true,
    });

    // Determine if white navbar should be shown
    // Show white navbar if: authenticated OR (mounted AND scrolled)
    const shouldShowWhiteNavbar = useMemo(() => {
        return isAuthenticated || (isMounted && isScrolled);
    }, [isAuthenticated, isMounted, isScrolled]);

    // Link text color based on navbar style
    const linkText = useMemo(() => {
        return shouldShowWhiteNavbar ? "text-gray-900" : "text-white";
    }, [shouldShowWhiteNavbar]);

    // Link hover background based on navbar style
    const linkHoverBgClass = useMemo(() => {
        return shouldShowWhiteNavbar ? "hover:bg-gray-100/80" : "hover:bg-white/10";
    }, [shouldShowWhiteNavbar]);

    // CTA button styling based on navbar style
    const ctaBtn = useMemo(() => {
        return shouldShowWhiteNavbar
            ? "bg-brand text-white hover:bg-brand/90"
            : "bg-white text-brand-strong hover:bg-white/90";
    }, [shouldShowWhiteNavbar]);

    return {
        shouldShowWhiteNavbar,
        linkText,
        linkHoverBgClass,
        ctaBtn,
        isScrolled,
        scrollY,
    };
}
