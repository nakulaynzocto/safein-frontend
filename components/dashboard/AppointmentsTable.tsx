"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/common/dataTable"
import { StatusBadge } from "@/components/common/statusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDateTime } from "@/utils/helpers"
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Building 
} from "lucide-react"

interface AppointmentsTableProps {
  title: string
  description: string
  data: any[]
  isLoading: boolean
  showDateTime?: boolean
  emptyData: {
    title: string
    description: string
    primaryActionLabel: string
  }
  onPrimaryAction: () => void
}

export function AppointmentsTable({
  title,
  description,
  data,
  isLoading,
  showDateTime = false,
  emptyData,
  onPrimaryAction,
}: AppointmentsTableProps) {
  const columns = [
    {
      key: "visitorName",
      header: "Visitor",
      sortable: true,
      render: (appointment: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={appointment.visitor?.photo} alt={appointment.visitorName || "Visitor"} />
            <AvatarFallback>
              {(appointment.visitorName || "V").split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{appointment.visitorName}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              {appointment.visitor?.phone || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "employeeName",
      header: "Meeting With",
      sortable: true,
      render: (appointment: any) => (
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3 w-3" />
          {appointment.employeeName}
        </div>
      ),
    },
    ...(showDateTime
      ? [
          {
            key: "appointmentDate",
            header: "Date & Time",
            sortable: true,
            render: (appointment: any) => (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
              </div>
            ),
          },
        ]
      : [
          {
            key: "appointmentTime",
            header: "Time",
            sortable: true,
            render: (appointment: any) => (
              <div className="text-sm">{appointment.appointmentTime}</div>
            ),
          },
        ]),
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (appointment: any) => <StatusBadge status={appointment.status} />,
    },
  ]

  return (
    <Card className="card-hostinger p-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={`No ${title.toLowerCase()}`}
          showCard={false}
          enableSorting={true}
          emptyData={emptyData}
          onPrimaryAction={onPrimaryAction}
        />
      </CardContent>
    </Card>
  )
}

