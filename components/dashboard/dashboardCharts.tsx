"use client";

import { memo, useMemo } from "react";
import { ImageChart } from "./imageCharts";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, TrendingUp, Activity, TimerOff, CalendarX, LogIn } from "lucide-react";
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
            checked_in = 0,
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
                    | "checked_in"
                    | "rejected"
                    | "time_out";

                if (effectiveStatus === "pending") pending++;
                else if (effectiveStatus === "approved") {
                    approved++;
                    if (apt.checkInTime && !apt.checkOutTime) active++;
                } else if (effectiveStatus === "checked_in") {
                    checked_in++;
                    active++;
                } else if (effectiveStatus === "completed") completed++;
                else if (effectiveStatus === "rejected") rejected++;
                else if (effectiveStatus === "time_out") time_out++;
            }
        });

        return {
            statusData: [
                { value: pending, label: "Pending", color: "#F59E0B", icon: Clock },
                { value: approved, label: "Approved", color: "#10B981", icon: Calendar },
                { value: checked_in, label: "Checked In", color: "#6366F1", icon: LogIn },
                { value: completed, label: "Completed", color: "#3B82F6", icon: Activity },
                { value: rejected, label: "Rejected", color: "#EF4444", icon: CalendarX },
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

        // Prepare structure for hourly (Full 24 Hours)
        const hourly = Array.from({ length: 24 }, (_, i) => {
            const h = i;
            let label = "";
            if (h === 0) label = "12 AM";
            else if (h < 12) label = `${h} AM`;
            else if (h === 12) label = "12 PM";
            else label = `${h - 12} PM`;
            return { value: 0, label, hour: h };
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
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
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
                        <div className="h-[280px] w-full mt-2 sm:h-[350px] sm:mt-4 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={todayStats.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={85}
                                        outerRadius={115}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="label"
                                        animationBegin={0}
                                        animationDuration={1500}
                                    >
                                        {todayStats.statusData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                stroke="transparent"
                                                className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-xl border border-white/20 bg-background/80 backdrop-blur-md p-3 shadow-xl transform transition-all scale-105">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                                                            <span className="text-xs font-bold uppercase text-muted-foreground">
                                                                {data.label}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 text-lg font-extrabold text-foreground">
                                                            {data.value}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        content={({ payload }) => (
                                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
                                                {payload?.map((entry: any, index: number) => (
                                                    <div key={`item-${index}`} className="flex items-center gap-2 group cursor-pointer">
                                                        <div 
                                                            className="h-2.5 w-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
                                                            style={{ backgroundColor: entry.color }} 
                                                        />
                                                        <span className="text-[12px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                                            {entry.payload.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text for Doughnut */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-12 sm:pb-14">
                                <div className="text-3xl font-black sm:text-4xl leading-none tracking-tight text-foreground">
                                    {todayStats.todaysAppointmentsCount}
                                </div>
                                <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                                    Total
                                </div>
                            </div>
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
                        <div className="h-[200px] w-full mt-2 sm:h-[250px] sm:mt-4">
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
                                                    <div className="rounded-xl border border-white/20 bg-background/80 backdrop-blur-md p-3 shadow-xl transform transition-all scale-105">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase font-bold text-muted-foreground tracking-wider">
                                                                {payload[0].payload.label}
                                                            </span>
                                                            <span className="text-lg font-extrabold text-foreground mt-1">
                                                                {payload[0].value} <span className="text-xs font-normal text-muted-foreground">Appts</span>
                                                            </span>
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
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#10B981" }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: "#10B981" }}
                                        fillOpacity={1}
                                        fill="url(#colorDailyAppts)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
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
                        <div className="h-[200px] w-full mt-2 sm:h-[250px] sm:mt-4">
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
                                        tick={{ fill: "#6B7280", fontSize: 8 }}
                                        dy={10}
                                        interval={0}
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
                                                    <div className="rounded-xl border border-white/20 bg-background/80 backdrop-blur-md p-3 shadow-xl transform transition-all scale-105">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase font-bold text-muted-foreground tracking-wider">
                                                                {payload[0].payload.label}
                                                            </span>
                                                            <span className="text-lg font-extrabold text-foreground mt-1">
                                                                {payload[0].value} <span className="text-xs font-normal text-muted-foreground">Visitors</span>
                                                            </span>
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
                                        strokeWidth={3}
                                        dot={{ r: 3, strokeWidth: 2, fill: "#fff", stroke: "#A855F7" }}
                                        activeDot={{ r: 5, strokeWidth: 0, fill: "#A855F7" }}
                                        fillOpacity={1}
                                        fill="url(#colorMonthlyVisitors)"
                                        animationDuration={2500}
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
                        <div className="h-[200px] w-full mt-2 sm:h-[250px] sm:mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                                        dy={10}
                                        interval={2}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-xl border border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur-md p-3 shadow-xl">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.65rem] uppercase font-bold text-muted-foreground">
                                                                Time: {payload[0].payload.label}
                                                            </span>
                                                            <span className="text-base font-extrabold text-foreground">
                                                                {payload[0].value} <span className="text-[10px] font-normal">Entries</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={12}
                                        animationDuration={1500}
                                    >
                                        {hourlyDistributionData.map((entry, index) => {
                                            // Find peak hour to highlight
                                            const isPeak = entry.value === Math.max(...hourlyDistributionData.map(d => d.value)) && entry.value > 0;
                                            return (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={isPeak ? "#06B6D4" : "#22C55E"} 
                                                    fillOpacity={isPeak ? 1 : 0.7}
                                                />
                                            );
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
