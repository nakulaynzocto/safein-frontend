"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/store/api/appointmentApi";
import { useApproveAppointmentMutation, useRejectAppointmentMutation } from "@/store/api/appointmentApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, User, Building2, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PendingApprovalsProps {
    appointments: Appointment[];
    onApprove?: (appointmentId: string) => void;
    onReject?: (appointmentId: string) => void;
}

export function PendingApprovals({ appointments, onApprove, onReject }: PendingApprovalsProps) {
    // Always call hooks at the top level - before any conditional logic (unified API)
    const [approveAppointment, { isLoading: isApproving }] = useApproveAppointmentMutation();
    const [rejectAppointment, { isLoading: isRejecting }] = useRejectAppointmentMutation();
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Calculate pending appointments after hooks
    const pendingAppointments = appointments.filter((apt) => apt.status === "pending");

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

    if (pendingAppointments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pending Approvals
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
                    <Clock className="h-5 w-5 text-amber-600" />
                    Pending Approvals ({pendingAppointments.length})
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
                            className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 transition-all hover:shadow-md"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-full bg-amber-100 p-2">
                                            <User className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {appointment.visitor?.name || "Visitor"}
                                                </h4>
                                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                                    Pending
                                                </Badge>
                                            </div>
                                            {appointment.visitor?.company && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                                    <Building2 className="h-3 w-3" />
                                                    {appointment.visitor.company}
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

                                <div className="flex gap-2 sm:ml-4">
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(appointment._id)}
                                        disabled={isProcessing}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {isProcessing && isApproving ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleReject(appointment._id)}
                                        disabled={isProcessing}
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

