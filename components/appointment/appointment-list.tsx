"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { MobileDataTable } from "@/components/common/mobile-data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } from "@/store/api/appointmentApi"
import { formatDateTime } from "@/utils/helpers"
import { showSuccess, showError } from "@/utils/toaster"
import { CalendarPlus, Check, X, LogOut } from "lucide-react"

export function AppointmentList() {
  const router = useRouter()
  const { data: appointments = [], isLoading } = useGetAppointmentsQuery()
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation()
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | "checkout" | null>(null)

  const handleAction = async () => {
    if (!selectedAppointment || !actionType) return

    try {
      let status: "approved" | "rejected" | "checked-out"
      let message: string

      switch (actionType) {
        case "approve":
          status = "approved"
          message = "Appointment approved successfully"
          break
        case "reject":
          status = "rejected"
          message = "Appointment rejected"
          break
        case "checkout":
          status = "checked-out"
          message = "Visitor checked out successfully"
          break
        default:
          return
      }

      await updateAppointmentStatus({ id: selectedAppointment, status }).unwrap()
      showSuccess(message)
      setActionDialogOpen(false)
      setSelectedAppointment(null)
      setActionType(null)
    } catch (error: any) {
      showError(error?.data?.message || error?.message || "Failed to update appointment")
    }
  }

  const openActionDialog = (appointmentId: string, action: "approve" | "reject" | "checkout") => {
    setSelectedAppointment(appointmentId)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const getActionDialogContent = () => {
    switch (actionType) {
      case "approve":
        return {
          title: "Approve Appointment",
          description: "Are you sure you want to approve this appointment?",
          confirmText: "Approve",
        }
      case "reject":
        return {
          title: "Reject Appointment",
          description: "Are you sure you want to reject this appointment?",
          confirmText: "Reject",
          variant: "destructive" as const,
        }
      case "checkout":
        return {
          title: "Check Out Visitor",
          description: "Are you sure you want to check out this visitor?",
          confirmText: "Check Out",
        }
      default:
        return {
          title: "",
          description: "",
          confirmText: "",
        }
    }
  }

  const columns = [
    {
      key: "visitorName",
      header: "Visitor",
      mobileLabel: "Visitor",
      sortable: true,
    },
    {
      key: "employeeName",
      header: "Meeting With",
      mobileLabel: "Employee",
      sortable: true,
    },
    {
      key: "purpose",
      header: "Purpose",
      mobileLabel: "Purpose",
      sortable: true,
    },
    {
      key: "appointmentDate",
      header: "Date & Time",
      mobileLabel: "Date & Time",
      sortable: true,
      render: (appointment: any) => formatDateTime(appointment.appointmentDate, appointment.appointmentTime),
    },
    {
      key: "status",
      header: "Status",
      mobileLabel: "Status",
      sortable: true,
      render: (appointment: any) => <StatusBadge status={appointment.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      mobileLabel: "Actions",
      render: (appointment: any) => (
        <div className="flex gap-1">
          {appointment.status === "pending" && (
            <>
              <Button size="sm" variant="outline" onClick={() => openActionDialog(appointment.id, "approve")}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => openActionDialog(appointment.id, "reject")}>
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
          {appointment.status === "approved" && (
            <Button size="sm" variant="outline" onClick={() => openActionDialog(appointment.id, "checkout")}>
              <LogOut className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const dialogContent = getActionDialogContent()


  const emptyData = {
    title: "No appointments found",
    primaryActionLabel: "New appointment",
    description: "You don't have any appointments scheduled. Create a new appointment to get started.",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Manage visitor appointments">
        <Button asChild>
          <Link href="/appointment/create">
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </PageHeader>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable 
          data={appointments} 
          columns={columns} 
          isLoading={isLoading} 
          emptyData={emptyData}
          enableSorting={true}
          onPrimaryAction={() => router.push("/appointment/create")}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <MobileDataTable 
          data={appointments} 
          columns={columns} 
          isLoading={isLoading} 
          emptyData={emptyData}
          onPrimaryAction={() => router.push("/appointment/create")}
        />
      </div>

      <ConfirmationDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        title={dialogContent.title}
        description={dialogContent.description}
        confirmText={dialogContent.confirmText}
        variant={dialogContent.variant}
        onConfirm={handleAction}
      />
    </div>
  )
}
