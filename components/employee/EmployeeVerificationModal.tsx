"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEmployeeVerifyOtpMutation, useEmployeeSendOtpMutation } from "@/store/api/employeeApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";

import { UpgradePlanModal } from "@/components/common/upgradePlanModal";

interface EmployeeVerificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    employeeName: string;
    email: string;
    phone: string;
    type: 'email' | 'phone';
    onSuccess: () => void;
}

export function EmployeeVerificationModal({
    open,
    onOpenChange,
    employeeId,
    employeeName,
    email,
    phone,
    type,
    onSuccess,
}: EmployeeVerificationModalProps) {
    const [otp, setOtp] = useState("");
    const [verifyOtp, { isLoading: isVerifying }] = useEmployeeVerifyOtpMutation();
    const [sendOtp, { isLoading: isSending }] = useEmployeeSendOtpMutation();
    const [otpSent, setOtpSent] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitErrorMessage, setLimitErrorMessage] = useState("");

    const handleVerify = async (otpToVerify?: string) => {
        const finalOtp = otpToVerify || otp;
        if (!finalOtp || finalOtp.length < 6) return;

        try {
            await verifyOtp({ id: employeeId, otp: finalOtp, type }).unwrap();
            showSuccessToast(`Employee ${type} verified successfully!`);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to verify:", error);
            if (error?.status === 403 && error?.data?.message?.includes('limit')) {
                setLimitErrorMessage(error?.data?.message || "Limit reached. Please upgrade your plan.");
                setShowUpgradeModal(true);
            } else {
                showErrorToast(error?.data?.message || "Failed to verify OTP");
            }
        }
    };

    const handleSendOtp = async () => {
        try {
            await sendOtp({ id: employeeId, type }).unwrap();
            const destination = type === 'email' ? email : phone;
            showSuccessToast(`OTP sent to ${destination}`);
            setOtpSent(true);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to send OTP");
        }
    };

    // Reset state when modal closes/opens
    useEffect(() => {
        if (open) {
            setOtp("");
            setOtpSent(false);
        }
    }, [open]);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verify Employee {type === 'phone' ? 'Mobile' : 'Email'}</DialogTitle>
                        <DialogDescription>
                            To verify this employee, we need to send a One-Time Password (OTP) to <strong>{type === 'phone' ? phone : email}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {!otpSent ? (
                        <div className="py-8 flex flex-col items-center gap-6">
                            <Button 
                                onClick={handleSendOtp} 
                                disabled={isSending}
                                className="bg-[#3882a5] hover:bg-[#2c6885] text-white font-black text-[10px] uppercase tracking-[0.2em] h-14 rounded-2xl px-10 shadow-xl shadow-[#3882a5]/10 active:scale-95 transition-all w-full sm:w-auto"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Transmitting...
                                    </>
                                ) : (
                                    "Send Verification OTP"
                                )}
                            </Button>
                            
                            <button 
                                onClick={() => onOpenChange(false)}
                                className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
                            >
                                Dismiss Matrix
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 py-6 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="space-y-4">
                                <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-wider">Synchronizing Node: {type === 'phone' ? 'Mobile' : 'Email'}</p>
                                <div className="flex justify-center py-2">
                                    <InputOTP
                                        id="otp"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => {
                                            setOtp(value);
                                            if (value.length === 6) {
                                                setTimeout(() => handleVerify(value), 100);
                                            }
                                        }}
                                        containerClassName="gap-2"
                                    >
                                        <InputOTPGroup className="gap-2 sm:gap-3">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="h-12 w-10 sm:h-16 sm:w-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-xl font-black transition-all focus-within:border-[#3882a5] focus-within:ring-4 focus-within:ring-[#3882a5]/5 focus-within:bg-white"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button 
                                    onClick={() => handleVerify()} 
                                    disabled={!otp || isVerifying || otp.length < 6}
                                    className="bg-[#3882a5] hover:bg-[#2c6885] text-white font-black text-[10px] uppercase tracking-[0.2em] h-14 rounded-2xl px-8 shadow-xl shadow-[#3882a5]/10 active:scale-95 transition-all w-full"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing Cipher...
                                        </>
                                    ) : (
                                        "Verify & Activate Node"
                                    )}
                                </Button>

                                <div className="flex items-center justify-between px-2">
                                    <button 
                                        onClick={handleSendOtp} 
                                        disabled={isSending || isVerifying}
                                        className="text-[9px] font-black text-accent uppercase tracking-widest hover:opacity-70 transition-opacity disabled:opacity-50"
                                    >
                                        {isSending ? "Resending..." : "Request New OTP"}
                                    </button>
                                    <button 
                                        onClick={() => onOpenChange(false)}
                                        className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </>
    );
}
