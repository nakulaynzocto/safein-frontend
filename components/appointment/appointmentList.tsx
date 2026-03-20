"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppointmentOperations } from "@/hooks/useAppointmentOperations";
import { AppointmentTable } from "./appointmentTable";
import { Appointment, useGetAppointmentStatsQuery } from "@/store/api/appointmentApi";
import { StatsGrid } from "@/components/dashboard/statsGrid";

export function AppointmentList() {
    const router = useRouter();

    const {
        appointments,
        pagination,
        isLoading,
        error,
        isDeleting,
        isCheckingIn,
        isCheckingOut,
        isApproving,
        isRejecting,
        deleteAppointment,
        checkInAppointment,
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

    // Build the same filter params as the table so count cards stay in sync
    const statsParams = useMemo(() => {
        const p: { dateFrom?: string; dateTo?: string; search?: string; employeeId?: string } = {};
        if (searchTerm) p.search = searchTerm;
        if (dateFrom) p.dateFrom = dateFrom;
        if (dateTo) p.dateTo = dateTo;
        if (employeeFilter) p.employeeId = employeeFilter;
        return Object.keys(p).length > 0 ? p : undefined;
    }, [searchTerm, dateFrom, dateTo, employeeFilter]);

    const { data: appointmentStatsData } = useGetAppointmentStatsQuery(statsParams, {
        refetchOnMountOrArgChange: true,
    });

    const stats = useMemo(() => {
        if (!appointmentStatsData) {
            return {
                totalAppointments: 0,
                pendingAppointments: 0,
                approvedAppointments: 0,
                rejectedAppointments: 0,
                completedAppointments: 0,
                checkedInAppointments: 0,
                timeOutAppointments: 0,
                todaysAppointments: 0,
            };
        }

        return {
            totalAppointments: appointmentStatsData.total || 0,
            pendingAppointments: appointmentStatsData.pending || 0,
            approvedAppointments: appointmentStatsData.approved || 0,
            rejectedAppointments: appointmentStatsData.rejected || 0,
            completedAppointments: appointmentStatsData.completed || 0,
            checkedInAppointments: appointmentStatsData.checked_in || 0,
            timeOutAppointments: appointmentStatsData.time_out || 0,
            todaysAppointments: 0,
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
                onCheckIn={checkInAppointment}
                onCheckOut={checkOutAppointment}
                onApprove={approveAppointment}
                onReject={rejectAppointment}
                onView={handleView}
                isDeleting={isDeleting}
                isCheckingIn={isCheckingIn}
                isCheckingOut={isCheckingOut}
                isApproving={isApproving}
                isRejecting={isRejecting}
                title="Appointments"
            />
        </div>
    );
}
