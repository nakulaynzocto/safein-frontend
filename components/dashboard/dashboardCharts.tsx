"use client";

import { memo, useMemo } from "react";
import { ImageChart } from "./imageCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, TrendingUp, Activity, TimerOff, CalendarX } from "lucide-react";
import { getAppointmentStatus } from "@/utils/helpers";

interface DashboardChartsProps {
    appointmentsData?: any[];
    employeesData?: any[];
    visitorsData?: any[];
    dateRange?: { startDate: string | null; endDate: string | null };
}

export const DashboardCharts = memo(function DashboardCharts({
    appointmentsData = [],
    employeesData = [],
    visitorsData = [],
    dateRange,
}: DashboardChartsProps) {
    const filteredAppointments = appointmentsData;
    const today = new Date().toDateString();

    // Pre-processed data for today
    const todayStats = useMemo(() => {
        let pending = 0,
            approved = 0,
            completed = 0,
            rejected = 0,
            time_out = 0;
        let active = 0;
        let count = 0;

        filteredAppointments.forEach((apt) => {
            const aptDate = new Date(apt.appointmentDetails?.scheduledDate || apt.createdAt);
            if (aptDate.toDateString() === today) {
                count++;
                const effectiveStatus = getAppointmentStatus(apt as any) as
                    | "pending"
                    | "approved"
                    | "completed"
                    | "rejected"
                    | "time_out";

                if (effectiveStatus === "pending") pending++;
                else if (effectiveStatus === "approved") {
                    approved++;
                    if (apt.checkInTime && !apt.checkOutTime) active++;
                } else if (effectiveStatus === "completed") completed++;
                else if (effectiveStatus === "rejected") rejected++;
                else if (effectiveStatus === "time_out") time_out++;
            }
        });

        return {
            statusData: [
                { value: pending, label: "Pending", color: "#F59E0B", icon: Clock },
                { value: approved, label: "Approved", color: "#10B981", icon: Calendar },
                { value: completed, label: "Completed", color: "#3B82F6", icon: Activity },
                { value: rejected, label: "Rejected", color: "#EF4444", icon: CalendarX },
                { value: time_out, label: "Time Out", color: "#F97316", icon: TimerOff },
            ],
            activeVisitors: active,
            todaysAppointmentsCount: count,
        };
    }, [filteredAppointments, today]);

    // Optimize Trend Data with a single pass
    const { monthlyTrendData, dailyAppointmentsData, hourlyDistributionData } = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Prepare structure for monthly
        const monthly = Array.from({ length: 12 }, (_, i) => {
            const mIdx = (currentMonth - (11 - i) + 12) % 12;
            const y = currentMonth - (11 - i) < 0 ? currentYear - 1 : currentYear;
            return { value: 0, label: `${months[mIdx]} ${y}`, monthIdx: mIdx, year: y };
        });

        // Prepare structure for daily
        const daily = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            return {
                value: 0,
                label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }),
                date: d,
            };
        });

        // Prepare structure for hourly (8 AM to 7 PM)
        const hourly = Array.from({ length: 12 }, (_, i) => {
            const h = 8 + i;
            return { value: 0, label: h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`, hour: h };
        });

        // Single pass for all trend calculations
        filteredAppointments.forEach((apt) => {
            const aptDate = new Date(apt.appointmentDetails?.scheduledDate || apt.createdAt);

            // Monthly distribution
            const mIdx = aptDate.getMonth();
            const y = aptDate.getFullYear();
            const mBucket = monthly.find((m) => m.monthIdx === mIdx && m.year === y);
            if (mBucket) mBucket.value++;

            // Daily distribution
            if (aptDate >= sevenDaysAgo) {
                const dStr = aptDate.toDateString();
                const dBucket = daily.find((d) => d.date.toDateString() === dStr);
                if (dBucket) dBucket.value++;
            }

            // Hourly distribution (last 30 days)
            if (aptDate >= thirtyDaysAgo) {
                let aptHour: number;
                const aptTime = apt.appointmentDetails?.scheduledTime;
                if (aptTime?.includes(":")) {
                    aptHour = Number(aptTime.split(":")[0]);
                } else {
                    aptHour = aptDate.getHours();
                }
                const hBucket = hourly.find((h) => h.hour === aptHour);
                if (hBucket) hBucket.value++;
            }
        });

        return {
            monthlyTrendData: monthly.map(({ value, label }) => ({ value, label })),
            dailyAppointmentsData: daily.map(({ value, label, date }) => ({ value, label, date })),
            hourlyDistributionData: hourly.map(({ value, label }) => ({ value, label })),
        };
    }, [filteredAppointments]);

    const averageWaitTime = useMemo(() => {
        let totalDuration = 0;
        let count = 0;

        filteredAppointments.forEach((apt) => {
            if (apt.checkInTime && apt.checkOutTime) {
                const duration =
                    (new Date(apt.checkOutTime).getTime() - new Date(apt.checkInTime).getTime()) / (1000 * 60);
                totalDuration += duration;
                count++;
            }
        });

        return count === 0 ? 0 : totalDuration / count;
    }, [filteredAppointments]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <ImageChart
                    title="Today's Appointment Status"
                    description="Current status distribution of today's appointments"
                    data={todayStats.statusData}
                    type="donut"
                />

                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <Calendar className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
                            Daily Appointments Trend
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">Appointments over the last 7 days</p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-4 md:p-6">
                        {dailyAppointmentsData.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <p className="text-sm">No appointment data available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dailyAppointmentsData.map((item, index) => {
                                    const maxValue = Math.max(...dailyAppointmentsData.map((d) => d.value), 1);
                                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                    const isToday = item.date.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span
                                                    className={`font-medium ${isToday ? "font-semibold text-blue-600" : "text-gray-700"}`}
                                                >
                                                    {item.label} {isToday && "(Today)"}
                                                </span>
                                                <span
                                                    className={`font-semibold ${isToday ? "text-blue-600" : "text-gray-600"}`}
                                                >
                                                    {item.value} {item.value === 1 ? "appointment" : "appointments"}
                                                </span>
                                            </div>
                                            <div className="h-3 w-full rounded-full bg-gray-200">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${isToday ? "bg-blue-500" : "bg-blue-400"}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <TrendingUp className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
                            Monthly Visitor Trend (Last 12 Months)
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Visitor count trend over the last 12 months
                        </p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-4 md:p-6">
                        {monthlyTrendData.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <p className="text-sm">No monthly data available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {monthlyTrendData.map((item, index) => {
                                    const maxValue = Math.max(...monthlyTrendData.map((d) => d.value), 1);
                                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-gray-700">{item.label}</span>
                                                <span className="text-gray-600">{item.value} visitors</span>
                                            </div>
                                            <div className="h-3 w-full rounded-full bg-gray-200">
                                                <div
                                                    className="h-3 rounded-full bg-purple-500 transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <Clock className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                            Hourly Distribution
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Peak visiting hours over the last 30 days
                        </p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-4 md:p-6">
                        {hourlyDistributionData.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <p className="text-sm">No hourly data available</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {hourlyDistributionData.map((item, index) => {
                                    const maxValue = Math.max(...hourlyDistributionData.map((d) => d.value), 1);
                                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-gray-700">{item.label}</span>
                                                <span className="text-gray-600">{item.value} visitors</span>
                                            </div>
                                            <div className="h-2.5 w-full rounded-full bg-gray-200">
                                                <div
                                                    className="h-2.5 rounded-full bg-green-500 transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
