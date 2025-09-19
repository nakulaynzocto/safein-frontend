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
  
  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Use the custom hook for appointment operations
  const {
    appointments,
    pagination,
    isLoading,
    error,
    deleteAppointment,
    checkInAppointment,
    checkOutAppointment,
    refresh
  } = useAppointmentOperations({
    initialPage: currentPage,
    initialLimit: pageSize,
    initialSearch: search,
    initialStatus: statusFilter,
    initialEmployeeId: employeeFilter,
    initialDateFrom: dateFrom,
    initialDateTo: dateTo,
    initialSortBy: sortBy,
    initialSortOrder: sortOrder
  })

  const handleDelete = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId)
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await checkInAppointment(appointmentId)
    } catch (error) {
      console.error("Check-in error:", error)
    }
  }

  const handleCheckOut = async (appointmentId: string) => {
    try {
      await checkOutAppointment(appointmentId)
    } catch (error) {
      console.error("Check-out error:", error)
    }
  }

  const handleView = (appointment: Appointment) => {
    router.push(`/appointment/${appointment._id}`)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleEmployeeFilterChange = (value: string) => {
    setEmployeeFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleSortChange = (field: string) => {
    setSortBy(field)
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Manage visitor appointments">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={routes.privateroute.APPOINTMENTTRASH} prefetch={true}>
              <Archive className="mr-2 h-4 w-4" />
              View Trash
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={routes.privateroute.VISITORREGISTRATION} prefetch={true}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Visitor Registration
            </Link>
          </Button>
          <Button asChild>
            <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch={true}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </PageHeader>

      <AppointmentTable
        mode="active"
        appointments={appointments}
        pagination={pagination || undefined}
        isLoading={isLoading}
        error={error}
        searchTerm={search}
        statusFilter={statusFilter}
        employeeFilter={employeeFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        currentPage={currentPage}
        pageSize={pageSize}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onStatusFilterChange={handleStatusFilterChange}
        onEmployeeFilterChange={handleEmployeeFilterChange}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSortChange={handleSortChange}
        onDelete={handleDelete}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onView={handleView}
        onRefresh={refresh}
        title="Appointments"
        description="Manage visitor appointments and check-ins"
      />
    </div>
  )
}
