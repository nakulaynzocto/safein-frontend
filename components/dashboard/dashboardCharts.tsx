"use client"

import { ImageChart } from "./imageCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, MapPin, TrendingUp, Activity } from "lucide-react"

interface DashboardChartsProps {
  appointmentsData?: any[]
  employeesData?: any[]
  visitorsData?: any[]
}

export function DashboardCharts({ appointmentsData = [], employeesData = [], visitorsData = [] }: DashboardChartsProps) {
  // Process data for different chart types
  const appointmentStatusData = [
    { value: appointmentsData.filter(apt => apt.status === 'pending').length, label: 'Pending', color: '#F59E0B', icon: Clock },
    { value: appointmentsData.filter(apt => apt.status === 'approved').length, label: 'Approved', color: '#10B981', icon: Calendar },
    { value: appointmentsData.filter(apt => apt.status === 'completed').length, label: 'Completed', color: '#3B82F6', icon: Activity },
    { value: appointmentsData.filter(apt => apt.status === 'rejected').length, label: 'Rejected', color: '#EF4444', icon: Clock },
  ]

  // Generate monthly trend data from appointments
  const generateMonthlyTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const monthlyData = []
    
    for (let i = 0; i < 8; i++) {
      const monthIndex = (currentMonth - 7 + i + 12) % 12
      const monthName = months[monthIndex]
      
      // Count appointments for this month
      const monthAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointmentDetails?.scheduledDate || apt.createdAt)
        return aptDate.getMonth() === monthIndex
      }).length
      
      monthlyData.push({ value: monthAppointments, label: monthName })
    }
    
    return monthlyData
  }

  const monthlyTrendData = generateMonthlyTrendData()

  // Generate visitor type data from visitors
  const generateVisitorTypeData = () => {
    const visitorTypes: { [key: string]: number } = {}
    
    visitorsData.forEach(visitor => {
      const purpose = visitor.designation || 'General'
      visitorTypes[purpose] = (visitorTypes[purpose] || 0) + 1
    })
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
    let colorIndex = 0
    
    return Object.entries(visitorTypes).map(([type, count]) => ({
      value: count as number,
      label: type,
      color: colors[colorIndex++ % colors.length],
      icon: Users
    }))
  }

  const visitorTypeData = generateVisitorTypeData()

  // Generate hourly distribution from appointments
  const generateHourlyDistributionData = () => {
    const hourlyData = Array.from({ length: 9 }, (_, i) => {
      const hour = 9 + i
      const hourLabel = hour <= 12 ? `${hour} AM` : `${hour - 12} PM`
      
      const hourAppointments = appointmentsData.filter(apt => {
        const aptTime = apt.appointmentDetails?.scheduledTime
        if (!aptTime) return false
        
        const [hours] = aptTime.split(':').map(Number)
        return hours === hour
      }).length
      
      return { value: hourAppointments, label: hourLabel }
    })
    
    return hourlyData
  }

  const hourlyDistributionData = generateHourlyDistributionData()

  // Generate department data from employees
  const generateDepartmentData = () => {
    const departmentCounts: { [key: string]: number } = {}
    
    employeesData.forEach(employee => {
      const dept = employee.department || 'Other'
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1
    })
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    let colorIndex = 0
    
    return Object.entries(departmentCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([dept, count]) => ({
        value: count as number,
        label: dept,
        color: colors[colorIndex++ % colors.length]
      }))
  }

  const departmentData = generateDepartmentData()

  // Generate quarterly performance data from appointments
  const generatePerformanceData = (): Array<{ value: number; label: string; color: string }> => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    const currentYear = new Date().getFullYear()
    const performanceData: Array<{ value: number; label: string; color: string }> = []
    
    quarters.forEach((quarter, index) => {
      const startMonth = index * 3
      const endMonth = startMonth + 2
      
      const quarterAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointmentDetails?.scheduledDate || apt.createdAt)
        const month = aptDate.getMonth()
        const year = aptDate.getFullYear()
        
        return year === currentYear && month >= startMonth && month <= endMonth
      }).length
      
      performanceData.push({
        value: quarterAppointments,
        label: quarter,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index]
      })
    })
    
    return performanceData
  }

  const performanceMetricsData = generatePerformanceData()

  // Calculate real-time metrics
  const activeVisitors = appointmentsData.filter(apt => 
    apt.status === 'approved' && apt.checkInTime && !apt.checkOutTime
  ).length

  const todaysAppointments = appointmentsData.filter(apt => {
    const aptDate = new Date(apt.appointmentDetails?.scheduledDate || apt.createdAt)
    const today = new Date()
    return aptDate.toDateString() === today.toDateString()
  }).length

  const averageWaitTime = appointmentsData
    .filter(apt => apt.checkInTime && apt.checkOutTime)
    .reduce((total, apt) => {
      const checkIn = new Date(apt.checkInTime)
      const checkOut = new Date(apt.checkOutTime)
      const duration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60) // minutes
      return total + duration
    }, 0) / Math.max(appointmentsData.filter(apt => apt.checkInTime && apt.checkOutTime).length, 1)

  return (
    <div className="space-y-6">
      {/* Top Row - Status Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ImageChart
          title="Appointment Status"
          description="Current status distribution of all appointments"
          data={appointmentStatusData}
          type="donut"
        />
        
        <ImageChart
          title="Monthly Visitor Trend"
          description="Visitor count trend over the past 8 months"
          data={monthlyTrendData}
          type="line"
        />
      </div>

      {/* Middle Row - Visitor Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ImageChart
          title="Visitor Types"
          description="Distribution by visitor purpose"
          data={visitorTypeData}
          type="bar"
        />
        
        <ImageChart
          title="Hourly Distribution"
          description="Peak visiting hours throughout the day"
          data={hourlyDistributionData}
          type="area"
        />
        
        <ImageChart
          title="Department Visits"
          description="Most visited departments"
          data={departmentData}
          type="scatter"
        />
      </div>

      {/* Bottom Row - Performance & Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ImageChart
          title="Quarterly Performance"
          description="Performance metrics by quarter"
          data={performanceMetricsData}
          type="bar"
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Real-time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-full">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Active Visitors</p>
                    <p className="text-sm text-gray-600">Currently in building</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{activeVisitors}</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-full">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Today's Appointments</p>
                    <p className="text-sm text-gray-600">Scheduled meetings</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">{todaysAppointments}</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-full">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Average Wait Time</p>
                    <p className="text-sm text-gray-600">Minutes per visitor</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">{averageWaitTime.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




