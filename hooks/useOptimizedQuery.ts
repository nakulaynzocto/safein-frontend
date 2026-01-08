import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Custom hook to optimize RTK Query usage and prevent unnecessary loading states during navigation
 */
export function useOptimizedQuery<T>(
    queryHook: () => T,
    options: {
        skipOnRouteChange?: boolean;
        debounceMs?: number;
    } = {},
) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [previousPath, setPreviousPath] = useState<string>("");

    const { skipOnRouteChange = true, debounceMs = 100 } = options;

    // Detect route changes
    useEffect(() => {
        const handleRouteChangeStart = () => {
            if (skipOnRouteChange) {
                setIsNavigating(true);
            }
        };

        const handleRouteChangeComplete = () => {
            if (skipOnRouteChange) {
                setTimeout(() => {
                    setIsNavigating(false);
                }, debounceMs);
            }
        };

        // Listen for route changes
        const currentPath = window.location.pathname;
        if (currentPath !== previousPath) {
            setPreviousPath(currentPath);
            if (skipOnRouteChange) {
                setIsNavigating(true);
                setTimeout(() => {
                    setIsNavigating(false);
                }, debounceMs);
            }
        }

        return () => {
            // Cleanup if needed
        };
    }, [skipOnRouteChange, debounceMs, previousPath]);

    // Get the query result
    const queryResult = queryHook();

    // Optimize the result to prevent loading states during navigation
    const optimizedResult = useMemo(() => {
        if (!queryResult || typeof queryResult !== "object") {
            return queryResult;
        }

        const result = { ...queryResult };

        // If we're navigating and have cached data, don't show loading
        if (isNavigating && "isLoading" in result && "data" in result) {
            if (result.data && !result.isLoading) {
                result.isLoading = false;
                // isFetching may not exist on all query result types
                if ("isFetching" in result) {
                    (result as any).isFetching = false;
                }
            }
        }

        return result;
    }, [queryResult, isNavigating]);

    return optimizedResult;
}

/**
 * Hook to prevent loading states during route transitions
 */
export function useRouteTransitionOptimization() {
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const handleRouteChangeStart = () => {
            setIsTransitioning(true);
        };

        const handleRouteChangeComplete = () => {
            setTimeout(() => {
                setIsTransitioning(false);
            }, 150); // Small delay to prevent flicker
        };

        // Listen for route changes
        const handlePopState = () => {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 150);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    return isTransitioning;
}
