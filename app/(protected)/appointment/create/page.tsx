"use client";

import { NewAppointmentModal } from "@/components/appointment/AppointmentForm";
import { CalendarPlus } from "lucide-react";

// Page: appoitment create (non-modal page version)
export default function AppoitmentCreate() {
    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-3">
                <h1 className="text-foreground text-lg leading-tight font-semibold">Schedule New Appointment</h1>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    Create a new appointment by selecting visitor, employee, and appointment details
                </p>
            </div>
            <div className="w-full">
                <NewAppointmentModal layout="page" />
            </div>
        </div>
    );
}
