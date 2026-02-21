"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { DashboardSkeleton } from "@/components/common/tableSkeleton";
import { useAppDispatch } from "@/store/hooks";
import { userSubscriptionApi } from "@/store/api/userSubscriptionApi";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { routes } from "@/utils/routes";
import { CompanyProfileModal } from "@/components/common/CompanyProfileModal";

const UnifiedDashboard = lazy(() =>
    import("@/components/dashboard/UnifiedDashboard").then((module) => ({ default: module.UnifiedDashboard })),
);

export default function DashboardPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { user: authUser } = useAuthSubscription();
    const [showCompanyModal, setShowCompanyModal] = useState(false);

    // Refetch subscription data when landing on dashboard (e.g., after payment success)
    useEffect(() => {
        if (!isAuthenticated) {
            router.push(routes.publicroute.LOGIN);
            return;
        }

        if (authUser?.id) {
            // Invalidate and refetch subscription data to ensure fresh state
            dispatch(userSubscriptionApi.util.invalidateTags(["User", "Subscription"]));

            // LOGIC: Check if profile needs completion
            // Show modal if user is ADMIN and missing critical info or using placeholder
            const isAdmin = authUser?.role === 'admin' || authUser?.roles?.includes('admin');
            const isPlaceholderCompany = authUser?.companyName === "SafeIn User";
            const isProfileIncomplete = !authUser?.mobileNumber || !authUser?.address?.city || isPlaceholderCompany;

            if (isAdmin && isProfileIncomplete) {
                setShowCompanyModal(true);
            } else {
                setShowCompanyModal(false);
            }
        }
    }, [authUser, dispatch, isAuthenticated, router]);

    // Unified dashboard works for both admin and employee
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <CompanyProfileModal isOpen={showCompanyModal} />
            <UnifiedDashboard />
        </Suspense>
    );
}
