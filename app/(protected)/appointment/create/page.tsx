"use client";

import { useEffect } from "react";
import { NewAppointmentModal } from "@/components/appointment/AppointmentForm";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { useRouter } from "next/navigation";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { routes } from "@/utils/routes";
import { ArrowLeft } from "lucide-react";

// Page: appoitment create (non-modal page version)
export default function AppoitmentCreate() {
    const router = useRouter();
    const { user, isAuthenticated, subscriptionLimits, isLoading: isAuthLoading } = useAuthSubscription();
    const isEmployee = checkIsEmployee(user);

    // Initial Auth Check
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isAuthLoading, isAuthenticated, router]);

    // Check module access
    // Remove if not needed here anymore based on latest instructions

    if (isAuthLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-4 flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl bg-background hover:bg-accent/50"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div>
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Schedule New Appointment</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Create a new appointment by selecting visitor, employee, and appointment details
                    </p>
                </div>
            </div>
            <div className="w-full">
                <NewAppointmentModal layout="page" />
            </div>
        </div>
    );
}
