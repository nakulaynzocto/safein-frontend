"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/store/api/appointmentApi";
import { useApproveAppointmentMutation, useRejectAppointmentMutation, useResendAppointmentNotificationMutation } from "@/store/api/appointmentApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { filterActivePendingAppointments } from "@/utils/appointmentUtils";
import { useCooldown } from "@/hooks/useCooldown";
import { formatTime } from "@/utils/helpers";

interface PendingApprovalsProps {
    appointments: Appointment[];
    onApprove?: (appointmentId: string) => void;
    onReject?: (appointmentId: string) => void;
}

export function PendingApprovals({ appointments, onApprove, onReject }: PendingApprovalsProps) {
    // Always call hooks at the top level - before any conditional logic (unified API)
    const [approveAppointment, { isLoading: isApproving }] = useApproveAppointmentMutation();
    const [rejectAppointment, { isLoading: isRejecting }] = useRejectAppointmentMutation();
    const [resendNotification] = useResendAppointmentNotificationMutation();
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Use cooldown hook
    const { cooldowns, startCooldown, isOnCooldown } = useCooldown();

    // Filter to show only active pending appointments (excluding timed-out ones)
    const pendingAppointments = filterActivePendingAppointments(appointments);

    const handleApprove = async (appointmentId: string) => {
        try {
            setProcessingId(appointmentId);
            await approveAppointment(appointmentId).unwrap();
            showSuccessToast("Appointment approved successfully!");
            onApprove?.(appointmentId);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to approve appointment");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (appointmentId: string) => {
        try {
            setProcessingId(appointmentId);
            await rejectAppointment(appointmentId).unwrap();
            showSuccessToast("Appointment rejected");
            onReject?.(appointmentId);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to reject appointment");
        } finally {
            setProcessingId(null);
        }
    };

    const handleResend = async (appointmentId: string) => {
        if (isOnCooldown(appointmentId)) return;

        try {
            await resendNotification(appointmentId).unwrap();
            showSuccessToast("Notification resent successfully");
            startCooldown(appointmentId);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to resend notification");
        }
    };

    if (pendingAppointments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Visit Approvals
                    </CardTitle>
                    <CardDescription>Appointments waiting for your approval</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertDescription>No pending appointments at the moment.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#3882a5]" />
                    Visit Approvals ({pendingAppointments.length})
                </CardTitle>
                <CardDescription>Appointments waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingAppointments.slice(0, 5).map((appointment) => {
                    const isProcessing = processingId === appointment._id;
                    const scheduledDate = new Date(appointment.appointmentDetails.scheduledDate);

                    return (
                        <div
                            key={appointment._id}
                            className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5"
                        >
                            {/* Header: Avatar, Info, Badge */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-3 min-w-0">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3882a5]/10 text-[#3882a5]">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="truncate font-bold text-gray-900">
                                            {(appointment.visitorId as any)?.name || appointment.visitor?.name || "Visitor"}
                                        </h4>
                                        {((appointment.visitorId as any)?.company || appointment.visitor?.company) && (
                                            <p className="truncate text-xs text-gray-500">
                                                {(appointment.visitorId as any)?.company || appointment.visitor?.company}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    Pending
                                </Badge>
                            </div>

                            {/* Body: Date and Purpose */}
                            <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-3 text-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-tight text-gray-400">Scheduled For</p>
                                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                        <Calendar className="h-3.5 w-3.5 text-[#3882a5]" />
                                        <span>{format(scheduledDate, "MMM dd, yyyy")}</span>
                                    </div>
                                    <p className="ml-5 text-[11px] text-gray-500">{formatTime(appointment.appointmentDetails.scheduledTime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-tight text-gray-400">Purpose</p>
                                    <p className="line-clamp-2 font-medium text-gray-700 leading-snug">
                                        {appointment.appointmentDetails.purpose}
                                    </p>
                                </div>
                            </div>

                            {/* Footer: Actions */}
                            <div className="flex items-center gap-2 pt-1">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="h-10 flex-1 rounded-lg bg-[#3882a5] font-bold text-white hover:bg-[#2d6a87]"
                                    onClick={() => handleApprove(appointment._id)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing && isApproving ? "..." : (
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle className="h-4 w-4" />
                                            Approve
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 flex-1 rounded-lg border-red-200 font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleReject(appointment._id)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing && isRejecting ? "..." : (
                                        <span className="flex items-center gap-1.5">
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {pendingAppointments.length > 5 && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            +{pendingAppointments.length - 5} more pending appointments
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

