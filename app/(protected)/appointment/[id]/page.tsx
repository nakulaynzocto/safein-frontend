"use client";

import { useParams } from "next/navigation";

import { NewAppointmentModal } from "@/components/appointment/AppointmentForm";

export default function AppointmentEditPage() {
    const params = useParams();
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
            <div className="mb-3">
                <h1 className="text-foreground text-lg leading-tight font-semibold">Edit Appointment</h1>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    Update appointment details and information
                </p>
            </div>
            <div className="w-full">
                <NewAppointmentModal appointmentId={appointmentId} layout="page" />
            </div>
        </div>
    );
}
