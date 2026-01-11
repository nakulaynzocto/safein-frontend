"use client";

import { memo, useMemo } from "react";
import { ImageChart } from "./imageCharts";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
} from "recharts";
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
                {/* Chart 1: Today's Appointment Status - Styled as Blue Bar Chart (User Growth Style) */}
                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6 pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <Activity className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
                            Today's Appointment Status
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Current status distribution of today's appointments
                        </p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={todayStats.statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "transparent" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    {payload[0].payload.label}
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                        {todayStats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || "#3B82F6"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Chart 2: Daily Appointments Trend - Styled as Green Area Chart (Revenue Growth Style) */}
                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6 pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <Calendar className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                            Daily Appointments Trend
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">Appointments over the last 7 days</p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyAppointmentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDailyAppts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    {payload[0].payload.label}
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorDailyAppts)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6 pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <TrendingUp className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
                            Monthly Visitor Trend (Last 12 Months)
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Visitor count trend over the last 12 months
                        </p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMonthlyVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    {payload[0].payload.label}
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#A855F7"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorMonthlyVisitors)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-3 sm:p-4 md:p-6 pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                            <Clock className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                            Hourly Distribution
                        </CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Peak visiting hours over the last 30 days
                        </p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        dy={10}
                                        interval={2}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "transparent" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    {payload[0].payload.label}
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20} fill="#22C55E" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
