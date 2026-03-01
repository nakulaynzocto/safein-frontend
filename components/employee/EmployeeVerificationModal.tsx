"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployeeVerifyOtpMutation, useEmployeeSendOtpMutation } from "@/store/api/employeeApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";

import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { AddonPurchaseModal } from "@/components/common/AddonPurchaseModal";

interface EmployeeVerificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    employeeName: string;
    email: string;
    onSuccess: () => void;
}

export function EmployeeVerificationModal({
    open,
    onOpenChange,
    employeeId,
    employeeName,
    email,
    onSuccess,
}: EmployeeVerificationModalProps) {
    const [otp, setOtp] = useState("");
    const [verifyOtp, { isLoading: isVerifying }] = useEmployeeVerifyOtpMutation();
    const [sendOtp, { isLoading: isSending }] = useEmployeeSendOtpMutation();
    const [otpSent, setOtpSent] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [limitErrorMessage, setLimitErrorMessage] = useState("");

    const handleVerify = async (otpToVerify?: string) => {
        const finalOtp = otpToVerify || otp;
        if (!finalOtp || finalOtp.length < 6) return;

        try {
            await verifyOtp({ id: employeeId, otp: finalOtp }).unwrap();
            showSuccessToast("Employee verified successfully! Credentials sent.");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to verify:", error);
            if (error?.status === 403 && error?.data?.message?.includes('limit')) {
                setLimitErrorMessage(error?.data?.message || "Limit reached. Please upgrade your plan.");
                // Since verification implies activation, and we don't have isExpired prop here, 
                // we'll default to Addon unless we want to pass isExpired too.
                // Assuming active subscription if they are verifying. If expired, they probably can't even get here or will see upgrade.
                // Let's default to Addon as safe bet for "more slots needed".
                setShowAddonModal(true);
            } else {
                showErrorToast(error?.data?.message || "Failed to verify OTP");
            }
        }
    };

    const handleSendOtp = async () => {
        try {
            await sendOtp(employeeId).unwrap();
            showSuccessToast(`OTP sent to ${email}`);
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
                        <DialogTitle>Verify Employee - {employeeName}</DialogTitle>
                        <DialogDescription>
                            To verify this employee, we need to send a One-Time Password (OTP) to <strong>{email}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {!otpSent ? (
                        <div className="py-6 flex justify-center">
                            <Button onClick={handleSendOtp} disabled={isSending}>
                                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Verification OTP
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 text-center">Enter the 6-digit code sent to the email.</p>
                                <div className="flex justify-center py-2">
                                    <InputOTP
                                        id="otp"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => {
                                            setOtp(value);
                                            if (value.length === 6) {
                                                // Small delay to allow user to see the last digit before auto-verifying
                                                setTimeout(() => handleVerify(value), 100);
                                            }
                                        }}
                                        containerClassName="gap-2"
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-xl font-bold transition-all focus-within:border-[#3882a5] focus-within:ring-[#3882a5]/20 focus-within:bg-white"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="link" size="sm" onClick={handleSendOtp} disabled={isSending || isVerifying}>
                                    {isSending ? "Sending..." : "Resend OTP"}
                                </Button>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {otpSent && (
                            <Button onClick={handleVerify} disabled={!otp || isVerifying || otp.length < 6}>
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify & Activate"
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
            <AddonPurchaseModal
                isOpen={showAddonModal}
                onClose={() => { setShowAddonModal(false); setLimitErrorMessage(""); }}
                addonType="employee"
                message={limitErrorMessage}
            />
        </>
    );
}
