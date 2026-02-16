"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { PendingApprovals } from "@/components/employee-dashboard/PendingApprovals";
import { useGetAppointmentsQuery } from "@/store/api/appointmentApi";
import { routes } from "@/utils/routes";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/common/pageHeader";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";

export default function AppointmentRequestsPage() {
    const router = useRouter();
    const { user, isAuthenticated, subscriptionLimits, isLoading: isAuthLoading } = useAuthSubscription();
    const [isChecking, setIsChecking] = useState(true);

    // Check if user is employee
    const isEmployee = checkIsEmployee(user);

    // Get pending appointments (unified API)
    const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointmentsQuery({
        page: 1,
        limit: 100,
        status: "pending",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        if (user && !isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }

        if (user && isEmployee) {
            setIsChecking(false);
        }
    }, [user, isAuthenticated, router, isEmployee]);

    if (!isAuthenticated || isChecking || !user || isAuthLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isEmployee) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                        <p className="text-sm text-gray-600 text-center max-w-md">
                            This page is only accessible to employees.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const pendingAppointments = appointmentsData?.appointments || [];

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="Visit Approvals"
                description="Review and manage incoming visit requests"
            />

            {appointmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : pendingAppointments.length > 0 ? (
                <PendingApprovals appointments={pendingAppointments} />
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                        <p className="text-sm text-gray-600 text-center max-w-md">
                            You don't have any pending appointment requests at the moment.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

