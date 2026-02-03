"use client";

import { Suspense, lazy, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { DashboardSkeleton } from "@/components/common/tableSkeleton";
import { useAppDispatch } from "@/store/hooks";
import { userSubscriptionApi } from "@/store/api/userSubscriptionApi";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { routes } from "@/utils/routes";

const UnifiedDashboard = lazy(() =>
    import("@/components/dashboard/UnifiedDashboard").then((module) => ({ default: module.UnifiedDashboard })),
);

export default function DashboardPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { user: authUser } = useAuthSubscription();

    // Refetch subscription data when landing on dashboard (e.g., after payment success)
    useEffect(() => {
        if (!isAuthenticated) {
            router.push(routes.publicroute.LOGIN);
            return;
        }

        if (authUser?.id) {
            // Invalidate and refetch subscription data to ensure fresh state
            // Use correct tag types: 'User' and 'Subscription' as defined in the API
            dispatch(userSubscriptionApi.util.invalidateTags(["User", "Subscription"]));
        }
    }, [authUser?.id, dispatch, isAuthenticated, router]);

    // Unified dashboard works for both admin and employee
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <UnifiedDashboard />
        </Suspense>
    );
}
