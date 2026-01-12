"use client";

import { memo, useMemo } from "react";
import { Calendar, CalendarCheck, CalendarX, CheckCircle } from "lucide-react";
import { StatCard } from "./statCard";
import { AppointmentStats } from "./dashboardUtils";

interface StatsGridProps {
    stats: AppointmentStats;
    onStatusClick?: (status: string) => void;
    currentFilter?: string;
}

/**
 * StatsGrid component displays statistics cards for appointments
 * Optimized with React.memo and useMemo for performance
 * Mobile-responsive: 1 column on mobile, 2 on tablet, 4 on desktop
 */
export const StatsGrid = memo(function StatsGrid({ stats, onStatusClick, currentFilter }: StatsGridProps) {
    const statCards = useMemo(
        () => [
            {
                title: "Pending",
                statusKey: "pending",
                value: stats.pendingAppointments,
                icon: CalendarCheck,
                description: "Awaiting approval",
                colorClassName: "text-amber-600",
                bgClassName: "bg-muted/80 border-gray-200 shadow-sm hover:shadow-md hover:border-[#3882a5] transition-all",
            },
            {
                title: "Approved",
                statusKey: "approved",
                value: stats.approvedAppointments,
                icon: CheckCircle,
                description: "Scheduled appointments",
                colorClassName: "text-emerald-600",
                bgClassName: "bg-muted/80 border-gray-200 shadow-sm hover:shadow-md hover:border-[#3882a5] transition-all",
            },
            {
                title: "Completed",
                statusKey: "completed",
                value: stats.completedAppointments,
                icon: CalendarX,
                description: "Finished appointments",
                colorClassName: "text-[#3882a5]",
                bgClassName: "bg-muted/80 border-gray-200 shadow-sm hover:shadow-md hover:border-[#3882a5] transition-all",
            },
            {
                title: "Rejected",
                statusKey: "rejected",
                value: stats.rejectedAppointments,
                icon: CalendarX,
                description: "Rejected appointments",
                colorClassName: "text-red-600",
                bgClassName: "bg-muted/80 border-gray-200 shadow-sm hover:shadow-md hover:border-[#3882a5] transition-all",
            },
        ],
        [
            stats.pendingAppointments,
            stats.approvedAppointments,
            stats.completedAppointments,
            stats.rejectedAppointments,
        ],
    );

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
                <StatCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    description={card.description}
                    colorClassName={card.colorClassName}
                    bgClassName={card.bgClassName}
                    onClick={() => onStatusClick?.(card.statusKey)}
                    isActive={currentFilter === card.statusKey}
                />
            ))}
        </div>
    );
});
