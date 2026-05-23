"use client";

import { useRouter } from "next/navigation";
import { QuickAppointmentModal } from "@/components/appointment/QuickAppointmentModal";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateVipBookingPage() {
    const router = useRouter();

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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Create Special Visitor Booking</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Add priority visitor details and generate OTP based booking instantly.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <QuickAppointmentModal
                    open={true}
                    renderMode="page"
                    onOpenChange={(open) => {
                        if (!open) {
                            router.push(routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING);
                        }
                    }}
                    onSuccess={() => {
                        router.push(routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING);
                    }}
                />
            </div>
        </div>
    );
}
