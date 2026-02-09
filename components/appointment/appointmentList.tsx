"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppointmentOperations } from "@/hooks/useAppointmentOperations";
import { AppointmentTable } from "./appointmentTable";
import { Appointment, useGetAppointmentsQuery, useGetAppointmentStatsQuery } from "@/store/api/appointmentApi";
import { StatsGrid } from "@/components/dashboard/statsGrid";

export function AppointmentList() {
    const router = useRouter();

    const {
        appointments,
        pagination,
        isLoading,
        error,
        isDeleting,
        isCheckingOut,
        isApproving,
        isRejecting,
        deleteAppointment,
        checkOutAppointment,
        approveAppointment,
        rejectAppointment,
        setSearchTerm,
        searchTerm,
        setCurrentPage,
        setPageSize,
        setStatusFilter,
        setEmployeeFilter,
        setDateFrom,
        setDateTo,
        setSortBy,
        statusFilter,
        employeeFilter,
        dateFrom,
        dateTo,
        currentPage,
        pageSize,
        sortBy,
        sortOrder,
    } = useAppointmentOperations();

    const timezoneOffsetMinutes = -new Date().getTimezoneOffset();

    // Optimized: Use stats API instead of fetching 200 appointments
    const { data: appointmentStatsData } = useGetAppointmentStatsQuery();

    const stats = useMemo(() => {
        if (!appointmentStatsData) {
            return {
                totalAppointments: 0,
                pendingAppointments: 0,
                approvedAppointments: 0,
                rejectedAppointments: 0,
                completedAppointments: 0,
                timeOutAppointments: 0,
                todaysAppointments: 0, // Not available from stats API, could be added if needed
            };
        }

        return {
            totalAppointments: appointmentStatsData.total || 0,
            pendingAppointments: appointmentStatsData.pending || 0,
            approvedAppointments: appointmentStatsData.approved || 0,
            rejectedAppointments: appointmentStatsData.rejected || 0,
            completedAppointments: appointmentStatsData.completed || 0,
            timeOutAppointments: appointmentStatsData.cancelled || 0,
            todaysAppointments: 0, // Stats API doesn't filter by today, use total for now
        };
    }, [appointmentStatsData]);

    const handleView = useCallback(
        (appointment: Appointment) => {
            router.push(`/appointment/${appointment._id}`);
        },
        [router],
    );

    const handleStatusFilterChange = useCallback(
        (value: string) => {
            setStatusFilter(value === "all" ? "" : value);
        },
        [setStatusFilter],
    );

    const handleEmployeeFilterChange = useCallback(
        (value: string) => {
            setEmployeeFilter(value === "all" ? "" : value);
        },
        [setEmployeeFilter],
    );

    const handleSortChange = useCallback(
        (field: string) => {
            setSortBy(field);
        },
        [setSortBy],
    );

    const handleStatsCardClick = useCallback(
        (status: string) => {
            if (statusFilter === status) {
                setStatusFilter("");
            } else {
                setStatusFilter(status);
            }
        },
        [statusFilter, setStatusFilter],
    );

    return (
        <div className="space-y-6">
            <StatsGrid
                stats={stats}
                onStatusClick={handleStatsCardClick}
                currentFilter={statusFilter}
            />

            <AppointmentTable
                appointments={appointments}
                pagination={pagination || undefined}
                isLoading={isLoading}
                error={error}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                employeeFilter={employeeFilter}
                dateFrom={dateFrom}
                dateTo={dateTo}
                currentPage={currentPage}
                pageSize={pageSize}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={handleStatusFilterChange}
                onEmployeeFilterChange={handleEmployeeFilterChange}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange}
                onDelete={deleteAppointment}
                onCheckOut={checkOutAppointment}
                onApprove={approveAppointment}
                onReject={rejectAppointment}
                onView={handleView}
                isDeleting={isDeleting}
                isCheckingOut={isCheckingOut}
                isApproving={isApproving}
                isRejecting={isRejecting}
                title="Appointments"
            />
        </div>
    );
}
