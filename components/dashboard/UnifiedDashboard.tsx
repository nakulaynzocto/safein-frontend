"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetAppointmentsQuery, useGetAppointmentStatsQuery } from "@/store/api/appointmentApi";
import { useGetEmployeeCountQuery } from "@/store/api/employeeApi";
import { useGetVisitorCountQuery } from "@/store/api/visitorApi";
import { DashboardHeader } from "./DashboardHeader";

import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import { DashboardCharts } from "./dashboardCharts";
import { calculateAppointmentStats } from "./dashboardUtils";
import { DashboardSkeleton } from "@/components/common/tableSkeleton";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { AddonPurchaseModal } from "@/components/common/AddonPurchaseModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { routes } from "@/utils/routes";
import { getChartDateRange, getTimezoneOffset } from "@/utils/dateUtils";
import { ErrorDisplay } from "@/components/common/ErrorDisplay";
import { LoadingTimeoutDisplay } from "@/components/common/LoadingTimeoutDisplay";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { getErrorMessage } from "@/utils/errorUtils";
import { APIErrorState } from "@/components/common/APIErrorState";

export function UnifiedDashboard() {
    const router = useRouter();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    const chartDateRange = useMemo(() => getChartDateRange(), []);
    const timezoneOffset = useMemo(() => getTimezoneOffset(), []);

    const appointmentQueryParams = useMemo(
        () => ({
            page: 1,
            limit: 100,
            sortBy: "createdAt",
            sortOrder: "desc" as const,
            timezoneOffsetMinutes: timezoneOffset,
            startDate: chartDateRange.startDate,
            endDate: chartDateRange.endDate,
        }),
        [timezoneOffset, chartDateRange.startDate, chartDateRange.endDate],
    );

    const {
        data: appointmentsData,
        isLoading: appointmentsLoading,
        error: appointmentsError,
        refetch: refetchAppointments,
    } = useGetAppointmentsQuery(appointmentQueryParams, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    // Optimized: Use count APIs instead of fetching all data
    const {
        data: employeeCountData,
        isLoading: employeesLoading,
        error: employeesError,
        refetch: refetchEmployees,
    } = useGetEmployeeCountQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
    });

    const {
        data: visitorCountData,
        isLoading: visitorsLoading,
        error: visitorsError,
        refetch: refetchVisitors,
    } = useGetVisitorCountQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
    });

    const {
        data: appointmentStatsData,
        isLoading: statsLoading,
        error: statsError,
    } = useGetAppointmentStatsQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
    });

    const { hasReachedAppointmentLimit, isExpired, refetch: refetchSubscriptionStatus } = useSubscriptionStatus();
    const { user } = useAppSelector((state) => state.auth);

    const isLoading = appointmentsLoading || employeesLoading || visitorsLoading || statsLoading;

    const hasData = appointmentsData || employeeCountData || visitorCountData || appointmentStatsData;
    const shouldShowSkeleton = isLoading && !hasData && retryCount < 2;

    useEffect(() => {
        if (!isLoading) {
            setLoadingTimeout(false);
            return;
        }

        const timer = setTimeout(() => {
            setLoadingTimeout(true);
        }, 15000);

        return () => clearTimeout(timer);
    }, [isLoading]);

    const appointments = useMemo(() => appointmentsData?.appointments || [], [appointmentsData?.appointments]);

    const recentAppointments = useMemo(() => appointments.slice(0, 5), [appointments]);

    // Optimized: Use aggregated stats from backend instead of client-side calculation
    const stats = useMemo(() => {
        if (!appointmentStatsData) {
            return {
                totalAppointments: 0,
                pendingAppointments: 0,
                approvedAppointments: 0,
                rejectedAppointments: 0,
                completedAppointments: 0,
                timeOutAppointments: 0,
            };
        }

        return {
            totalAppointments: appointmentStatsData.total || 0,
            pendingAppointments: appointmentStatsData.pending || 0,
            approvedAppointments: appointmentStatsData.approved || 0,
            rejectedAppointments: appointmentStatsData.rejected || 0,
            completedAppointments: appointmentStatsData.completed || 0,
            timeOutAppointments: appointmentStatsData.cancelled || 0,
        };
    }, [appointmentStatsData]);

    const isEmployee = checkIsEmployee(user);

    const handleScheduleAppointment = useCallback(() => {
        if (isEmployee) {
            router.push(routes.privateroute.APPOINTMENT_LINKS);
        } else if (isExpired) {
            setShowUpgradeModal(true);
        } else if (hasReachedAppointmentLimit) {
            setShowAddonModal(true);
        } else {
            router.push(routes.privateroute.APPOINTMENTCREATE);
        }
    }, [isEmployee, isExpired, hasReachedAppointmentLimit, router]);

    const hasError = useMemo(
        () => appointmentsError || employeesError || visitorsError,
        [appointmentsError, employeesError, visitorsError],
    );

    const handleRetry = useCallback(() => {
        setRetryCount((prev) => prev + 1);
        refetchAppointments();
        refetchEmployees();
        refetchVisitors();
        refetchSubscriptionStatus();
    }, [refetchAppointments, refetchEmployees, refetchVisitors, refetchSubscriptionStatus]);

    if (shouldShowSkeleton && !hasError && !loadingTimeout) {
        return <DashboardSkeleton />;
    }

    if (loadingTimeout && isLoading && !hasData && !hasError) {
        return (
            <div className="space-y-6">
                <DashboardHeader companyName={isEmployee ? (user?.name || user?.email || "Employee") : (user?.companyName || "Company")} />
                <LoadingTimeoutDisplay onRetry={handleRetry} />
            </div>
        );
    }

    if (hasError && !hasData && !isLoading) {
        const errorMessages = [
            appointmentsError && `Appointments: ${getErrorMessage(appointmentsError)}`,
            employeesError && `Employees: ${getErrorMessage(employeesError)}`,
            visitorsError && `Visitors: ${getErrorMessage(visitorsError)}`,
        ].filter(Boolean).join("\n");

        return (
            <div className="space-y-6">
                <APIErrorState
                    title="Failed to load dashboard data"
                    description={errorMessages}
                    onRetry={handleRetry}
                    error={appointmentsError || employeesError || visitorsError}
                />
            </div>
        );
    }

    return (
        <div className={`space-y-4 sm:space-y-6 ${isEmployee ? 'px-1 sm:px-0' : ''}`}>
            <DashboardCharts
                appointmentsData={appointments}
                employeesData={[]} // Charts use appointments data mainly, employee/visitor lists not needed
                visitorsData={[]}
                dateRange={chartDateRange}
            />

            <AppointmentsTable
                title="Recent Appointments"
                description="Latest appointment activities"
                data={recentAppointments}
                isLoading={appointmentsLoading}
                showDateTime={true}
                emptyData={{
                    title: "No recent appointments",
                    description: "No recent appointment activities found.",
                    primaryActionLabel: isEmployee
                        ? "Visitor Invites"
                        : (isExpired ? "Upgrade Plan" : (hasReachedAppointmentLimit ? "Buy Extra Invites" : "Schedule Appointment")),
                }}
                onPrimaryAction={handleScheduleAppointment}
            />

            <QuickActions />

            <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <AddonPurchaseModal
                isOpen={showAddonModal}
                onClose={() => setShowAddonModal(false)}
                type="appointment"
            />
        </div>
    );
}

