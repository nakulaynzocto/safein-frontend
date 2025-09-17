"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDateTime } from "@/utils/helpers"

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
    },
    {
      key: "employeeName",
      header: "Meeting With",
      sortable: true,
    },
    ...(showDateTime
      ? [
          {
            key: "appointmentDate",
            header: "Date & Time",
            sortable: true,
            render: (appointment: any) => formatDateTime(appointment.appointmentDate, appointment.appointmentTime),
          },
        ]
      : [
          {
            key: "appointmentTime",
            header: "Time",
            sortable: true,
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
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

