"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CalendarPlus, UserPlus, Users, Send, ClipboardList } from "lucide-react";
import { routes } from "@/utils/routes";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

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
        href: routes.privateroute.EMPLOYEELIST,
        icon: Users,
        label: "Manage Employees",
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
        label: "Appointment Requests",
    },
];

export function QuickActions() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { hasReachedEmployeeLimit, hasReachedAppointmentLimit } = useSubscriptionStatus();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
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
                    {hasReachedAppointmentLimit ? (
                        <>
                            <Button
                                className="h-16 flex-col bg-transparent p-2 text-xs sm:h-20 sm:text-sm"
                                variant="outline"
                                onClick={() => setShowUpgradeModal(true)}
                            >
                                <CalendarPlus className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                <span className="line-clamp-2 text-center">Upgrade to Create More</span>
                            </Button>
                        </>
                    ) : (
                        isEmployee ? (
                            <Button
                                className="h-16 flex-col bg-transparent p-2 text-xs sm:h-20 sm:text-sm"
                                variant="outline"
                                onClick={() => router.push(routes.privateroute.APPOINTMENT_LINKS)}
                            >
                                <Send className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                <span className="line-clamp-2 text-center">Create Appointment Link</span>
                            </Button>
                        ) : (
                            <Button
                                className="h-16 flex-col bg-transparent p-2 text-xs sm:h-20 sm:text-sm"
                                variant="outline"
                                asChild
                            >
                                <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch>
                                    <CalendarPlus className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                    <span className="line-clamp-2 text-center">Create Appointment</span>
                                </Link>
                            </Button>
                        )
                    )}

                    {quickActions.map((action) => (
                        <Button
                            key={action.href}
                            className="h-16 flex-col bg-transparent p-2 text-xs sm:h-20 sm:text-sm"
                            variant="outline"
                            asChild
                        >
                            <Link href={action.href} prefetch={true}>
                                <action.icon className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                <span className="line-clamp-2 text-center">{action.label}</span>
                            </Link>
                        </Button>
                    ))}

                    {!isEmployee && (
                        hasReachedEmployeeLimit ? (
                            <>
                                <Button
                                    className="h-16 flex-col bg-transparent p-2 text-xs sm:h-20 sm:text-sm"
                                    variant="outline"
                                    onClick={() => setShowUpgradeModal(true)}
                                >
                                    <UserPlus className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                    <span className="line-clamp-2 text-center">Upgrade to Add More</span>
                                </Button>
                            </>
                        ) : (
                            <Button
                                className="h-16 flex-col bg-transparent p-2 text-xs sm:h-20 sm:text-sm"
                                variant="outline"
                                asChild
                            >
                                <Link href={routes.privateroute.EMPLOYEECREATE} prefetch>
                                    <UserPlus className="mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" />
                                    <span className="line-clamp-2 text-center">Add Employee</span>
                                </Link>
                            </Button>
                        )
                    )}

                    <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
                </div>
            </CardContent>
        </Card>
    );
}
