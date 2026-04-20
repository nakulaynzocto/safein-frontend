"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Appointment, useSendCheckInOtpMutation, useVerifyCheckInOtpMutation } from "@/store/api/appointmentApi";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { LogIn, User, Calendar, Clock, Lock, Key, ShieldCheck, CheckCircle2, ImagePlus } from "lucide-react";
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

    const [sendOtp, { isLoading: isSendingOtp }] = useSendCheckInOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyCheckInOtpMutation();

    const [step, setStep] = useState<"initial" | "otp_verify" | "otp_success">("initial");
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [visitorPhotoUrl, setVisitorPhotoUrl] = useState<string>("");

    const isVerified = appointment?.isVerified || false;
    const visitorHasPhoto = !!((appointment as any)?.visitorId?.photo || appointment?.visitor?.photo);

    const requiresOtp = features?.enableVerification && !isVerified && step !== "otp_success";
    const requiresPhoto = features?.enableVisitorImageCapture && !visitorHasPhoto && !visitorPhotoUrl;

    useEffect(() => {
        if (open) {
            setStep("initial");
            setOtpSent(false);
            setOtpCode("");
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

    const handleSendOtp = async () => {
        try {
            await sendOtp(appointment._id).unwrap();
            setOtpSent(true);
            setStep("otp_verify");
            toast.success("OTP sent to visitor's phone number");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 4) {
             toast.error("Please enter a valid OTP");
             return;
        }
        try {
            await verifyOtp({ id: appointment._id, otp: otpCode }).unwrap();
            setStep("otp_success");
            toast.success("Visitor verified successfully!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Invalid OTP");
        }
    };

    const handleConfirmCheckIn = async () => {
        if (requiresOtp) {
            if (step === "initial") {
                // Should show OTP UI
                handleSendOtp();
                return;
            } else if (step === "otp_verify") {
                handleVerifyOtp();
                return;
            }
        }

        if (requiresPhoto && !visitorPhotoUrl) {
            toast.error("Please capture or upload visitor photo first.");
            return;
        }

        await onConfirm(appointment._id, undefined, visitorPhotoUrl);
    };

    const isNextActionLoading = isLoading || isSendingOtp || isVerifyingOtp;
    const isReadyForCheckIn = !requiresOtp && (!requiresPhoto || !!visitorPhotoUrl);

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
                                : requiresOtp && step !== "initial" 
                                    ? `Enter OTP sent to ${getVisitorPhone()}` 
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
                        {/* OTP Flow */}
                        {requiresOtp && (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 transition-all">
                                {step === "initial" && (
                                    <div className="flex items-center gap-3 text-orange-800 text-sm font-medium text-left">
                                        <ShieldCheck className="h-5 w-5 shrink-0" />
                                        Security verification (OTP) is required for this entry.
                                    </div>
                                )}
                                {step === "otp_verify" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-orange-900 uppercase tracking-widest flex items-center gap-1.5">
                                                <Key className="h-3 w-3" /> Enter OTP Code
                                            </label>
                                            <button 
                                                type="button" 
                                                disabled={isSendingOtp}
                                                onClick={handleSendOtp}
                                                className="text-xs text-orange-600 font-bold hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="e.g. 123456"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            className="h-11 rounded-xl text-center font-mono text-lg tracking-widest font-bold border-orange-200 bg-white placeholder:text-orange-200 focus-visible:ring-orange-500"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === "otp_success" && (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-2xl p-3 text-sm font-bold justify-center">
                                <CheckCircle2 className="h-5 w-5" /> Phone Verified
                            </div>
                        )}

                        {/* Image Capture Flow */}
                        {features?.enableVisitorImageCapture && (!requiresOtp) && (
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
                            ) : requiresOtp && step === "initial" ? (
                                <><Lock className="mr-2 h-4 w-4" /> Send Verification OTP</>
                            ) : requiresOtp && step === "otp_verify" ? (
                                <><Key className="mr-2 h-4 w-4" /> Verify OTP Code</>
                            ) : (
                                <><LogIn className="mr-2 h-4 w-4" /> Check In</>
                            )}
                        </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
