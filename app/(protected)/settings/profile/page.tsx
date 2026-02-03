"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { ProfilePageContent } from "@/components/profile";
import { routes } from "@/utils/routes";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { ProtectedLayout } from "@/components/layout/protectedLayout";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);
    
    // Check if user is employee
    const isEmployee = checkIsEmployee(user);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        // Immediately redirect employees away from profile page - use replace to prevent back navigation
        if (isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }

        setIsChecking(false);
    }, [user, isAuthenticated, router, isEmployee]);

    // IMMEDIATE CHECK: If employee, show loading and redirect (don't render anything)
    if (isEmployee) {
        // Use useEffect to redirect, but show loading immediately
        if (typeof window !== 'undefined' && isAuthenticated) {
            router.replace(routes.privateroute.DASHBOARD);
        }
        return (
            <ProtectedLayout>
                <div className="flex min-h-screen items-center justify-center">
                    <LoadingSpinner />
                </div>
            </ProtectedLayout>
        );
    }

    // Show loading while checking
    if (!isAuthenticated || isChecking) {
        return (
            <ProtectedLayout>
                <div className="flex min-h-screen items-center justify-center">
                    <LoadingSpinner />
                </div>
            </ProtectedLayout>
        );
    }

    // Only admins can access profile page
    return <ProfilePageContent />;
}
