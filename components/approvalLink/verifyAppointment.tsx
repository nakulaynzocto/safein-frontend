"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useVerifyTokenQuery, useUpdateStatusMutation } from "@/store/api/approvalLinkApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    MapPin,
    Calendar,
    Clock,
    User,
    Phone,
    Building2,
    ShieldCheck,
    Briefcase,
    FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/utils/helpers";
import { cn } from "@/lib/utils";

export function VerifyAppointment() {
    const params = useParams();
    const token = params?.token as string;

    const [isProcessing, setIsProcessing] = useState(false);
    const [actionCompleted, setActionCompleted] = useState(false);
    const [completedStatus, setCompletedStatus] = useState<"approved" | "rejected" | null>(null);

    const { data, isLoading, error, refetch } = useVerifyTokenQuery(token, {
        skip: !token,
        refetchOnMountOrArgChange: true,
    });

    const [updateStatus] = useUpdateStatusMutation();

    // Handle case when token is missing
    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Invalid Link</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            The verification link is missing or invalid. Please check the link and try again.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        if (!token || isProcessing) return;

        setIsProcessing(true);
        try {
            const result = await updateStatus({ token, status }).unwrap();

            if (result.success) {
                setActionCompleted(true);
                setCompletedStatus(status);
                toast.success(
                    status === "approved" ? "Appointment approved successfully!" : "Appointment rejected successfully!",
                );
            }
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.message || "Failed to update appointment status";
            toast.error(errorMessage);

            if (errorMessage.includes("expired") || errorMessage.includes("already used")) {
                refetch();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-6">
                    <div className="space-y-2 text-center">
                        <Skeleton className="mx-auto h-8 w-48 rounded-lg" />
                        <Skeleton className="mx-auto h-4 w-64 rounded-md" />
                    </div>
                    <Card className="overflow-hidden border-0 bg-white/60 shadow-xl backdrop-blur-md dark:bg-slate-900/60">
                        <CardContent className="p-0">
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col items-center gap-6 sm:flex-row">
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                    <div className="flex-1 space-y-3 text-center sm:text-left">
                                        <Skeleton className="h-7 w-48 rounded-md mx-auto sm:mx-0" />
                                        <Skeleton className="h-4 w-32 rounded-md mx-auto sm:mx-0" />
                                        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                            <Skeleton className="h-5 w-24 rounded-full" />
                                            <Skeleton className="h-5 w-24 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    <Skeleton className="h-20 rounded-xl" />
                                    <Skeleton className="h-20 rounded-xl" />
                                </div>
                            </div>
                            <div className="border-t border-slate-100 bg-slate-50/30 p-6 dark:border-slate-800 sm:p-8">
                                <div className="space-y-4">
                                    <Skeleton className="h-6 w-40 rounded-md" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                        <Skeleton className="h-24 w-full rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || (data && !data.success)) {
        const errorMessage = (error as any)?.data?.message || data?.message || "Invalid or expired link";
        const isExpired = errorMessage.includes("expired") || errorMessage.includes("already used");

        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 bg-white shadow-2xl backdrop-blur-xl dark:bg-slate-900/80">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 p-4 dark:bg-amber-900/20">
                            <XCircle className="h-10 w-10 text-amber-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                            {isExpired ? "Link Expired" : "Invalid Link"}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {isExpired ? "This verification link has expired or has already been used." : errorMessage}
                        </p>
                        <Button className="mt-8" variant="outline" onClick={() => (window.location.href = "/")}>
                            Go to Homepage
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const appointment = data?.data?.appointment;
    const isUsedLink = !!data?.data?.isUsed;
    const isExpiredByTime = !!data?.data?.isExpiredByTime;
    if (!appointment) return null;

    const scheduledDate = new Date(appointment.appointmentDetails.scheduledDate);
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const currentStatus = completedStatus || appointment.status;
    const isProcessed = actionCompleted || ["approved", "rejected"].includes(currentStatus);
    const shouldShowExpiredState = isUsedLink && !isProcessed && (isExpiredByTime || currentStatus === "pending");

    if (shouldShowExpiredState) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 bg-white shadow-2xl backdrop-blur-xl dark:bg-slate-900/80">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 p-4 dark:bg-amber-900/20">
                            <XCircle className="h-10 w-10 text-amber-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Link Expired</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            This verification link is no longer active.
                        </p>
                        <Button className="mt-8" variant="outline" onClick={() => (window.location.href = "/")}>
                            Go to Homepage
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isProcessed) {
        const displayStatus = currentStatus === "approved" ? "approved" : "rejected";
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-lg overflow-hidden border-0 bg-white shadow-2xl dark:bg-slate-900 animate-in zoom-in-95 duration-500">
                    <div className={cn(
                        "h-2",
                        displayStatus === "approved" ? "bg-green-500" : "bg-red-500"
                    )} />
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className={cn(
                            "mb-6 flex h-20 w-20 items-center justify-center rounded-full p-4",
                            displayStatus === "approved" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                        )}>
                            {displayStatus === "approved" ? (
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            ) : (
                                <XCircle className="h-10 w-10 text-red-600" />
                            )}
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white capitalize">
                            Appointment {displayStatus}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {actionCompleted
                                ? `The appointment has been ${displayStatus} successfully.`
                                : `This appointment was already ${displayStatus}.`
                            }
                        </p>
                        <div className="mt-8 flex w-full flex-col gap-3">
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-left dark:border-slate-800">
                                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Visitor Details</p>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-14 w-14 border border-slate-200 dark:border-slate-700">
                                        <AvatarImage src={appointment.visitor?.photo} alt={appointment.visitor?.name || "Visitor"} className="object-cover" />
                                        <AvatarFallback className="bg-slate-100 text-sm font-bold text-[#3882a5] dark:bg-slate-800">
                                            {(appointment.visitor?.name || "V")
                                                .split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{appointment.visitor?.name || "-"}</p>
                                        <p className="text-xs text-slate-500">{appointment.visitor?.phone || "-"}</p>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                                        <p className="text-[10px] uppercase text-slate-500">Date</p>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{formattedDate}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                                        <p className="text-[10px] uppercase text-slate-500">Time</p>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                            {formatTime(appointment?.appointmentDetails?.scheduledTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/")}>
                                Back to Portal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Brand Logo or Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3882a5] shadow-lg shadow-[#3882a5]/20">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        SafeIn Verification
                    </h1>
                    <p className="max-w-md text-slate-500 dark:text-slate-400">
                        Please review the meeting details carefully before making a decision.
                    </p>
                </div>

                <Card className="overflow-hidden border-0 bg-white/70 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
                    <CardContent className="p-0">
                        {/* Profile Section */}
                        <div className="relative p-6 sm:p-10">
                            {/* Decorative elements */}
                            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-[#3882a5]/5 blur-3xl" />
                            
                            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:text-left">
                                <div className="group relative">
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#3882a5] to-[#98c7dd] opacity-30 blur group-hover:opacity-100 transition duration-500" />
                                    <Avatar className="h-28 w-28 ring-4 ring-white dark:ring-slate-900 sm:h-32 sm:w-32">
                                        <AvatarImage src={appointment.visitor.photo} alt={appointment.visitor.name} className="object-cover" />
                                        <AvatarFallback className="bg-slate-100 text-2xl font-bold text-[#3882a5] dark:bg-slate-800">
                                            {appointment.visitor.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                                            {appointment.visitor.name}
                                        </h2>
                                        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                            {appointment.visitor.company && (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    <Building2 className="mr-1 h-3 w-3" />
                                                    {appointment.visitor.company}
                                                </Badge>
                                            )}
                                            {appointment.visitor.designation && (
                                                <Badge variant="outline" className="border-slate-200 text-slate-600">
                                                    <Briefcase className="mr-1 h-3 w-3" />
                                                    {appointment.visitor.designation}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span>{appointment.visitor.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/30 sm:p-10">
                            <div className="grid gap-8 md:grid-cols-2">
                                {/* Left: Appointment Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#3882a5]">
                                            Appointment Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400">Meeting Date</p>
                                                    <p className="text-sm font-semibold">{formattedDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400">Scheduled Time</p>
                                                    <p className="text-sm font-semibold">{formatTime(appointment.appointmentDetails.scheduledTime)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400">Meeting With</p>
                                                    <p className="text-sm font-semibold">{appointment.employee.name}</p>
                                                    {appointment.employee.department && (
                                                        <p className="text-[10px] text-slate-500">{appointment.employee.department}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Purpose & Location */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#3882a5]">
                                            Purpose & Documents
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-[#3882a5]" />
                                                    <span className="text-xs font-medium text-slate-400">Meeting Purpose</span>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">
                                                    "{appointment.appointmentDetails.purpose}"
                                                </p>
                                            </div>
                                            
                                            {appointment.visitor.address && (
                                                <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 p-3 dark:border-slate-700">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-400">Visitor Location</p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                            {[appointment.visitor.address.city, appointment.visitor.address.state, appointment.visitor.address.country].filter(Boolean).join(", ")}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {appointment.visitor.idProof && (
                                                <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                            {appointment.visitor.idProof.type.replace("_", " ").toUpperCase()} Verified
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-medium text-slate-400">
                                                        {appointment.visitor.idProof.number.slice(0, 4)}••••{appointment.visitor.idProof.number.slice(-2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notes if any */}
                            {appointment.appointmentDetails.notes && (
                                <div className="mt-8 rounded-xl bg-[#3882a5]/5 p-4 ring-1 ring-[#3882a5]/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#3882a5] mb-2 px-1">Host Notes</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 px-1 leading-relaxed">
                                        {appointment.appointmentDetails.notes}
                                    </p>
                                </div>
                            )}

                            {/* Action Area */}
                            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-end sm:gap-6">
                                <button
                                    onClick={() => handleStatusUpdate("rejected")}
                                    disabled={isProcessing}
                                    className="order-2 h-14 w-full rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-500 disabled:opacity-50 sm:order-1 sm:w-40 dark:border-slate-700 dark:hover:bg-red-950/20"
                                >
                                    {isProcessing ? "..." : "Decline Request"}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate("approved")}
                                    disabled={isProcessing}
                                    className="order-1 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#3882a5] px-8 text-sm font-bold text-white shadow-lg shadow-[#3882a5]/20 transition-all hover:bg-[#2d6a87] hover:shadow-[#3882a5]/30 active:scale-[0.98] disabled:opacity-50 sm:order-2 sm:w-auto"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span>Approve Meeting</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Footer simple link */}
                <div className="text-center">
                    <button 
                        onClick={() => window.location.href = "/"}
                        className="text-xs font-medium text-slate-400 hover:text-[#3882a5] transition-colors"
                    >
                        Powered by <span className="text-[#3a82a5] font-bold">SafeIn</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
