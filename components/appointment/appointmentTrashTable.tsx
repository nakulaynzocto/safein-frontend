"use client"

import { useState } from "react"
import { Appointment } from "@/store/api/appointmentApi"
import { useAppointmentTrashOperations } from "@/hooks/useAppointmentOperations"
import { AppointmentTable } from "./appointmentTable"

interface AppointmentTrashTableProps {
  onRefresh?: () => void
}

export function AppointmentTrashTable({ onRefresh }: AppointmentTrashTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const {
    appointments,
    pagination,
    isLoading,
    isRestoring,
    error,
    searchTerm,
    statusFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setSearchTerm,
    setStatusFilter,
    setEmployeeFilter,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    restoreAppointment,
    restoreMultipleAppointments,
    refresh
  } = useAppointmentTrashOperations()

  const handleRestore = async (appointmentId: string) => {
    try {
      await restoreAppointment(appointmentId)
      onRefresh?.()
    } catch (error) {
    }
  }

  const handleBulkRestore = async (appointmentIds: string[]) => {
    try {
      await restoreMultipleAppointments(appointmentIds)
      setSelectedItems([])
      onRefresh?.()
    } catch (error) {
    }
  }

  return (
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
      onStatusFilterChange={(value) => setStatusFilter(value === "all" ? "" : value)}
      onEmployeeFilterChange={(value) => setEmployeeFilter(value === "all" ? "" : value)}
      onDateFromChange={setDateFrom}
      onDateToChange={setDateTo}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onSortChange={setSortBy}
      mode="trash"
      showSelection={true}
      selectedItems={selectedItems}
      onSelectionChange={setSelectedItems}
      onRestore={handleRestore}
      onBulkRestore={handleBulkRestore}
      isRestoring={isRestoring}
      onRefresh={refresh}
      title="Deleted Appointments"
      description="Manage deleted appointments - restore or permanently delete"
    />
  )
}
