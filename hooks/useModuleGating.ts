"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

/**
 * Custom hook to enforce subscription-based feature gating at the page level.
 * 
 * @param requiredModule - The key of the module flag to check in subscription data
 * @param redirectTo - Path to redirect to if access is denied (defaults to DASHBOARD)
 * @returns { isChecking: boolean, modules: any, isEmployee: boolean }
 */
export function useModuleGating(requiredModule: string, redirectTo: string = routes.privateroute.DASHBOARD) {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;
    const [isChecking, setIsChecking] = useState(true);
    const isEmployee = checkIsEmployee(user);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        // Feature gating logic:
        // 1. Employee restriction (most settings pages are admin only)
        // 2. Subscription module check (strict boolean check)
        const hasAccess = !isEmployee && !!modules?.[requiredModule as keyof typeof modules];

        if (!hasAccess) {
            // Only redirect if authentication is confirmed and modules data is loaded
            if (modules) {
                router.replace(redirectTo);
            }
            return;
        }

        setIsChecking(false);
    }, [isAuthenticated, isEmployee, modules, requiredModule, router, redirectTo]);

    return { isChecking, modules, isEmployee, isAuthenticated };
}
