"use client";

import { memo, useMemo } from "react";
import { Calendar, CalendarCheck, CalendarX, CheckCircle, TimerOff } from "lucide-react";
import { StatCard } from "./statCard";
import { AppointmentStats } from "./dashboardUtils";

interface StatsGridProps {
    stats: AppointmentStats;
}

/**
 * StatsGrid component displays statistics cards for appointments
 * Optimized with React.memo and useMemo for performance
 * Mobile-responsive: 1 column on mobile, 2 on tablet, 4 on desktop
 */
export const StatsGrid = memo(function StatsGrid({ stats }: StatsGridProps) {
    const statCards = useMemo(
        () => [
            {
                title: "Pending",
                value: stats.pendingAppointments,
                icon: CalendarCheck,
                description: "Awaiting approval",
            },
            {
                title: "Approved",
                value: stats.approvedAppointments,
                icon: CheckCircle,
                description: "Scheduled appointments",
            },
            {
                title: "Completed",
                value: stats.completedAppointments,
                icon: CalendarX,
                description: "Finished appointments",
            },
            {
                title: "Rejected",
                value: stats.rejectedAppointments,
                icon: CalendarX, // Or a more specific icon if preferred, using CalendarX for now like completed
                description: "Rejected appointments",
            },
            {
                title: "Time Out",
                value: stats.timeOutAppointments,
                icon: TimerOff,
                description: "Timed out appointments",
            },
        ],
        [
            stats.pendingAppointments,
            stats.approvedAppointments,
            stats.completedAppointments,
            stats.rejectedAppointments,
            stats.timeOutAppointments,
        ],
    );

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {statCards.map((card) => (
                <StatCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    description={card.description}
                />
            ))}
        </div>
    );
});
