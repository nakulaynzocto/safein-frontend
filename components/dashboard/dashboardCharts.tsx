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
    { value: appointmentsData.filter(apt => apt.status === 'cancelled').length, label: 'Cancelled', color: '#EF4444', icon: Clock },
  ]

  const monthlyTrendData = [
    { value: 45, label: 'Jan' },
    { value: 52, label: 'Feb' },
    { value: 38, label: 'Mar' },
    { value: 67, label: 'Apr' },
    { value: 73, label: 'May' },
    { value: 89, label: 'Jun' },
    { value: 95, label: 'Jul' },
    { value: 78, label: 'Aug' },
  ]

  const visitorTypeData = [
    { value: 120, label: 'Business', color: '#3B82F6', icon: Users },
    { value: 85, label: 'Personal', color: '#10B981', icon: Users },
    { value: 45, label: 'Delivery', color: '#F59E0B', icon: MapPin },
    { value: 32, label: 'Maintenance', color: '#8B5CF6', icon: Activity },
  ]

  const hourlyDistributionData = [
    { value: 12, label: '9 AM' },
    { value: 25, label: '10 AM' },
    { value: 38, label: '11 AM' },
    { value: 45, label: '12 PM' },
    { value: 52, label: '1 PM' },
    { value: 48, label: '2 PM' },
    { value: 35, label: '3 PM' },
    { value: 28, label: '4 PM' },
    { value: 18, label: '5 PM' },
  ]

  const departmentData = [
    { value: 45, label: 'HR', color: '#3B82F6' },
    { value: 38, label: 'IT', color: '#10B981' },
    { value: 32, label: 'Finance', color: '#F59E0B' },
    { value: 28, label: 'Marketing', color: '#EF4444' },
    { value: 22, label: 'Operations', color: '#8B5CF6' },
  ]

  const performanceMetricsData = [
    { value: 85, label: 'Q1', color: '#3B82F6' },
    { value: 92, label: 'Q2', color: '#10B981' },
    { value: 78, label: 'Q3', color: '#F59E0B' },
    { value: 96, label: 'Q4', color: '#EF4444' },
  ]

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
                <div className="text-2xl font-bold text-blue-600">12</div>
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
                <div className="text-2xl font-bold text-green-600">28</div>
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
                <div className="text-2xl font-bold text-orange-600">8.5</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




