"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useInitiateWhatsAppVerificationMutation,
    useConfirmWhatsAppVerificationMutation,
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Save, Key, CheckCircle } from "lucide-react";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { InputField } from "@/components/common/inputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";
import { Badge } from "@/components/ui/badge";

// ─── Constants ────────────────────────────────────────────────────────────────

const MASKED = "••••••••";
const PHONE_REGEX = /^\d{10,15}$/;

// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = yup.object().shape({
    senderNumber: yup
        .string()
        .required("Sender phone number is required")
        .matches(PHONE_REGEX, "Phone number must be between 10 and 15 digits"),
    testNumber: yup
        .string()
        .required("Verification number is required")
        .matches(PHONE_REGEX, "Phone number must be between 10 and 15 digits"),
    phoneNumberId: yup.string().required("Phone Number ID is required"),
    accessToken: yup.string().required("Access Token is required"),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
    senderNumber: string;
    testNumber: string;
    phoneNumberId: string;
    accessToken: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WhatsAppSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    const [initiateVerify, { isLoading: isInitiatingVerify }] = useInitiateWhatsAppVerificationMutation();
    const [confirmVerify, { isLoading: isConfirmingVerify }] = useConfirmWhatsAppVerificationMutation();

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);

    useEffect(() => {
        if (settings) {
            setWhatsappEnabled(settings.notifications?.whatsappEnabled ?? false);
        }
    }, [settings]);

    const handleToggleWhatsapp = async () => {
        try {
            const newStatus = !whatsappEnabled;
            setWhatsappEnabled(newStatus);
            await updateSettings({
                notifications: {
                    emailEnabled: settings?.notifications?.emailEnabled ?? true,
                    whatsappEnabled: newStatus
                }
            }).unwrap();
            toast.success(`WhatsApp notifications ${newStatus ? 'enabled' : 'disabled'}`);
        } catch (err: any) {
            setWhatsappEnabled(whatsappEnabled);
            toast.error("Failed to update notification status");
        }
    };

    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        mode: "onBlur",
        defaultValues: {
            senderNumber: "",
            testNumber: "",
            phoneNumberId: "",
            accessToken: "",
        },
    });

    const currentAccessToken = watch("accessToken");

    // Populate form fields from API response (only when the form is clean)
    useEffect(() => {
        if (!settings || isDirty) return;

        reset({
            senderNumber: settings.whatsapp?.senderNumber || "",
            testNumber: settings.whatsapp?.testNumber || "",
            phoneNumberId: settings.whatsapp?.phoneNumberId || "",
            accessToken: settings.whatsapp?.accessToken || "",
        });
    }, [settings, reset, isDirty]);

    // ── Derived State ──────────────────────────────────────────────────────────

    const credentialsChanged =
        watch("phoneNumberId") !== (settings?.whatsapp?.phoneNumberId || "") ||
        (currentAccessToken !== MASKED && currentAccessToken !== (settings?.whatsapp?.accessToken || ""));

    const isVerified =
        !!settings?.whatsapp?.metaVerified || !!settings?.whatsapp?.verified;

    const needsVerification =
        credentialsChanged && (!!currentAccessToken && currentAccessToken !== MASKED);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const onSubmit = async (data: FormValues) => {
        if (needsVerification) {
            try {
                const whatsappConfig = {
                    activeProvider: 'meta',
                    senderNumber: data.senderNumber,
                    testNumber: data.testNumber,
                    phoneNumberId: data.phoneNumberId,
                    accessToken: data.accessToken,
                };

                await initiateVerify(whatsappConfig).unwrap();
                setShowOtpModal(true);
                toast.info("A verification code has been sent via WhatsApp.");
            } catch (err: any) {
                toast.error(err?.data?.message || "Failed to initiate verification.");
            }
            return;
        }

        try {
            await updateSettings({
                whatsapp: {
                    activeProvider: 'meta',
                    senderNumber: data.senderNumber,
                    testNumber: data.testNumber,
                },
            }).unwrap();
            toast.success("Settings updated successfully!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update settings.");
        }
    };

    const handleVerifyOtp = async () => {
        if (otpValue.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        }
        try {
            await confirmVerify({ otp: otpValue }).unwrap();
            setShowOtpModal(false);
            setOtpValue("");
            toast.success("WhatsApp configuration verified and saved!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Invalid or expired verification code.");
        }
    };

    if (error) {
        return <APIErrorState title="Failed to load settings" error={error} />;
    }

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            {/* ── Page Header ── */}
            <div className="mb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-foreground text-xl font-bold tracking-tight">
                            WhatsApp Configuration
                        </h1>

                        {isVerified ? (
                            <Badge className="bg-emerald-500 text-white border-transparent flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold shadow-sm">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Verified
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="text-muted-foreground border-dashed border-muted-foreground/30 flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold"
                            >
                                Not Verified
                            </Badge>
                        )}

                        <Badge
                            variant="outline"
                            className="bg-blue-50/50 text-blue-600 border-blue-100 flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-medium"
                        >
                            <Key className="h-3 w-3" />
                            Secure &amp; Encrypted
                        </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm font-medium">
                        Configure your official Meta WhatsApp Business API settings.
                    </p>
                </div>
            </div>

            {/* Notification Toggle */}
            <div className="mb-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all hover:border-green-500/30">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            whatsappEnabled ? "bg-[#3882a5]/10" : "bg-gray-100 dark:bg-gray-800"
                        )}>
                            <MessageSquare className={cn("h-5 w-5", whatsappEnabled ? "text-[#3882a5]" : "text-gray-400")} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">WhatsApp Notifications</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Master switch to turn all WhatsApp notifications ON or OFF</p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleWhatsapp}
                        className={cn(
                            "relative h-6 w-11 rounded-full p-1 transition-all duration-300",
                            whatsappEnabled
                                ? "bg-[#3882a5] shadow-[0_0_8px_rgba(56,130,165,0.4)]"
                                : "bg-gray-200 dark:bg-gray-700",
                        )}
                    >
                        <div
                            className={cn(
                                "h-4 w-4 rounded-full bg-white transition-all duration-300",
                                whatsappEnabled ? "translate-x-5" : "translate-x-0"
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* ── Form ── */}
            <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Controller
                            name="senderNumber"
                            control={control}
                            render={({ field }) => (
                                <PhoneInputField
                                    id="senderNumber"
                                    label="Sender Phone Number"
                                    value={field.value || ""}
                                    onChange={(val) => field.onChange(val)}
                                    placeholder="Enter sender number"
                                    error={errors.senderNumber?.message}
                                    required
                                    defaultCountry="in"
                                    helperText="The verified WhatsApp number for your account"
                                />
                            )}
                        />
                        <Controller
                            name="testNumber"
                            control={control}
                            render={({ field }) => (
                                <PhoneInputField
                                    id="testNumber"
                                    label="OTP Recipient Number"
                                    value={field.value || ""}
                                    onChange={(val) => field.onChange(val)}
                                    placeholder="Enter recipient number"
                                    error={errors.testNumber?.message}
                                    required
                                    defaultCountry="in"
                                    helperText="Number where you will receive the verification code"
                                />
                            )}
                        />
                    </div>

                    {/* Meta Fields */}
                    <div className="space-y-6 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Meta Cloud API Credentials</h3>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Meta Business API
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-muted/20 p-6 rounded-2xl border border-dashed">
                            <InputField
                                label="Phone Number ID"
                                placeholder="e.g. 10472938439201"
                                {...register("phoneNumberId")}
                                error={errors.phoneNumberId?.message}
                                required
                                className="h-12 bg-background border-border rounded-xl font-medium"
                            />
                            <InputField
                                label="Access Token"
                                type="password"
                                placeholder="EAAG...."
                                {...register("accessToken")}
                                error={errors.accessToken?.message}
                                required
                                className="h-12 bg-background border-border rounded-xl font-medium"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end border-t border-border/50">
                        <ActionButton
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            size="xl"
                            className="w-full px-8 sm:w-auto"
                        >
                            Cancel
                        </ActionButton>

                        <ActionButton
                            type="submit"
                            disabled={isUpdating || isInitiatingVerify}
                            variant="outline-primary"
                            size="xl"
                            className="w-full min-w-[200px] px-8 sm:w-auto"
                        >
                            {isUpdating || isInitiatingVerify ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>{isInitiatingVerify ? "Sending Code..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    <span>{needsVerification ? "Verify & Save" : "Save Settings"}</span>
                                </>
                            )}
                        </ActionButton>
                    </div>
                </form>
            </FormContainer>

            {/* ── OTP Verification Modal ── */}
            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            Verify WhatsApp
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            We&quot;ve sent a 6-digit verification code to your registered mobile number via WhatsApp.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-6 gap-6">
                        <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} className="gap-2">
                            <InputOTPGroup className="gap-2">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                        <p className="text-sm text-muted-foreground text-center">
                            Verify these credentials to enable WhatsApp notifications.
                        </p>
                    </div>

                    <DialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
                        <ActionButton
                            onClick={handleVerifyOtp}
                            disabled={isConfirmingVerify || otpValue.length !== 6}
                            className="w-full"
                            size="xl"
                        >
                            {isConfirmingVerify ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Complete Verification"
                            )}
                        </ActionButton>

                        <Button
                            variant="ghost"
                            onClick={() => setShowOtpModal(false)}
                            className="w-full text-muted-foreground font-medium"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
