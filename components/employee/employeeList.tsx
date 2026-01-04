"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeTable } from "./employeeTable"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus"
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from "@/store/api/employeeApi"
import { useLazyGetAppointmentsQuery } from "@/store/api/appointmentApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { UserPlus, FileSpreadsheet, User } from "lucide-react"
import { BulkImportModal } from "./BulkImportModal"
import { routes } from "@/utils/routes"
import { useDebounce } from "@/hooks/useDebounce"
import Link from "next/link"

export function EmployeeList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  const debouncedSearch = useDebounce(search, 500)
  const { hasReachedEmployeeLimit, refetch: refetchSubscriptionStatus } = useSubscriptionStatus()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)

  const { data: employeeData, isLoading, error, refetch } = useGetEmployeesQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
  })

  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()

  const employees = employeeData?.employees || []
  const pagination = employeeData?.pagination


  const [triggerGetAppointments] = useLazyGetAppointmentsQuery()

  const handleDelete = async (employeeId: string) => {
    try {
      // Check for active appointments before deleting
      const pendingResult = await triggerGetAppointments({
        employeeId,
        status: 'pending',
        limit: 1
      }, true).unwrap()

      if (pendingResult.pagination.totalAppointments > 0) {
        showErrorToast("Cannot delete employee with pending appointments")
        return
      }

      const approvedResult = await triggerGetAppointments({
        employeeId,
        status: 'approved',
        limit: 1
      }, true).unwrap()

      if (approvedResult.pagination.totalAppointments > 0) {
        showErrorToast("Cannot delete employee with approved appointments")
        return
      }

      await deleteEmployee(employeeId).unwrap()
      showSuccessToast("Employee deleted successfully")
      refetch()
      refetchSubscriptionStatus()
    } catch (error: any) {
      if (error?.name === 'ConditionError') return // Handled above
      const errorMessage = error?.data?.message || error?.error || "Failed to delete employee"
      showErrorToast(errorMessage)
    }
  }


  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }


  const handleEmployeeCreated = () => {
    refetch()
    refetchSubscriptionStatus()
  }

  return (
    <div className="space-y-6">
      <Card className="card-hostinger p-3 sm:p-4">
        <CardHeader className="pb-3 sm:pb-4 px-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold flex-1 min-w-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="truncate">Employees</span>
            </CardTitle>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {hasReachedEmployeeLimit ? (
                <>
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap shrink-0"
                  >
                    <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden min-[375px]:inline sm:hidden">Upgrade</span>
                    <span className="hidden sm:inline">Upgrade to Add More</span>
                  </Button>
                  <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                  />
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap shrink-0"
                  >
                    <Link href={routes.privateroute.EMPLOYEECREATE} prefetch>
                      <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="hidden min-[375px]:inline">Add Employee</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkImportModal(true)}
                    className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap shrink-0"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden min-[375px]:inline">Bulk Import</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

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
      />
    </div>
  )
}