"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppointmentOperations } from "@/hooks/useAppointmentOperations";
import { AppointmentTable } from "./appointmentTable";
import { Appointment, useGetAppointmentsQuery } from "@/store/api/appointmentApi";
import { StatsGrid } from "@/components/dashboard/statsGrid";
import { calculateAppointmentStats } from "@/components/dashboard/dashboardUtils";

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

    // Separate query for stats (fetch reasonable amount for accurate counts)
    // Reduced from 1000 to 200 for better performance
    const { data: statsData } = useGetAppointmentsQuery({
        page: 1,
        limit: 200, // Reduced from 1000 - sufficient for stats calculation
        timezoneOffsetMinutes,
    });

    const stats = useMemo(() => {
        const allAppointments = statsData?.appointments || [];
        return calculateAppointmentStats(allAppointments);
    }, [statsData?.appointments]);

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
