"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routes } from "@/utils/routes";

/**
 * RouteOptimizer component to prefetch and optimize route transitions
 * This helps reduce navigation time by preloading data
 */
export function RouteOptimizer() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const commonRoutes = [
            routes.privateroute.DASHBOARD,
            routes.privateroute.APPOINTMENTLIST,
            routes.privateroute.VISITORLIST,
            routes.privateroute.EMPLOYEELIST,

            routes.privateroute.PROFILE,
        ];

        commonRoutes.forEach((route) => {
            if (route !== pathname) {
                router.prefetch(route);
            }
        });
    }, [pathname, router]);

    useEffect(() => {
        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target;

            if (!(target instanceof Element)) {
                return;
            }

            const anchor = target.closest("a");

            if (anchor && anchor.href) {
                try {
                    const url = new URL(anchor.href);
                    const currentUrl = new URL(window.location.href);

                    if (url.origin === currentUrl.origin) {
                        router.prefetch(url.pathname);
                    }
                } catch (error) { }
            }
        };

        document.addEventListener("mouseenter", handleMouseEnter, true);

        return () => {
            document.removeEventListener("mouseenter", handleMouseEnter, true);
        };
    }, [router]);

    return null;
}
