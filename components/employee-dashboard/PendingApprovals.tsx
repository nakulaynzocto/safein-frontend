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
                            className="rounded-lg border border-[#3882a5]/20 bg-[#3882a5]/5 p-4 transition-all hover:shadow-md"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-full bg-[#3882a5]/10 p-2">
                                            <User className="h-4 w-4 text-[#3882a5]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {(appointment.visitorId as any)?.name || appointment.visitor?.name || "Visitor"}
                                                </h4>
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                    Pending
                                                </Badge>
                                            </div>
                                            {((appointment.visitorId as any)?.company || appointment.visitor?.company) && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                                    <Building2 className="h-3 w-3" />
                                                    {(appointment.visitorId as any)?.company || appointment.visitor?.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-11 space-y-1 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>
                                                {format(scheduledDate, "MMM dd, yyyy")} at{" "}
                                                {appointment.appointmentDetails.scheduledTime}
                                            </span>
                                        </div>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Purpose:</span>{" "}
                                            {appointment.appointmentDetails.purpose}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:ml-4">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleResend(appointment._id)}
                                        disabled={!!cooldowns[appointment._id]}
                                        className={`${cooldowns[appointment._id] ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
                                        title={cooldowns[appointment._id] ? `Wait ${cooldowns[appointment._id]}s` : "Resend"}
                                    >
                                        <Send className="mr-1 h-4 w-4" />
                                        {cooldowns[appointment._id] && <span className="ml-1 text-[10px] tabular-nums">{cooldowns[appointment._id]}s</span>}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleApprove(appointment._id)}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {isProcessing && isApproving ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReject(appointment._id)}
                                        disabled={isProcessing}
                                        className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        {isProcessing && isRejecting ? "Rejecting..." : "Reject"}
                                    </Button>
                                </div>
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

