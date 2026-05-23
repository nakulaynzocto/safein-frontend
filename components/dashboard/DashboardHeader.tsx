"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/pageHeader";
import { CalendarPlus, Send } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAppSelector } from "@/store/hooks";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { UserPlus } from "lucide-react";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";

interface DashboardHeaderProps {
    companyName?: string;
}

export function DashboardHeader({ companyName }: DashboardHeaderProps) {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal
    } = useSubscriptionActions();

    // Check if user is employee
    const isEmployee = checkIsEmployee(user);

    return (
        <PageHeader title={companyName || "Company"}>
            <div className="flex w-full gap-2 sm:w-auto">
                {!isEmployee && (
                    // For admin: Show "New Appointment" button
                    <SubscriptionActionButtons
                        isExpired={isExpired}
                        hasReachedLimit={hasReachedAppointmentLimit}
                        limitType="appointment"
                        showUpgradeModal={showUpgradeModal}
                        openUpgradeModal={openUpgradeModal}
                        closeUpgradeModal={closeUpgradeModal}
                        upgradeLabel="Upgrade Plan"
                        icon={UserPlus}
                        className="h-12 w-full sm:w-auto text-white"
                    >
                        <Button
                            variant="primary"
                            className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl text-white whitespace-nowrap sm:w-auto font-bold transition-all shadow-md active:scale-95 hover:scale-105"
                            asChild
                        >
                            <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch>
                                <CalendarPlus className="mr-1.5 h-5 w-5 shrink-0" />
                                New Appointment
                            </Link>
                        </Button>
                    </SubscriptionActionButtons>
                )}
            </div>
        </PageHeader>
    );
}
