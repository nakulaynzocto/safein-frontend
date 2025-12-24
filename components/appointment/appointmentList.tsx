"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppointmentOperations } from "@/hooks/useAppointmentOperations"
import { AppointmentTable } from "./appointmentTable"
import { Appointment } from "@/store/api/appointmentApi"

export function AppointmentList() {
  const router = useRouter()
  
  const {
    appointments,
    pagination,
    isLoading,
    error,
    isDeleting,
    isCheckingOut,
    isApproving,
    deleteAppointment,
    checkOutAppointment,
    approveAppointment,
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
  } = useAppointmentOperations()

  const handleView = useCallback((appointment: Appointment) => {
    router.push(`/appointment/${appointment._id}`)
  }, [router])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value === "all" ? "" : value)
  }, [setStatusFilter])

  const handleEmployeeFilterChange = useCallback((value: string) => {
    setEmployeeFilter(value === "all" ? "" : value)
  }, [setEmployeeFilter])

  const handleSortChange = useCallback((field: string) => {
    setSortBy(field)
  }, [setSortBy])

  return (
    <div className="space-y-6">
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
        onView={handleView}
        isDeleting={isDeleting}
        isCheckingOut={isCheckingOut}
        isApproving={isApproving}
        title="Appointments"
      />
    </div>
  )
}
