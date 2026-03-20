import { cn } from "@/lib/utils";

type StatusVariant =
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default"
    | "indigo"
    | "teal"
    | "orange"
    | "cyan";

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
}

export const getStatusVariant = (status: string): StatusVariant => {
    const normalizedStatus = status.toLowerCase();

    if (["checked_in"].includes(normalizedStatus)) return "indigo";
    if (["scheduled"].includes(normalizedStatus)) return "teal";
    if (["time_out"].includes(normalizedStatus)) return "orange";
    if (["completed"].includes(normalizedStatus)) return "info";

    // Success statuses - Green
    if (["active", "paid", "accepted", "published", "verified", "approved", "booked"].includes(normalizedStatus)) {
        return "success";
    }

    // Warning statuses - Yellow/Amber
    if (["pending"].includes(normalizedStatus)) {
        return "warning";
    }

    // Error statuses - Red
    if (["overdue", "expired", "cancelled", "rejected", "banned", "deleted"].includes(normalizedStatus)) {
        return "error";
    }

    // Info statuses - Blue
    if (["sent", "draft", "processing", "in_progress", "read", "responded"].includes(normalizedStatus)) {
        return "info";
    }

    // Closed - Gray
    if (["closed", "checked-out", "checked_out", "inactive", "archived"].includes(normalizedStatus)) {
        return "default";
    }

    return "default";
};

// Status label mapping for custom display names
const STATUS_LABELS: Record<string, string> = {
    time_out: "Time Out",
    "checked-out": "Checked Out",
    checked_out: "Checked Out",
    checked_in: "Checked In",
    in_progress: "In Progress",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
    const finalVariant = variant || getStatusVariant(status);
    const normalizedStatus = status.toLowerCase();

    // Get custom label or capitalize first letter
    const displayLabel = STATUS_LABELS[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1);

    const variants: Record<StatusVariant, string> = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-[0_1px_2px_rgba(16,185,129,0.05)]",
        warning: "bg-amber-50 text-amber-700 border-amber-200/60 shadow-[0_1px_2px_rgba(245,158,11,0.05)]",
        error: "bg-rose-50 text-rose-700 border-rose-200/60 shadow-[0_1px_2px_rgba(244,63,94,0.05)]",
        info: "bg-[#3882a5]/10 text-[#3882a5] border-[#3882a5]/20 shadow-[0_1px_2px_rgba(56,130,165,0.05)]",
        indigo: "bg-[#e0e7ff]/80 text-indigo-700 border-indigo-200/60 shadow-[0_1px_2px_rgba(79,70,229,0.05)]",
        teal: "bg-teal-50 text-teal-700 border-teal-200/60 shadow-[0_1px_2px_rgba(20,184,166,0.05)]",
        orange: "bg-orange-50 text-orange-700 border-orange-200/60 shadow-[0_1px_2px_rgba(249,115,22,0.05)]",
        cyan: "bg-cyan-50 text-cyan-700 border-cyan-200/60 shadow-[0_1px_2px_rgba(6,182,212,0.05)]",
        default: "bg-slate-50 text-slate-600 border-slate-200/60 shadow-sm",
    };

    const dotVariants: Record<StatusVariant, string> = {
        success: "bg-emerald-600",
        warning: "bg-amber-600",
        error: "bg-rose-600",
        info: "bg-[#3882a5]",
        indigo: "bg-indigo-600",
        teal: "bg-teal-600",
        orange: "bg-orange-600",
        cyan: "bg-cyan-600",
        default: "bg-slate-500",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm transition-all",
                variants[finalVariant],
                className,
            )}
        >
            <div
                className={cn(
                    "h-1.5 w-1.5 rounded-full ring-1 ring-white/50 dark:ring-black/20",
                    dotVariants[finalVariant],
                )}
            />
            {displayLabel}
        </span>
    );
}
