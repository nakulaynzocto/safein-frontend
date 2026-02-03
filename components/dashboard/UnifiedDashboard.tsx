"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetAppointmentsQuery } from "@/store/api/appointmentApi";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
import { useGetVisitorsQuery } from "@/store/api/visitorApi";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./statsGrid";
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import { DashboardCharts } from "./dashboardCharts";
import { calculateAppointmentStats } from "./dashboardUtils";
import { DashboardSkeleton } from "@/components/common/tableSkeleton";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { routes } from "@/utils/routes";
import { getChartDateRange, getTimezoneOffset } from "@/utils/dateUtils";
import { ErrorDisplay } from "@/components/common/ErrorDisplay";
import { LoadingTimeoutDisplay } from "@/components/common/LoadingTimeoutDisplay";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { getErrorMessage } from "@/utils/errorUtils";

export function UnifiedDashboard() {
    const router = useRouter();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

    const {
        data: employeesData,
        isLoading: employeesLoading,
        error: employeesError,
        refetch: refetchEmployees,
    } = useGetEmployeesQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
    });

    const {
        data: visitorsData,
        isLoading: visitorsLoading,
        error: visitorsError,
        refetch: refetchVisitors,
    } = useGetVisitorsQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
    });

    const { hasReachedAppointmentLimit, refetch: refetchSubscriptionStatus } = useSubscriptionStatus();
    const { user } = useAppSelector((state) => state.auth);

    const isLoading = appointmentsLoading || employeesLoading || visitorsLoading;

    const hasData = appointmentsData || employeesData || visitorsData;
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
    const employees = useMemo(() => employeesData?.employees || [], [employeesData?.employees]);
    const visitors = useMemo(() => visitorsData?.visitors || [], [visitorsData?.visitors]);

    const recentAppointments = useMemo(() => appointments.slice(0, 5), [appointments]);

    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const todayAppointments = appointments.filter((apt) => {
            const aptDate = new Date(apt.appointmentDetails?.scheduledDate || apt.createdAt);
            return aptDate.toDateString() === today;
        });

        const calculatedStats = calculateAppointmentStats(todayAppointments);
        const {
            pendingAppointments,
            approvedAppointments,
            rejectedAppointments,
            completedAppointments,
            timeOutAppointments,
            totalAppointments,
        } = calculatedStats;
        const sumOfCategories =
            pendingAppointments +
            approvedAppointments +
            rejectedAppointments +
            completedAppointments +
            timeOutAppointments;

        return sumOfCategories !== totalAppointments
            ? { ...calculatedStats, totalAppointments: sumOfCategories }
            : calculatedStats;
    }, [appointments]);

    const isEmployee = checkIsEmployee(user);

    const handleScheduleAppointment = useCallback(() => {
        if (isEmployee) {
            router.push(routes.privateroute.APPOINTMENT_LINKS);
        } else {
            if (hasReachedAppointmentLimit) {
                setShowUpgradeModal(true);
            } else {
                router.push(routes.privateroute.APPOINTMENTCREATE);
            }
        }
    }, [isEmployee, hasReachedAppointmentLimit, router]);

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
                <DashboardHeader companyName={isEmployee ? (user?.name || user?.email || "Employee") : (user?.companyName || "Company")} />
                <ErrorDisplay
                    title="Failed to load dashboard data"
                    message={errorMessages || "Failed to load dashboard data"}
                    onRetry={handleRetry}
                />
            </div>
        );
    }

    return (
        <div className={`space-y-4 sm:space-y-6 ${isEmployee ? 'px-1 sm:px-0' : ''}`}>
            <DashboardCharts
                appointmentsData={appointments}
                employeesData={employees}
                visitorsData={visitors}
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
                        ? "Create Appointment Link" 
                        : (hasReachedAppointmentLimit ? "Upgrade Plan" : "Schedule Appointment"),
                }}
                onPrimaryAction={handleScheduleAppointment}
            />

            <QuickActions />

            <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
}

