"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { ProfileSubscription } from "@/components/profile/profileSubscription";
import { routes } from "@/utils/routes";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

export default function SubscriptionSettingsPage() {
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

        // Only admins can access subscription settings
        if (isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }

        setIsChecking(false);
    }, [user, isAuthenticated, router, isEmployee]);

    if (isEmployee || !isAuthenticated || isChecking) {
        return (
            <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8">
                <PageSkeleton type="form" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full px-1 py-4 sm:px-4 sm:py-6">
            <ProfileLayout>
                {() => <ProfileSubscription />}
            </ProfileLayout>
        </div>
    );
}
