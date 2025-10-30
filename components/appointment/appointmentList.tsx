"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/pageHeader"
import { useAppointmentOperations } from "@/hooks/useAppointmentOperations"
import { CalendarPlus, Archive } from "lucide-react"
import { routes } from "@/utils/routes"
import { AppointmentTable } from "./appointmentTable"
import { Appointment } from "@/store/api/appointmentApi"

export function AppointmentList() {
  const router = useRouter()
  
  // Single local state object for initial filters/pagination
  const [initials, setInitials] = useState({
    page: 1,
    limit: 10,
    status: "",
    employeeId: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  
  // Use the custom hook for appointment operations
  const {
    appointments,
    pagination,
    isLoading,
    error,
    isDeleting,
    isCheckingOut,
    isApproving,
    isCancelling,
    deleteAppointment,
    checkOutAppointment,
    approveAppointment,
    cancelAppointment,
    refresh,
    setSearchTerm,
    searchTerm,
    setCurrentPage,
    setPageSize,
    setStatusFilter,
    setEmployeeFilter,
    setDateFrom,
    setDateTo,
    setSortBy,
    setSortOrder,
    statusFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
  } = useAppointmentOperations({
    initialPage: initials.page,
    initialLimit: initials.limit,
    initialStatus: initials.status,
    initialEmployeeId: initials.employeeId,
    initialDateFrom: initials.dateFrom,
    initialDateTo: initials.dateTo,
    initialSortBy: initials.sortBy,
    initialSortOrder: initials.sortOrder,
  })

  const handleDelete = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId)
    } catch (error) {
      console.error("Delete error:", error)
    }
  }


  const handleCheckOut = async (appointmentId: string, notes?: string) => {
    try {
      await checkOutAppointment(appointmentId, notes)
    } catch (error) {
      console.error("Check-out error:", error)
    }
  }

  const handleApprove = async (appointmentId: string) => {
    try {
      await approveAppointment(appointmentId)
    } catch (error) {
      console.error("Approve error:", error)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId)
    } catch (error) {
      console.error("Cancel error:", error)
    }
  }

  const handleView = (appointment: Appointment) => {
    router.push(`/appointment/${appointment._id}`)
  }

  const handleStatusFilterChange = (value: string) => {
    const next = value === "all" ? "" : value
    setInitials(prev => ({ ...prev, status: next, page: 1 }))
    setStatusFilter(next)
    setCurrentPage(1)
  }

  const handleEmployeeFilterChange = (value: string) => {
    const next = value === "all" ? "" : value
    setInitials(prev => ({ ...prev, employeeId: next, page: 1 }))
    setEmployeeFilter(next)
    setCurrentPage(1)
  }

  const handleSortChange = (field: string) => {
    setInitials(prev => ({ ...prev, sortBy: field }))
    setSortBy(field)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="space-y-6">
      <AppointmentTable
        mode="active"
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
        onDelete={handleDelete}
        onCheckOut={handleCheckOut}
        onApprove={handleApprove}
        onView={handleView}
        onRefresh={refresh}
        isDeleting={isDeleting}
        isCheckingOut={isCheckingOut}
        isApproving={isApproving}
        title="Appointments"
        description="Manage visitor appointments and check-ins"
      />
    </div>
  )
}
