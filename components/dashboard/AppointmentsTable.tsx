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
  Building,
  Clock,
  CheckCircle
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
      render: (appointment: any) => {
        const visitor = appointment.visitorId || appointment.visitor;
        const visitorName = visitor?.name || "Unknown Visitor";
        const visitorPhone = visitor?.phone || "N/A";
        const visitorCompany = visitor?.company || "";
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={visitor?.photo} alt={visitorName} />
              <AvatarFallback>
                {visitorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{visitorName}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                {visitorPhone}
              </div>
              {visitorCompany && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Building className="h-3 w-3" />
                  {visitorCompany}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "employeeName",
      header: "Meeting With",
      sortable: true,
      render: (appointment: any) => {
        const employee = appointment.employeeId || appointment.employee;
        const employeeName = employee?.name || "Unknown Employee";
        const employeeEmail = employee?.email || "N/A";
        const employeeDepartment = employee?.department || "";
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{employeeName}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Mail className="h-3 w-3" />
                {employeeEmail}
              </div>
              {employeeDepartment && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Building className="h-3 w-3" />
                  {employeeDepartment}
                </div>
              )}
            </div>
          </div>
        );
      },
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
                {formatDateTime(appointment.appointmentDetails?.scheduledDate, appointment.appointmentDetails?.scheduledTime)}
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
              <div className="text-sm">{appointment.appointmentDetails?.scheduledTime || "N/A"}</div>
            ),
          },
        ]),
    {
      key: "purpose",
      header: "Purpose",
      sortable: true,
      render: (appointment: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{appointment.appointmentDetails?.purpose || "N/A"}</div>
          {appointment.appointmentDetails?.meetingRoom && (
            <div className="text-xs text-gray-500 mt-1">
              <Building className="h-3 w-3 inline mr-1" />
              {appointment.appointmentDetails.meetingRoom}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "checkTimes",
      header: "Check In/Out",
      sortable: false,
      render: (appointment: any) => (
        <div className="text-xs space-y-1">
          {appointment.checkInTime && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>In: {(() => {
                const date = new Date(appointment.checkInTime);
                return isNaN(date.getTime()) ? "Invalid Time" : date.toLocaleTimeString();
              })()}</span>
            </div>
          )}
          {appointment.checkOutTime && (
            <div className="flex items-center gap-1 text-red-600">
              <Clock className="h-3 w-3" />
              <span>Out: {(() => {
                const date = new Date(appointment.checkOutTime);
                return isNaN(date.getTime()) ? "Invalid Time" : date.toLocaleTimeString();
              })()}</span>
            </div>
          )}
          {!appointment.checkInTime && !appointment.checkOutTime && (
            <div className="text-gray-400">Not checked in</div>
          )}
        </div>
      ),
    },
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
