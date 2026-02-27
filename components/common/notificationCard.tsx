"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Calendar, Clock as ClockIcon } from "lucide-react";
import { Appointment } from "@/store/api/appointmentApi";
import { formatDateLong } from "@/utils/dateUtils";
import { formatTime } from "@/utils/helpers";

interface NotificationCardProps {
    appointment: Appointment;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isProcessing?: boolean;
}

/**
 * NotificationCard component displays appointment notification with approve/reject actions
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const NotificationCard = memo(function NotificationCard({
    appointment,
    onApprove,
    onReject,
    isProcessing = false,
}: NotificationCardProps) {
    const formatDate = formatDateLong;

    const statusIcon = useMemo(() => {
        switch (appointment.status) {
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    }, [appointment.status]);

    const statusColor = useMemo(() => {
        switch (appointment.status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }, [appointment.status]);

    const formattedDate = useMemo(
        () => formatDate(appointment.appointmentDetails.scheduledDate),
        [appointment.appointmentDetails.scheduledDate],
    );

    const description = useMemo(() => {
        if (appointment.status === "pending") {
            return "You have a new appointment request. Please review and click Approve or Reject.";
        }
        if (appointment.status === "approved") {
            return "Appointment approved successfully. The visitor has been notified.";
        }
        return "Appointment rejected. The visitor has been informed.";
    }, [appointment.status]);

    const employeeName = useMemo(() => {
        // Handle both populated and non-populated employeeId
        const employee = (appointment as any).employeeId || appointment.employee;
        if (typeof employee === "object" && employee !== null) {
            return employee.name || "N/A";
        }
        return appointment.employee?.name || "N/A";
    }, [appointment.employeeId, appointment.employee]);

    const visitorName = useMemo(() => {
        // Handle both populated and non-populated visitorId
        const visitor = (appointment as any).visitorId || appointment.visitor;
        if (typeof visitor === "object" && visitor !== null) {
            return visitor.name || "N/A";
        }
        return appointment.visitor?.name || "N/A";
    }, [appointment.visitorId, appointment.visitor]);

    return (
        <Card className="mx-2 flex h-full w-full flex-col sm:mx-0">
            <CardHeader className="px-4 pb-3 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {statusIcon}
                        <CardTitle className="text-base">Appointment Request</CardTitle>
                    </div>
                    <Badge className={statusColor}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                </div>
                <CardDescription className="mt-2 text-sm">{description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Visitor</p>
                            <p className="truncate text-sm text-gray-600">{visitorName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Date</p>
                            <p className="text-sm text-gray-600">{formattedDate}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <ClockIcon className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Time</p>
                            <p className="text-sm text-gray-600">{formatTime(appointment.appointmentDetails.scheduledTime)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <User className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Meeting With</p>
                            <p className="truncate text-sm text-gray-600">{employeeName}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <p className="mb-2 text-sm font-medium text-gray-900">Purpose</p>
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {appointment.appointmentDetails.purpose}
                    </p>
                </div>

                {appointment.status === "pending" && (
                    <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
                        <Button
                            onClick={() => onApprove(appointment._id)}
                            disabled={isProcessing}
                            className="h-10 flex-1"
                            size="sm"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                        <Button
                            onClick={() => onReject(appointment._id)}
                            disabled={isProcessing}
                            className="h-10 flex-1"
                            variant="destructive"
                            size="sm"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
