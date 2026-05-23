"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Link2, Zap, UserPlus, ClipboardList } from "lucide-react";
import { CreateAppointmentLinkModal } from "./CreateAppointmentLinkModal";
import { QuickAppointmentModal } from "./QuickAppointmentModal";
import { cn } from "@/lib/utils";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";

interface AppointmentLinkSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AppointmentLinkSelectionModal({
    open,
    onOpenChange,
    onSuccess,
}: AppointmentLinkSelectionModalProps) {
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showQuickModal, setShowQuickModal] = useState(false);

    const handleOptionSelect = (option: "link" | "quick") => {
        onOpenChange(false);
        if (option === "link") {
            setShowLinkModal(true);
        } else {
            setShowQuickModal(true);
        }
    };

    const hasInvites = !!modules?.enableInvites;
    const hasPriority = !!modules?.enablePriorityBooking;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Select Appointment Type</DialogTitle>
                        <DialogDescription>
                            Choose between sending a booking link or booking a special visitor instantly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className={cn(
                        "grid gap-4 py-6",
                        hasInvites && hasPriority ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                    )}>
                        {/* Option 1: Invite Link */}
                        {hasInvites && (
                            <button
                                onClick={() => handleOptionSelect("link")}
                                className={cn(
                                    "flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all group",
                                    "border-border hover:border-[#3882a5] hover:bg-[#3882a5]/5"
                                )}
                            >
                                <div className="p-4 rounded-full bg-[#3882a5]/5 text-[#3882a5] group-hover:scale-110 transition-transform">
                                    <Link2 className="h-8 w-8" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Invite Link</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Visitor fills their own details
                                    </p>
                                </div>
                            </button>
                        )}

                        {/* Option 2: Priority Booking */}
                        {hasPriority && (
                            <button
                                onClick={() => handleOptionSelect("quick")}
                                className={cn(
                                    "flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all group",
                                    "border-border hover:border-orange-500 hover:bg-orange-50"
                                )}
                            >
                                <div className="p-4 rounded-full bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                                    <Zap className="h-8 w-8" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Priority Booking</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Create appointment directly
                                    </p>
                                </div>
                            </button>
                        )}

                        {!hasInvites && !hasPriority && (
                            <div className="p-6 text-center text-muted-foreground">
                                No advanced booking modules enabled for your plan.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Render the actual modals */}
            <CreateAppointmentLinkModal
                open={showLinkModal}
                onOpenChange={setShowLinkModal}
                onSuccess={onSuccess}
            />

            <QuickAppointmentModal
                open={showQuickModal}
                onOpenChange={setShowQuickModal}
                onSuccess={onSuccess}
            />
        </>
    );
}
