"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { useAppSelector } from "@/store/hooks"
import { useGetAppointmentsQuery } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { formatDateTime } from "@/utils/helpers"
import { Calendar, Users, Clock, UserPlus, CalendarPlus } from "lucide-react"

export function DashboardOverview() {
  const router = useRouter()
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetAppointmentsQuery()
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery()
  const { user } = useAppSelector((state) => state.auth)

  // Calculate statistics
  const totalAppointments = appointments.length
  const pendingAppointments = appointments.filter((apt) => apt.status === "pending").length
  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0]
    return apt.appointmentDate === today
  }).length
  const completedAppointments = appointments.filter((apt) => apt.status === "completed").length

  // Get recent appointments (last 5)
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Get today's appointments
  const todaysAppointments = appointments
    .filter((apt) => {
      const today = new Date().toISOString().split("T")[0]
      return apt.appointmentDate === today
    })
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))

  const appointmentColumns = [
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
    {
      key: "appointmentTime",
      header: "Time",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (appointment: any) => <StatusBadge status={appointment.status} />,
    },
  ]

  const recentAppointmentColumns = [
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
    {
      key: "appointmentDate",
      header: "Date & Time",
      sortable: true,
      render: (appointment: any) => formatDateTime(appointment.appointmentDate, appointment.appointmentTime),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (appointment: any) => <StatusBadge status={appointment.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi, ${user?.name || "User"}!`}
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/appointment/create" prefetch={true}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Appointments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={todaysAppointments}
              columns={appointmentColumns}
              isLoading={appointmentsLoading}
              emptyMessage="No appointments scheduled for today"
              showCard={false}
              enableSorting={true}
              emptyData={{
                title: "No appointments scheduled for today",
                description: "You don't have any appointments scheduled for today.",
                primaryActionLabel: "Schedule Appointment",
              }}
              onPrimaryAction={() => router.push("/appointment/create")}
            />
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Latest appointment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={recentAppointments}
              columns={recentAppointmentColumns}
              isLoading={appointmentsLoading}
              emptyMessage="No recent appointments"
              showCard={false}
              enableSorting={true}
              emptyData={{
                title: "No recent appointments",
                description: "You don't have any recent appointments.",
                primaryActionLabel: "View All Appointments",
              }}
              onPrimaryAction={() => router.push("/appointment/list")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col bg-transparent" variant="outline" asChild>
              <Link href="/appointment/create" prefetch={true}>
                <CalendarPlus className="h-6 w-6 mb-2" />
                Create Appointment
              </Link>
            </Button>
            <Button className="h-20 flex-col bg-transparent" variant="outline" asChild>
              <Link href="/appointment/list" prefetch={true}>
                <Calendar className="h-6 w-6 mb-2" />
                View All Appointments
              </Link>
            </Button>
            <Button className="h-20 flex-col bg-transparent" variant="outline" asChild>
              <Link href="/employee/create" prefetch={true}>
                <UserPlus className="h-6 w-6 mb-2" />
                Add Employee
              </Link>
            </Button>
            <Button className="h-20 flex-col bg-transparent" variant="outline" asChild>
              <Link href="/employee/list" prefetch={true}>
                <Users className="h-6 w-6 mb-2" />
                Manage Employees
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
