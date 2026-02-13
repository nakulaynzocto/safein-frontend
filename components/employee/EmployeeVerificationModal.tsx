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

    // Initial send effect logic or button based? 
    // Let's make it manual first for safety/clarity unless requested auto.
    // User said "usme otp jaye" - implies automatic or straightforward.

    // We can auto-send when modal opens? Maybe safer to have a button so they don't spam by accident opening modal.
    // Let's have a "Send Verification Code" button effectively.

    const handleVerify = async () => {
        try {
            await verifyOtp({ id: employeeId, otp }).unwrap();
            showSuccessToast("Employee verified successfully! Credentials sent.");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to verify OTP");
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
                            <p className="text-sm text-gray-500">Enter the 6-digit code sent to the email.</p>
                            <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                            />
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
    );
}
