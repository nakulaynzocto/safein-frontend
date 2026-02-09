import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
}

export const getStatusVariant = (status: string): StatusVariant => {
    const normalizedStatus = status.toLowerCase();

    // Success statuses - Green
    if (["active", "paid", "accepted", "published", "verified", "approved", "booked"].includes(normalizedStatus)) {
        return "success";
    }

    // Info statuses - Blue
    if (["sent", "draft", "processing", "in_progress", "completed"].includes(normalizedStatus)) {
        return "info";
    }

    // Warning statuses - Yellow/Amber
    if (["pending"].includes(normalizedStatus)) {
        return "warning";
    }

    // Error statuses - Red
    if (["overdue", "expired", "cancelled", "rejected", "banned", "deleted"].includes(normalizedStatus)) {
        return "error";
    }

    // Read/Responded - Blue
    if (["read", "responded"].includes(normalizedStatus)) {
        return "info";
    }

    // Closed - Gray
    if (["closed", "checked-out", "checked_out"].includes(normalizedStatus)) {
        return "default";
    }

    // Inactive/Archived - Gray
    if (["inactive", "archived"].includes(normalizedStatus)) {
        return "default";
    }

    return "default";
};

// Status label mapping for custom display names
const STATUS_LABELS: Record<string, string> = {
    time_out: "Time Out",
    "checked-out": "Checked Out",
    checked_out: "Checked Out",
    in_progress: "In Progress",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
    const finalVariant = variant || getStatusVariant(status);
    const normalizedStatus = status.toLowerCase();

    // Get custom label or capitalize first letter
    const displayLabel = STATUS_LABELS[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1);

    const variants: Record<StatusVariant, string> = {
        success:
            "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        warning:
            "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        error: "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
        info: "bg-[#3882a5]/10 text-[#3882a5] border-[#3882a5]/20 dark:bg-[#3882a5]/10 dark:text-[#3882a5] dark:border-[#3882a5]/20",
        default:
            "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    };

    const dotVariants: Record<StatusVariant, string> = {
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        error: "bg-rose-500",
        info: "bg-[#3882a5]",
        default: "bg-slate-400",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap shadow-sm transition-all",
                variants[finalVariant],
                className,
            )}
        >
            <div
                className={cn(
                    "h-2 w-2 rounded-full ring-2 ring-white/50 dark:ring-black/20",
                    dotVariants[finalVariant],
                )}
            />
            {displayLabel}
        </span>
    );
}
