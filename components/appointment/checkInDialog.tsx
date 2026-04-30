"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Appointment } from "@/store/api/appointmentApi";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { LogIn, User, Calendar, Clock, ShieldCheck, CheckCircle2, ImagePlus } from "lucide-react";
import { formatDate, formatTime } from "@/utils/helpers";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CheckInDialogProps {
    appointment: Appointment | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: string, notes?: string, visitorPhoto?: string) => Promise<void>;
    isLoading?: boolean;
}

export function CheckInDialog({ appointment, open, onClose, onConfirm, isLoading = false }: CheckInDialogProps) {
    const { data: settingsData } = useGetSettingsQuery();
    const features = settingsData?.features;



    const [step, setStep] = useState<"initial">("initial");
    const [visitorPhotoUrl, setVisitorPhotoUrl] = useState<string>("");

    const isVerified = appointment?.isVerified || false;
    const visitorHasPhoto = !!((appointment as any)?.visitorId?.photoUrl || (appointment?.visitor as any)?.photoUrl || (appointment as any)?.visitorId?.photo || (appointment?.visitor as any)?.photo);
    const requiresPhoto = features?.enableVisitorImageCapture && !visitorHasPhoto && !visitorPhotoUrl;
    useEffect(() => {
        if (open) {
            setStep("initial");
            setVisitorPhotoUrl("");
        }
    }, [open]);

    if (!appointment) return null;

    const getVisitorName = () => {
        return (appointment as any).visitorId?.name || appointment.visitor?.name || "N/A";
    };
    
    const getVisitorPhone = () => {
         return (appointment as any).visitorId?.phone || appointment.visitor?.phone || "";
    }



    const handleConfirmCheckIn = async () => {

        if (requiresPhoto && !visitorPhotoUrl) {
            toast.error("Please capture or upload visitor photo first.");
            return;
        }

        await onConfirm(appointment._id, undefined, visitorPhotoUrl);
    };

    const isNextActionLoading = isLoading;
    const isReadyForCheckIn = !requiresPhoto || !!visitorPhotoUrl;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px] rounded-3xl border-none shadow-2xl bg-white p-0 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh]">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="text-center">
                    <div className={cn(
                        "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                        "bg-accent/10 text-accent"
                    )}>
                        {isReadyForCheckIn ? <CheckCircle2 className="h-8 w-8" /> : <LogIn className="h-8 w-8" />}
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                            Check In Visitor
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-center mt-2">
                            {isReadyForCheckIn 
                                ? "All security requirements met. Ready to check in." 
                                    : "Complete security verification to grant premises entry."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Visitor Context Card */}
                    <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <User className="h-5 w-5 text-accent" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visitor</div>
                                <div className="font-bold text-slate-700 truncate">{getVisitorName()}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                            <div className="space-y-1 text-left">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {formatDate(appointment.appointmentDetails?.scheduledDate || "")}
                                </div>
                            </div>
                            <div className="space-y-1 text-left">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {appointment.appointmentDetails?.scheduledTime ? formatTime(appointment.appointmentDetails.scheduledTime) : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Action Area */}
                    <div className="mt-5 space-y-4">


                        {features?.enableVisitorImageCapture && (
                            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-left">
                                <div className="text-xs font-bold text-sky-900 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                    <ImagePlus className="h-4 w-4" /> Live Image Capture
                                </div>
                                <div className="text-sm text-sky-700 mb-3 font-medium">
                                    Security policy requires a live visitor photo before check-in.
                                </div>
                            <ImageUploadField
                                value={visitorPhotoUrl}
                                onChange={(val) => setVisitorPhotoUrl(typeof val === "string" ? val : "")}
                                enableImageCapture={true}
                                directCameraOnly={true}
                                placeholder="Capture Photo"
                                shape="square"
                                aspectRatio="square"
                                className="mx-auto max-w-[200px]"
                            />
                            </div>
                        )}
                    </div>
            </div>
        </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 bg-slate-50 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isNextActionLoading}
                        className="w-full sm:w-auto h-11 rounded-2xl border-accent text-accent hover:bg-accent/10 font-bold transition-all px-8"
                    >
                        Cancel
                    </Button>
                        <Button
                            onClick={handleConfirmCheckIn}
                            disabled={isNextActionLoading}
                            className={cn(
                                "w-full sm:w-auto min-w-0 sm:min-w-[140px] h-12 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-[0.98] px-8",
                                "bg-accent hover:bg-accent/90 shadow-accent/20"
                            )}
                        >
                            {isNextActionLoading ? (
                                <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-r-transparent border-white" /> Processing...</>
                            ) : isReadyForCheckIn ? (
                                <><LogIn className="mr-2 h-4 w-4" /> Finalize Check-In</>
                            ) : (
                                <><LogIn className="mr-2 h-4 w-4" /> Check In</>
                            )}
                        </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
