"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { useSendVisitorOtpMutation, useVerifyVisitorOtpMutation } from "@/store/api/appointmentLinkApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { CheckCircle2, MessageSquare, Phone, Timer } from "lucide-react";
import { useUserCountry } from "@/hooks/useUserCountry";
import { validatePhone } from "@/utils/phoneUtils";
import { OtpDigitBoxes } from "@/components/common/otpDigitBoxes";

interface OtpVerificationStepProps {
    token: string;
    initialPhone?: string;
    onVerified: (phone: string) => void;
    companyName?: string;
}

export function OtpVerificationStep({
    token,
    initialPhone = "",
    onVerified,
    companyName = "SafeIn"
}: OtpVerificationStepProps) {
    const userCountry = useUserCountry();
    const [phone, setPhone] = useState(initialPhone);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);

    const [sendOtp, { isLoading: isSending }] = useSendVisitorOtpMutation();
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyVisitorOtpMutation();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    const handleSendOtp = async () => {
        if (!phone || !validatePhone(phone)) {
            showErrorToast("Please enter a valid mobile number with country code");
            return;
        }

        try {
            await sendOtp({ phone, token }).unwrap();
            showSuccessToast(`OTP sent to WhatsApp: ${phone}`);
            setIsOtpSent(true);
            setTimer(60); // 60 seconds resend timer
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to send OTP. Please check the number.");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            showErrorToast("Please enter the 6-digit OTP");
            return;
        }

        try {
            await verifyOtp({ phone, otp }).unwrap();
            showSuccessToast("Phone verified successfully");
            onVerified(phone);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    // Auto-verify when OTP length reaches 6
    useEffect(() => {
        if (otp.length === 6 && isOtpSent) {
            handleVerifyOtp();
        }
    }, [otp, isOtpSent]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="rounded-2xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-4 text-center sm:text-left">
                <h3 className="text-lg font-bold text-[#1f4f67] flex items-center justify-center sm:justify-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#3882a5]" />
                    Step 1: Verify Mobile Number
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                    Security ke liye apka mobile number verify kiya jayega.
                </p>
            </div>

            <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-2 sm:p-6 shadow-sm">
                {!isOtpSent ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <PhoneInputField
                                id="phone"
                                label="Mobile Number"
                                value={phone}
                                onChange={setPhone}
                                defaultCountry={userCountry}
                                placeholder="Enter mobile number"
                                className="h-12 text-lg font-medium"
                            />
                        </div>
                        <Button 
                            onClick={handleSendOtp} 
                            disabled={isSending || !phone}
                            className="h-12 w-full bg-[#3882a5] hover:bg-[#2d6a87] text-white rounded-xl text-md font-bold shadow-md"
                        >
                            {isSending ? <LoadingSpinner size="sm" className="mr-2" /> : <Phone className="mr-2 h-4 w-4" />}
                            Send OTP via WhatsApp
                        </Button>
                        <p className="text-[11px] text-center text-slate-400 font-medium italic">
                            OTP will be sent to your WhatsApp number for verification.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full mb-3">
                                <MessageSquare className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-slate-900">Enter OTP</h4>
                            <p className="text-sm text-slate-500">We've sent a 6-digit code to <span className="font-bold text-slate-700">{phone}</span></p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <OtpDigitBoxes
                                    value={otp}
                                    onChange={setOtp}
                                    length={6}
                                    disabled={isVerifying}
                                />
                            </div>

                            <Button 
                                onClick={handleVerifyOtp} 
                                disabled={isVerifying || otp.length < 6}
                                className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-md font-bold shadow-md"
                            >
                                {isVerifying ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Verify & Continue
                            </Button>

                            <div className="flex flex-col items-center gap-3 pt-2">
                                <button
                                    onClick={() => setIsOtpSent(false)}
                                    className="text-sm font-semibold text-slate-500 hover:text-[#3882a5] transition-colors"
                                >
                                    Change phone number?
                                </button>
                                
                                {timer > 0 ? (
                                    <p className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                        <Timer className="h-3 w-3" />
                                        Resend OTP in <span className="text-slate-600 font-bold">{timer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isSending}
                                        className="text-sm font-bold text-[#3882a5] hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">
                    SafeIn uses end-to-end encryption for your privacy.
                </p>
            </div>
        </div>
    );
}
