"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVerifyTokenQuery, useUpdateStatusMutation } from "@/store/api/approvalLinkApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function VerifyAppointment() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [isProcessing, setIsProcessing] = useState(false);
    const [actionCompleted, setActionCompleted] = useState(false);
    const [completedStatus, setCompletedStatus] = useState<"approved" | "rejected" | null>(null);

    const { data, isLoading, error, refetch } = useVerifyTokenQuery(token, {
        skip: !token,
    });

    const [updateStatus] = useUpdateStatusMutation();

    // Handle case when token is missing
    if (!token) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                <Card className="w-full max-w-md shadow-none">
                    <CardHeader className="text-center">
                        <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                            <XCircle className="text-destructive h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Invalid Link</CardTitle>
                        <CardDescription className="mt-2">
                            The verification link is missing or invalid. Please check the link and try again.
                        </CardDescription>
                    </CardHeader>
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

            // If link is expired or already used, refetch to show the error state
            if (errorMessage.includes("expired") || errorMessage.includes("already used")) {
                refetch();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                <Card className="w-full max-w-md shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                        <p className="text-muted-foreground">Verifying link...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Handle error cases
    if (error || (data && !data.success)) {
        const errorMessage = (error as any)?.data?.message || data?.message || "Invalid or expired link";
        const isExpired = errorMessage.includes("expired") || errorMessage.includes("already used");

        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                <Card className="w-full max-w-md shadow-none">
                    <CardHeader className="text-center">
                        <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                            <XCircle className="text-destructive h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Link Expired or Invalid</CardTitle>
                        <CardDescription className="mt-2">
                            {isExpired ? "Link expired or already used" : errorMessage}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const appointment = data?.data?.appointment;

    if (!appointment) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                <Card className="w-full max-w-md shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <XCircle className="text-destructive mb-4 h-8 w-8" />
                        <p className="text-muted-foreground">Appointment not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Format date
    const scheduledDate = new Date(appointment.appointmentDetails.scheduledDate);
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Check if appointment is already processed (from server) or just processed (local state)
    const currentStatus = completedStatus || appointment.status;
    const isProcessed = actionCompleted || currentStatus === "approved" || currentStatus === "rejected";

    if (isProcessed) {
        const displayStatus = currentStatus === "approved" ? "approved" : "rejected";
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                <Card className="w-full max-w-md shadow-none">
                    <CardHeader className="text-center">
                        <div
                            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${displayStatus === "approved"
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-red-100 dark:bg-red-900/20"
                                }`}
                        >
                            {displayStatus === "approved" ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            Appointment {displayStatus === "approved" ? "Approved" : "Rejected"}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {actionCompleted
                                ? `The appointment has been ${displayStatus} successfully.`
                                : `This appointment is already ${displayStatus}.`
                            }
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-2 py-4 sm:px-4 sm:py-12">
            <Card className="w-full max-w-4xl shadow-none">
                <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                    <CardTitle className="text-xl sm:text-2xl">Appointment Approval</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Review the appointment and visitor details, then approve or reject the request
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
                    {/* Visitor Details Section */}
                    <div className="bg-muted/50 space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-6">
                        <h3 className="text-base font-semibold sm:text-lg text-gray-700 dark:text-gray-300">
                            Visitor Information
                        </h3>

                        {/* Visitor Header with Photo */}
                        <div className="bg-background flex items-center gap-2 rounded-lg border p-3 sm:gap-4 sm:p-4">
                            <div className="group relative flex-shrink-0">
                                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                                    <AvatarImage src={appointment.visitor.photo} alt={appointment.visitor.name} />
                                    <AvatarFallback className="text-lg sm:text-2xl">
                                        {appointment.visitor.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="truncate text-base font-semibold sm:text-xl">
                                    {appointment.visitor.name}
                                </h4>
                                {appointment.visitor._id && (
                                    <p className="text-muted-foreground truncate font-mono text-xs sm:text-sm">
                                        Visitor ID: {appointment.visitor._id}
                                    </p>
                                )}
                                {appointment.visitor.company && (
                                    <p className="text-muted-foreground truncate text-xs sm:text-sm">
                                        {appointment.visitor.company}
                                    </p>
                                )}
                                {appointment.visitor.designation && (
                                    <p className="text-muted-foreground truncate text-xs sm:text-sm">
                                        {appointment.visitor.designation}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Visitor Contact Details */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium sm:text-sm">Email</p>
                                    <p className="text-muted-foreground text-xs break-all sm:text-sm">
                                        {appointment.visitor.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium sm:text-sm">Phone</p>
                                    <p className="text-muted-foreground text-xs break-all sm:text-sm">
                                        {appointment.visitor.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Address */}
                            {appointment.visitor.address && (
                                <div className="flex items-start gap-2 sm:gap-3 md:col-span-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium sm:text-sm">Address</p>
                                        <p className="text-muted-foreground text-xs break-words sm:text-sm">
                                            {[
                                                appointment.visitor.address.street,
                                                appointment.visitor.address.city,
                                                appointment.visitor.address.state,
                                                appointment.visitor.address.country,
                                            ]
                                                .filter(Boolean)
                                                .join(", ") || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ID Proof */}
                            {appointment.visitor.idProof && (
                                <>
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium sm:text-sm">ID Proof Type</p>
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {appointment.visitor.idProof.type
                                                    ? appointment.visitor.idProof.type.replace("_", " ").toUpperCase()
                                                    : "N/A"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium sm:text-sm">ID Proof Number</p>
                                            {appointment.visitor.idProof.image ? (
                                                <button
                                                    onClick={() =>
                                                        window.open(appointment.visitor.idProof?.image, "_blank")
                                                    }
                                                    className="mt-1 flex cursor-pointer items-center gap-2 font-mono text-xs break-all text-[#3882a5] hover:text-[#2d6a87] hover:underline sm:text-sm"
                                                >
                                                    <span>{appointment.visitor.idProof.number || "N/A"}</span>
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                                </button>
                                            ) : (
                                                <p className="text-muted-foreground mt-1 font-mono text-xs break-all sm:text-sm">
                                                    {appointment.visitor.idProof.number || "N/A"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* ID Proof Image */}
                                    {appointment.visitor.idProof.image && (
                                        <div className="md:col-span-2">
                                            <p className="mb-2 text-xs font-medium sm:text-sm">ID Proof Image</p>
                                            <div className="overflow-hidden rounded-lg border">
                                                <img
                                                    src={appointment.visitor.idProof.image}
                                                    alt="ID Proof"
                                                    className="h-auto max-h-48 w-full cursor-pointer object-contain sm:max-h-64"
                                                    onClick={() =>
                                                        window.open(appointment.visitor.idProof?.image, "_blank")
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Appointment Details Section */}
                    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-none">
                        <div className="bg-[#3882a5]/5 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-[#074463] dark:text-[#3882a5] uppercase tracking-wider">
                                Appointment Details
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {/* Date & Time */}
                            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date & Time</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                                    {formattedDate} at {appointment.appointmentDetails.scheduledTime}
                                </dd>
                            </div>
                            {/* Visitor */}
                            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visitor</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                                    {appointment.visitor.name}
                                </dd>
                            </div>
                            {/* Meeting With */}
                            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Meeting With</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                                    <div className="flex flex-col">
                                        <span>{appointment.employee.name}</span>
                                        {appointment.employee.department && (
                                            <span className="text-xs font-normal text-gray-500 mt-0.5">{appointment.employee.department}</span>
                                        )}
                                    </div>
                                </dd>
                            </div>
                            {/* Purpose */}
                            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0 leading-relaxed font-medium">
                                    {appointment.appointmentDetails.purpose}
                                </dd>
                            </div>
                            {/* Notes */}
                            {appointment.appointmentDetails.notes && (
                                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Additional Notes</dt>
                                    <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:col-span-2 sm:mt-0 leading-relaxed">
                                        {appointment.appointmentDetails.notes}
                                    </dd>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row justify-end gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleStatusUpdate("rejected")}
                            disabled={isProcessing}
                            className="flex-1 sm:w-auto sm:flex-initial border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </>
                            )}
                        </Button>
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={() => handleStatusUpdate("approved")}
                            disabled={isProcessing}
                            className="flex-1 sm:w-auto sm:flex-initial"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
