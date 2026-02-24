"use client";

import { NewAppointmentModal } from "@/components/appointment/AppointmentForm";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Page: appoitment create (non-modal page version)
export default function AppoitmentCreate() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const visitorId = searchParams.get("visitorId") || undefined;

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
                <NewAppointmentModal layout="page" initialVisitorId={visitorId} />
            </div>
        </div>
    );
}
