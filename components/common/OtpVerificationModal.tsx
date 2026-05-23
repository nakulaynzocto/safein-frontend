"use client";

import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OtpDigitBoxes } from "@/components/common/otpDigitBoxes";
import { Key } from "lucide-react";
import { LoadingSpinner } from "@/components/common/loadingSpinner";

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
    isLoading: boolean;
    length?: number;
    title?: string;
    description?: string;
}

export function OtpVerificationModal({
    isOpen,
    onClose,
    onVerify,
    isLoading,
    length = 6,
    title = "Verify OTP",
    description = "Enter the code sent to your device to proceed.",
}: OtpVerificationModalProps) {
    const [otp, setOtp] = useState("");

    // Auto-verify when OTP length matches the requirement
    useEffect(() => {
        if (otp.length === length && isOpen && !isLoading) {
            onVerify(otp);
        }
    }, [otp, length, isOpen, isLoading, onVerify]);

    // Reset OTP when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setOtp("");
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                        <Key className="h-6 w-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold tracking-tight">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground font-medium pt-1">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-8 flex flex-col items-center">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Secure Verification Code
                    </label>
                    <OtpDigitBoxes
                        value={otp}
                        onChange={setOtp}
                        length={length}
                        disabled={isLoading}
                    />
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onVerify(otp)}
                        disabled={isLoading || otp.length < length}
                        className="bg-[#3882a5] hover:bg-[#2d6a87] text-white rounded-xl px-8 font-bold shadow-md h-11"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2 h-4 w-4 border-white" />
                                Verifying...
                            </>
                        ) : (
                            "Verify & Continue"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
