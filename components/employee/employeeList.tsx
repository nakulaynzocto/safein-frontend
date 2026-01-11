"use client";

import { useState, useEffect } from "react";
import { ActionButton } from "@/components/common/actionButton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTable } from "./employeeTable";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from "@/store/api/employeeApi";
import { useLazyGetAppointmentsQuery } from "@/store/api/appointmentApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { UserPlus, FileSpreadsheet, User } from "lucide-react";
import { BulkImportModal } from "./BulkImportModal";
import { routes } from "@/utils/routes";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";

export function EmployeeList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 500);
    const { hasReachedEmployeeLimit, refetch: refetchSubscriptionStatus } = useSubscriptionStatus();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);

    const {
        data: employeeData,
        isLoading,
        error,
        refetch,
    } = useGetEmployeesQuery({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
    });

    const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

    const employees = employeeData?.employees || [];
    const pagination = employeeData?.pagination;

    const [triggerGetAppointments] = useLazyGetAppointmentsQuery();

    const handleDelete = async (employeeId: string) => {
        try {
            // Check for active appointments before deleting
            const pendingResult = await triggerGetAppointments(
                {
                    employeeId,
                    status: "pending",
                    limit: 1,
                },
                true,
            ).unwrap();

            if (pendingResult.pagination.totalAppointments > 0) {
                showErrorToast("Cannot delete employee with pending appointments");
                return;
            }

            const approvedResult = await triggerGetAppointments(
                {
                    employeeId,
                    status: "approved",
                    limit: 1,
                },
                true,
            ).unwrap();

            if (approvedResult.pagination.totalAppointments > 0) {
                showErrorToast("Cannot delete employee with approved appointments");
                return;
            }

            await deleteEmployee(employeeId).unwrap();
            showSuccessToast("Employee deleted successfully");
            refetch();
            refetchSubscriptionStatus();
        } catch (error: any) {
            if (error?.name === "ConditionError") return; // Handled above
            const errorMessage = error?.data?.message || error?.error || "Failed to delete employee";
            showErrorToast(errorMessage);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleEmployeeCreated = () => {
        refetch();
        refetchSubscriptionStatus();
    };

    return (
        <div className="space-y-6">


            <BulkImportModal
                open={showBulkImportModal}
                onOpenChange={setShowBulkImportModal}
                onSuccess={handleEmployeeCreated}
            />

            <EmployeeTable
                employees={employees}
                pagination={pagination}
                isLoading={isLoading}
                error={error}
                searchTerm={search}
                currentPage={currentPage}
                pageSize={pageSize}
                onSearchChange={handleSearchChange}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                hasReachedLimit={hasReachedEmployeeLimit}
                onDelete={handleDelete}
                onView={(employee) => { }}
                isDeleting={isDeleting}
                showHeader={false}
                headerActions={
                    hasReachedEmployeeLimit ? (
                        <>
                            <ActionButton
                                onClick={() => setShowUpgradeModal(true)}
                                variant="outline-primary"
                                size="xl"
                                className="flex shrink-0 items-center gap-1 rounded-xl px-4 text-[10px] whitespace-nowrap sm:gap-2 sm:text-sm"
                            >
                                <UserPlus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Upgrade to Add More</span>
                            </ActionButton>
                            <UpgradePlanModal
                                isOpen={showUpgradeModal}
                                onClose={() => setShowUpgradeModal(false)}
                            />
                        </>
                    ) : (
                        <>
                            <ActionButton
                                asChild
                                variant="outline-primary"
                                size="xl"
                                className="flex shrink-0 items-center gap-1 rounded-xl px-4 text-[10px] whitespace-nowrap sm:gap-2 sm:text-sm"
                            >
                                <Link href={routes.privateroute.EMPLOYEECREATE} prefetch>
                                    <UserPlus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Add Employee</span>
                                </Link>
                            </ActionButton>
                            <ActionButton
                                variant="outline-primary"
                                size="xl"
                                onClick={() => setShowBulkImportModal(true)}
                                className="flex shrink-0 items-center gap-1 rounded-xl px-4 text-[10px] whitespace-nowrap sm:gap-2 sm:text-sm"
                            >
                                <FileSpreadsheet className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Bulk Import</span>
                            </ActionButton>
                        </>
                    )
                }
            />
        </div>
    );
}
