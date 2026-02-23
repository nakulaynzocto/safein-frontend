"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { routes } from "@/utils/routes";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

export default function WhatsAppConfigPage() {
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

        // WhatsApp config is only for admins
        if (isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }

        setIsChecking(false);
    }, [user, isAuthenticated, router, isEmployee]);

    // IMMEDIATE CHECK: If employee, show loading and redirect (don't render anything)
    if (isEmployee) {
        if (typeof window !== 'undefined' && isAuthenticated) {
            router.replace(routes.privateroute.DASHBOARD);
        }
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Show loading while checking
    if (!isAuthenticated || isChecking) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Only admins can access WhatsApp config
    return <WhatsAppSettings />;
}
