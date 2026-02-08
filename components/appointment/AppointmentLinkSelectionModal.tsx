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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                        {/* Option 1: Send Link */}
                        <button
                            onClick={() => handleOptionSelect("link")}
                            className={cn(
                                "flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all group",
                                "border-border hover:border-[#3882a5] hover:bg-[#3882a5]/5"
                            )}
                        >
                            <div className="p-4 rounded-full bg-blue-50 text-[#3882a5] group-hover:scale-110 transition-transform">
                                <Link2 className="h-8 w-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Send Link</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Visitor fills their own details
                                </p>
                            </div>
                        </button>

                        {/* Option 2: Special Visitor */}
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
                                <h3 className="font-bold text-lg">Special Visitor</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Instantly book appointment
                                </p>
                            </div>
                        </button>
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
