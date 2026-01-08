"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApproveAppointmentMutation, useRejectAppointmentMutation } from "@/store/api/appointmentApi";
import { useAppSelector } from "@/store/hooks";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { StatusPage } from "@/components/common/statusPage";

export default function EmailActionPage() {
    const params = useParams();
    const router = useRouter();
    const { action, id } = params as { action: string; id: string };

    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const [approveAppointment, { isLoading: isApproving }] = useApproveAppointmentMutation();
    const [rejectAppointment, { isLoading: isRejecting }] = useRejectAppointmentMutation();
    const [status, setStatus] = useState<"loading" | "success" | "error" | "auth-required">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            setStatus("auth-required");
            setMessage("Please log in to perform this action.");
            return;
        }

        const handleAction = async () => {
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
                    setMessage("Invalid action. Please use the correct link.");
                    showErrorToast("Invalid action");
                }
            } catch (error) {
                setStatus("error");
                setMessage("There was an error processing your request. Please try again.");
                showErrorToast("Failed to process appointment action");
            }
        };

        if (id && action) {
            handleAction();
        }
    }, [action, id, approveAppointment, rejectAppointment, isAuthenticated]);

    const handleGoToDashboard = () => {
        router.push(routes.privateroute.NOTIFICATIONS);
    };

    const handleGoToLogin = () => {
        router.push(routes.publicroute.LOGIN);
    };

    if (status === "loading") {
        return null;
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
                    href: routes.privateroute.NOTIFICATIONS,
                }}
                showHomeButton={true}
            />
        );
    }

    return (
        <StatusPage
            type="error"
            title="Error"
            message={message}
            description="There was an error processing your request. Please try again or contact support."
            primaryAction={{
                label: "Back to Dashboard",
                onClick: handleGoToDashboard,
                href: routes.privateroute.NOTIFICATIONS,
            }}
            showHomeButton={true}
        />
    );
}
