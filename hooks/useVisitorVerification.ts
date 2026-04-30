import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatPhoneForSubmission, validatePhone } from "@/utils/phoneUtils";

interface VerificationHookProps {
    sendOtpMutation: (args: any) => { unwrap: () => Promise<any> };
    verifyOtpMutation: (args: any) => { unwrap: () => Promise<any> };
    contextId: string; // The token or slug
    contextKey: "token" | "slug"; // To distinguish between link flow and QR flow
    onVerified: (res: any, phone: string) => void;
    isSending?: boolean;
    isVerifying?: boolean;
}

/**
 * Custom hook to unify visitor phone verification logic across different flows.
 */
export function useVisitorVerification({
    sendOtpMutation,
    verifyOtpMutation,
    contextId,
    contextKey,
    onVerified,
    isSending: isSendingMutation,
    isVerifying: isVerifyingMutation
}: VerificationHookProps) {
    const [otpSent, setOtpSent] = useState(false);
    const [internalIsSending, setInternalIsSending] = useState(false);
    const [internalIsVerifying, setInternalIsVerifying] = useState(false);

    const isSending = isSendingMutation || internalIsSending;
    const isVerifying = isVerifyingMutation || internalIsVerifying;

    const handleSendOtp = async (phone: string, setOtpValue?: (val: string) => void) => {
        if (!validatePhone(phone)) {
            showErrorToast("Please enter a valid phone number.");
            return;
        }

        setInternalIsSending(true);
        try {
            const payload = { 
                [contextKey]: contextId, 
                phone: formatPhoneForSubmission(phone) 
            };
            
            await sendOtpMutation(payload).unwrap();
            setOtpSent(true);
            showSuccessToast("Verification code sent successfully.");

            // Master OTP logic for dev/staging
            const isDev = process.env.NEXT_PUBLIC_NODE_ENV === 'development' || process.env.NEXT_PUBLIC_NODE_ENV === 'staging';
            const masterOtp = process.env.NEXT_PUBLIC_MASTER_OTP;
            if (isDev && masterOtp && setOtpValue) {
                setOtpValue(masterOtp);
            }
        } catch (e: any) {
            showErrorToast(e?.data?.message || "Failed to send verification code. Please try again.");
        } finally {
            setInternalIsSending(false);
        }
    };

    const handleVerifyOtp = async (phone: string, otp: string) => {
        const cleanOtp = otp?.trim();
        if (!cleanOtp || cleanOtp.length < 6) {
            showErrorToast("Please enter the 6-digit verification code.");
            return;
        }

        setInternalIsVerifying(true);
        try {
            const formattedPhone = formatPhoneForSubmission(phone);
            const payload = { 
                [contextKey]: contextId, 
                phone: formattedPhone, 
                otp: cleanOtp 
            };

            const res = await verifyOtpMutation(payload).unwrap();
            onVerified(res, formattedPhone);
        } catch (e: any) {
            showErrorToast(e?.data?.message || "Invalid or expired verification code.");
        } finally {
            setInternalIsVerifying(false);
        }
    };

    return {
        otpSent,
        setOtpSent,
        isSending,
        isVerifying,
        handleSendOtp,
        handleVerifyOtp
    };
}
