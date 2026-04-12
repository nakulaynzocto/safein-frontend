"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { SMSSettings } from "@/components/settings/SMSSettings";
import { routes } from "@/utils/routes";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

export default function SMSSettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    const isEmployee = checkIsEmployee(user);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        if (isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }

        setIsChecking(false);
    }, [user, isAuthenticated, router, isEmployee]);

    if (isEmployee) {
        if (typeof window !== "undefined" && isAuthenticated) {
            router.replace(routes.privateroute.DASHBOARD);
        }
        return (
            <div className="container mx-auto max-w-full">
                <PageSkeleton type="form" />
            </div>
        );
    }

    if (!isAuthenticated || isChecking) {
        return (
            <div className="container mx-auto max-w-full">
                <PageSkeleton type="form" />
            </div>
        );
    }

    return <SMSSettings />;
}
