"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApproveAppointmentMutation, useRejectAppointmentMutation } from "@/store/api/appointmentApi";
import { useAppSelector } from "@/store/hooks";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { StatusPage } from "@/components/common/statusPage";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Clock, ShieldCheck } from "lucide-react";

export default function EmailActionPage() {
    const params = useParams();
    const router = useRouter();
    const { action, id } = params as { action: string; id: string };

    const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

    const [approveAppointment, { isLoading: isApproving }] = useApproveAppointmentMutation();
    const [rejectAppointment, { isLoading: isRejecting }] = useRejectAppointmentMutation();
    
    const [status, setStatus] = useState<"loading" | "success" | "error" | "auth-required">("loading");
    const [message, setMessage] = useState("");

    const handleAction = useCallback(async () => {
        if (!id || !action) return;
        
        try {
            if (action === "approve") {
                await approveAppointment(id).unwrap();
                setStatus("success");
                setMessage("Appointment approved successfully! The visitor has been notified.");
                showSuccessToast("Appointment approved successfully!");
            } else if (action === "reject") {
                await rejectAppointment(id).unwrap();
                setStatus("success");
                setMessage("Appointment rejected. The visitor has been informed.");
                showSuccessToast("Appointment rejected successfully!");
            } else {
                setStatus("error");
                setMessage("Invalid action requested. Please check the link and try again.");
                showErrorToast("Invalid action");
            }
        } catch (error: any) {
            setStatus("error");
            setMessage(error?.data?.message || "There was an error processing your request. Please try again.");
            showErrorToast("Failed to process action");
        }
    }, [action, id, approveAppointment, rejectAppointment]);

    useEffect(() => {
        if (!isInitialized) return;

        if (!isAuthenticated) {
            setStatus("auth-required");
            setMessage("Please log in to perform this action.");
            return;
        }

        if (status === "loading" && id && action) {
            handleAction();
        }
    }, [action, id, isAuthenticated, isInitialized, handleAction, status]);

    const handleGoToDashboard = () => router.push(routes.privateroute.DASHBOARD);
    const handleGoToLogin = () => router.push(routes.publicroute.LOGIN);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
                <div className="w-full max-w-md space-y-6 text-center animate-in fade-in duration-500">
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-full bg-[#3882a520] animate-ping" />
                            <div className="relative h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-slate-100">
                                <Mail className="h-10 w-10 text-[#3882a5] animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-64 mx-auto rounded-lg" />
                        <Skeleton className="h-4 w-48 mx-auto rounded-md" />
                    </div>
                    <div className="pt-8">
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold tracking-widest uppercase">
                            <ShieldCheck className="h-3 w-3" />
                            Secure Action Process
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "auth-required") {
        return (
            <StatusPage
                type="warning"
                title="Authentication Required"
                message={message}
                description="You need to be logged in to perform this action."
                primaryAction={{
                    label: "Go to Login",
                    onClick: handleGoToLogin,
                    href: routes.publicroute.LOGIN,
                }}
                showHomeButton={true}
            />
        );
    }

    if (status === "success") {
        return (
            <StatusPage
                type="success"
                title={action === "approve" ? "Appointment Approved!" : "Appointment Rejected"}
                message={message}
                description={
                    action === "approve"
                        ? "The visitor has been notified about the approval."
                        : "The visitor has been informed about the rejection."
                }
                primaryAction={{
                    label: "View Dashboard",
                    onClick: handleGoToDashboard,
                    href: routes.privateroute.DASHBOARD,
                }}
                showHomeButton={true}
            />
        );
    }

    return (
        <StatusPage
            type="error"
            title="Action Failed"
            message={message}
            description="There was an error processing your request. Please try again or contact support."
            primaryAction={{
                label: "Back to Dashboard",
                onClick: handleGoToDashboard,
                href: routes.privateroute.DASHBOARD,
            }}
            showHomeButton={true}
        />
    );
}

