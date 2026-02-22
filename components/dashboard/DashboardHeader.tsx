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
import { AddonPurchaseModal } from "@/components/common/AddonPurchaseModal";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

interface DashboardHeaderProps {
    companyName?: string;
}

export function DashboardHeader({ companyName }: DashboardHeaderProps) {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);

    // Check if user is employee
    const isEmployee = checkIsEmployee(user);

    return (
        <PageHeader title={companyName || "Company"}>
            <div className="flex w-full gap-2 sm:w-auto">
                {!isEmployee && (
                    // For admin: Show "New Appointment" button
                    <>
                        {hasReachedAppointmentLimit || isExpired ? (
                            <>
                                <Button
                                    onClick={() => {
                                        if (isExpired) {
                                            setShowUpgradeModal(true);
                                        } else {
                                            setShowAddonModal(true);
                                        }
                                    }}
                                    variant="outline-primary"
                                    className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-background text-xs whitespace-nowrap sm:w-auto sm:text-sm"
                                >
                                    <CalendarPlus className="mr-1 h-5 w-5 shrink-0 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        {isExpired ? "Upgrade to Create More" : "Buy Extra Invites"}
                                    </span>
                                    <span className="sm:hidden">
                                        {isExpired ? "Upgrade" : "Addon"}
                                    </span>
                                </Button>
                                <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
                                <AddonPurchaseModal
                                    isOpen={showAddonModal}
                                    onClose={() => setShowAddonModal(false)}
                                    type="appointment"
                                />
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
                    </>
                )}
            </div>
        </PageHeader>
    );
}
