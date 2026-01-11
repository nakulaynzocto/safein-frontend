"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/pageHeader";
import { CalendarPlus } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { routes } from "@/utils/routes";

interface DashboardHeaderProps {
    companyName?: string;
}

export function DashboardHeader({ companyName }: DashboardHeaderProps) {
    const { hasReachedAppointmentLimit } = useSubscriptionStatus();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    return (
        <PageHeader title={companyName || "Company"}>
            <div className="flex w-full gap-2 sm:w-auto">
                {hasReachedAppointmentLimit ? (
                    <>
                        <Button
                            onClick={() => setShowUpgradeModal(true)}
                            variant="outline-primary"
                            className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-muted/30 text-xs whitespace-nowrap sm:w-auto sm:text-sm"
                        >
                            <CalendarPlus className="mr-1 h-5 w-5 shrink-0 sm:mr-2" />
                            <span className="hidden sm:inline">Upgrade to Create More</span>
                            <span className="sm:hidden">Upgrade</span>
                        </Button>
                        <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
                    </>
                ) : (
                    <Button
                        variant="outline-primary"
                        className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-muted/30 text-xs whitespace-nowrap sm:w-auto sm:text-sm"
                        asChild
                    >
                        <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch>
                            <CalendarPlus className="mr-1.5 h-5 w-5 shrink-0" />
                            New Appointment
                        </Link>
                    </Button>
                )}
            </div>
        </PageHeader>
    );
}
