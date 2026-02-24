"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { NewAppointmentModal } from "@/components/appointment/AppointmentForm";

export default function AppointmentEditPage() {
    const params = useParams();
    const router = useRouter();
    const appointmentId = params.id as string;

    if (!appointmentId) {
        return (
            <div className="container mx-auto max-w-4xl py-3 sm:py-4">
                <div className="py-8 text-center">
                    <h2 className="text-foreground text-lg font-semibold">Appointment Not Found</h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">Please select an appointment to edit.</p>
                </div>
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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Edit Appointment</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Update appointment details and information
                    </p>
                </div>
            </div>
            <div className="w-full">
                <NewAppointmentModal appointmentId={appointmentId} layout="page" />
            </div>
        </div>
    );
}
