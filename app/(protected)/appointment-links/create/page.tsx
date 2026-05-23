"use client";

import { useRouter } from "next/navigation";
import { CreateAppointmentLinkModal } from "@/components/appointment/CreateAppointmentLinkModal";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateAppointmentLinkPage() {
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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Create Appointment Link</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Generate and send a secure invite link to visitors by email or mobile.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <CreateAppointmentLinkModal
                    open={true}
                    renderMode="page"
                    onOpenChange={(open) => {
                        if (!open) {
                            router.push(routes.privateroute.APPOINTMENT_LINKS_SEND_LINK);
                        }
                    }}
                    onSuccess={() => {
                        router.push(routes.privateroute.APPOINTMENT_LINKS_SEND_LINK);
                    }}
                />
            </div>
        </div>
    );
}
