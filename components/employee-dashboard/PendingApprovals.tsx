"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/store/api/appointmentApi";
import { useApproveAppointmentMutation, useRejectAppointmentMutation, useResendAppointmentNotificationMutation } from "@/store/api/appointmentApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, Send, ClipboardList, MessageSquare } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Clock className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Approvals Needed</h3>
                <p className="text-gray-500 text-center max-w-xs">You're all caught up! No visitor requests are waiting for your response.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3882a5]/10 rounded-lg text-[#3882a5]">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#074463]">Awaiting Approval</h2>
                        <p className="text-xs text-gray-500 font-medium">Manage incoming visitor requests ({pendingAppointments.length})</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {pendingAppointments.map((appointment) => {
                    const isProcessing = processingId === appointment._id;
                    const scheduledDate = new Date(appointment.appointmentDetails.scheduledDate);
                    const visitorName = (appointment.visitorId as any)?.name || appointment.visitor?.name || "Visitor";
                    const visitorCompany = (appointment.visitorId as any)?.company || appointment.visitor?.company;
                    const initials = visitorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                    return (
                        <div
                            key={appointment._id}
                            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-[0_20px_50px_-20px_rgba(7,68,99,0.15)] hover:border-[#3882a5]/20"
                        >
                            {/* Status Indicator Bar */}
                            <div className="absolute top-0 left-0 h-1 w-full bg-amber-400/20">
                                <div className="h-full w-1/3 bg-amber-400 group-hover:w-full transition-all duration-500"></div>
                            </div>

                            {/* Visitor Info Section */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3882a5] to-[#074463] text-white font-bold text-lg shadow-lg shadow-[#3882a5]/20">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="truncate text-lg font-black text-[#1a3a4a]">
                                        {visitorName}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        <p className="truncate text-xs font-medium uppercase tracking-wider">
                                            {visitorCompany || "Individual Visit"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="rounded-xl bg-gray-50/50 p-3 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-[#3882a5]" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Schedule</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 leading-none mb-1">
                                        {format(scheduledDate, "EEE, MMM dd")}
                                    </p>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        {formatTime(appointment.appointmentDetails.scheduledTime)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50/50 p-3 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <MessageSquare className="h-3.5 w-3.5 text-[#3882a5]" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Purpose</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 line-clamp-2 leading-tight">
                                        {appointment.appointmentDetails.purpose || "General Meeting"}
                                    </p>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => handleApprove(appointment._id)}
                                    disabled={isProcessing}
                                    className="h-11 flex-1 rounded-xl bg-[#3882a5] font-bold text-white hover:bg-[#2d6a87] transition-all active:scale-95 shadow-md shadow-[#3882a5]/20 group/btn"
                                >
                                    {isProcessing && isApproving ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                            Approve
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleReject(appointment._id)}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="h-11 px-4 rounded-xl border-red-100 font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                                >
                                    {isProcessing && isRejecting ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-red-200 border-t-red-500 animate-spin" />
                                    ) : (
                                        <XCircle className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {pendingAppointments.length > 9 && (
                <div className="flex justify-center pt-8">
                    <p className="text-sm font-medium text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                        Showing {pendingAppointments.length} pending requests
                    </p>
                </div>
            )}
        </div>
    );
}

