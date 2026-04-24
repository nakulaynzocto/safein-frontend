"use client";


import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CalendarPlus, UserPlus, Users, Send, ClipboardList, IdCard, Contact, QrCode } from "lucide-react";
import { routes } from "@/utils/routes";

import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";

interface QuickAction {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

const adminQuickActions: QuickAction[] = [
    {
        href: routes.privateroute.APPOINTMENTLIST,
        icon: Calendar,
        label: "View All Appointments",
    },
    {
        href: routes.privateroute.VISITORLIST,
        icon: Contact,
        label: "Manage Visitors",
    },
    {
        href: routes.privateroute.SPOT_PASS,
        icon: IdCard,
        label: "Spot Pass",
    },
];

const employeeQuickActions: QuickAction[] = [
    {
        href: routes.privateroute.APPOINTMENTLIST,
        icon: Calendar,
        label: "View All Appointments",
    },
    {
        href: routes.privateroute.APPOINTMENT_REQUESTS,
        icon: ClipboardList,
        label: "Visit Approvals",
    },
    {
        href: routes.privateroute.SPOT_PASS,
        icon: IdCard,
        label: "Spot Pass",
    },
];

export function QuickActions() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { hasReachedEmployeeLimit, hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal
    } = useSubscriptionActions();

    // Check if user is employee
    const isEmployee = checkIsEmployee(user);
    const quickActions = isEmployee ? employeeQuickActions : adminQuickActions;

    return (
        <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 md:p-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
                    <SubscriptionActionButtons
                        isExpired={isExpired}
                        hasReachedLimit={hasReachedAppointmentLimit}
                        limitType="appointment"
                        showUpgradeModal={showUpgradeModal}
                        openUpgradeModal={openUpgradeModal}
                        closeUpgradeModal={closeUpgradeModal}
                        upgradeLabel="Upgrade to Create More"
                        icon={CalendarPlus}
                        className="h-16 flex-col bg-transparent w-full text-xs sm:h-20 sm:text-sm border-2 border-dashed border-brand/20 hover:border-brand/40 hover:bg-brand/5 rounded-xl transition-all"
                    >
                        {isEmployee ? (
                            <Button
                                className="h-16 flex-col p-2 text-xs sm:h-20 sm:text-sm w-full transition-all"
                                variant="primary"
                                onClick={() => router.push(routes.privateroute.APPOINTMENT_LINKS)}
                            >
                                <Send className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                <span className="line-clamp-2 text-center font-bold">Visitor Invites</span>
                            </Button>
                        ) : (
                            <Button
                                className="h-16 flex-col p-2 text-xs sm:h-20 sm:text-sm w-full transition-all"
                                variant="primary"
                                asChild
                            >
                                <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch>
                                    <CalendarPlus className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                    <span className="line-clamp-2 text-center font-bold">Create Appointment</span>
                                </Link>
                            </Button>
                        )}
                    </SubscriptionActionButtons>

                    {quickActions.map((action) => (
                        <Button
                            key={action.href}
                            className="h-16 flex-col p-2 text-xs sm:h-20 sm:text-sm w-full transition-all"
                            variant="primary"
                            asChild
                        >
                            <Link href={action.href} prefetch={true}>
                                <action.icon className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                <span className="line-clamp-2 text-center font-bold">{action.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
