"use client"

import { useMemo } from "react"
import { ImageChart } from "./imageCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, TrendingUp, Activity, TimerOff } from "lucide-react"
import { getAppointmentStatus } from "@/utils/helpers"

interface DashboardChartsProps {
  appointmentsData?: any[]
  employeesData?: any[]
  visitorsData?: any[]
  dateRange?: { startDate: string | null; endDate: string | null }
}

export function DashboardCharts({ 
  appointmentsData = [], 
  employeesData = [], 
  visitorsData = [],
  dateRange
}: DashboardChartsProps) {
  const filteredAppointments = appointmentsData
  const appointmentStatusData = useMemo(() => {
    const statusCounts = filteredAppointments.reduce((acc, apt) => {
      const effectiveStatus = getAppointmentStatus(apt as any) as 'pending' | 'approved' | 'completed' | 'rejected' | 'time_out'
      const statusKey = effectiveStatus === 'time_out' ? 'time_out' : effectiveStatus
      acc[statusKey] = (acc[statusKey] ?? 0) + 1
      return acc
    }, {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      time_out: 0,
    } as Record<string, number>)
    
    return [
      { value: statusCounts.pending, label: 'Pending', color: '#F59E0B', icon: Clock },
      { value: statusCounts.approved, label: 'Approved', color: '#10B981', icon: Calendar },
      { value: statusCounts.completed, label: 'Completed', color: '#3B82F6', icon: Activity },
      { value: statusCounts.rejected, label: 'Rejected', color: '#EF4444', icon: Clock },
      { value: statusCounts.time_out, label: 'Time Out', color: '#F97316', icon: TimerOff },
    ]
  }, [filteredAppointments])

  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth - (11 - i) + 12) % 12
      const year = currentMonth - (11 - i) < 0 ? currentYear - 1 : currentYear
      const monthName = `${months[monthIndex]} ${year}`
      
      const monthAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDetails?.scheduledDate ?? apt.createdAt)
        return aptDate.getMonth() === monthIndex && aptDate.getFullYear() === year
      }).length
      
      return { value: monthAppointments, label: monthName }
    })
  }, [filteredAppointments])
  const dailyAppointmentsData = useMemo(() => {
    const today = new Date()
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      
      const dayAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDetails?.scheduledDate ?? apt.createdAt)
        return aptDate >= dayStart && aptDate < dayEnd
      }).length
      
      return {
        value: dayAppointments,
        label: dateStr,
        date: new Date(date)
      }
    })
  }, [filteredAppointments])

  const hourlyDistributionData = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const hour = 9 + i
      const hourLabel = hour <= 12 ? `${hour} AM` : `${hour - 12} PM`
      
      const hourAppointments = filteredAppointments.filter(apt => {
        const aptTime = apt.appointmentDetails?.scheduledTime
        if (!aptTime) return false
        
        const [hours] = aptTime.split(':').map(Number)
        return hours === hour
      }).length
      
      return { value: hourAppointments, label: hourLabel }
    })
  }, [filteredAppointments])


  const performanceMetricsData = useMemo((): Array<{ value: number; label: string; color: string }> => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    const currentYear = new Date().getFullYear()
    
    return quarters.map((quarter, index) => {
      const startMonth = index * 3
      const endMonth = startMonth + 2
      
      const quarterAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDetails?.scheduledDate ?? apt.createdAt)
        const month = aptDate.getMonth()
        const year = aptDate.getFullYear()
        
        return year === currentYear && month >= startMonth && month <= endMonth
      }).length
      
      return {
        value: quarterAppointments,
        label: quarter,
        color: colors[index]
      }
    })
  }, [filteredAppointments])

  const activeVisitors = useMemo(() => 
    filteredAppointments.filter(apt => 
      apt.status === 'approved' && apt.checkInTime && !apt.checkOutTime
    ).length,
    [filteredAppointments]
  )

  const todaysAppointments = useMemo(() => 
    filteredAppointments.length,
    [filteredAppointments]
  )

  const averageWaitTime = useMemo(() => {
    const appointmentsWithCheckout = filteredAppointments.filter(apt => apt.checkInTime && apt.checkOutTime)
    if (appointmentsWithCheckout.length === 0) return 0
    
    return appointmentsWithCheckout.reduce((total, apt) => {
      const checkIn = new Date(apt.checkInTime)
      const checkOut = new Date(apt.checkOutTime)
      const duration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60)
      return total + duration
    }, 0) / appointmentsWithCheckout.length
  }, [filteredAppointments])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <ImageChart
          title="Appointment Status"
          description="Current status distribution of all appointments"
          data={appointmentStatusData}
          type="donut"
        />
        
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              Monthly Visitor Trend
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Visitor count trend over the last 12 months
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            {monthlyTrendData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No monthly data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyTrendData.map((item, index) => {
                  const maxValue = Math.max(...monthlyTrendData.map(d => d.value), 1)
                  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="text-gray-600">{item.value} visitors</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Daily Appointments Trend
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Appointments over the last 7 days
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            {dailyAppointmentsData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No appointment data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyAppointmentsData.map((item, index) => {
                  const maxValue = Math.max(...dailyAppointmentsData.map(d => d.value), 1)
                  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                  const isToday = item.date.toDateString() === new Date().toDateString()
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                          {item.label} {isToday && '(Today)'}
                        </span>
                        <span className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                          {item.value} {item.value === 1 ? 'appointment' : 'appointments'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${isToday ? 'bg-blue-500' : 'bg-blue-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Hourly Distribution
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Peak visiting hours throughout the day</p>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            {hourlyDistributionData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No hourly data available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hourlyDistributionData.map((item, index) => {
                  const maxValue = Math.max(...hourlyDistributionData.map(d => d.value), 1)
                  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="text-gray-600">{item.value} visitors</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
              Quarterly Performance
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Performance metrics by quarter</p>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            {performanceMetricsData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No quarterly data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {performanceMetricsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Real-time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-full flex-shrink-0">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">Active Visitors</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Currently in building</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600 flex-shrink-0">{activeVisitors}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-full shrink-0">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {dateRange?.startDate && dateRange?.endDate 
                        ? (dateRange.startDate === dateRange.endDate 
                            ? "Today's Appointments" 
                            : "Filtered Appointments")
                        : "Today's Appointments"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {dateRange?.startDate && dateRange?.endDate && dateRange.startDate !== dateRange.endDate
                        ? `From ${dateRange.startDate} to ${dateRange.endDate}`
                        : "Scheduled meetings"}
                    </p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-600 shrink-0">{todaysAppointments}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-orange-50 rounded-lg gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-orange-500 rounded-full flex-shrink-0">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">Average Wait Time</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Minutes per visitor</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-orange-600 flex-shrink-0">{averageWaitTime.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




