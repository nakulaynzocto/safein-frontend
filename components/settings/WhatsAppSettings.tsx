"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useInitiateWhatsAppVerificationMutation,
    useConfirmWhatsAppVerificationMutation,
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Loader2,
    MessageSquare,
    Save,
    Key,
    Info,
    ListOrdered,
    Cloud,
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    WHATSAPP_META_TEMPLATES,
    WHATSAPP_META_TEMPLATE_LANGUAGE,
    WHATSAPP_PLAIN_TEXT_NOTE,
} from "@/constants/whatsappMetaTemplates";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { InputField } from "@/components/common/inputField";
import { MaskedInputField, MASKED_DISPLAY_VALUE } from "@/components/common/MaskedInputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { OtpVerificationModal } from "@/components/common/OtpVerificationModal";
import { useForm, Controller } from "react-hook-form";
import { useUserCountry } from "@/hooks/useUserCountry";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { validatePhone } from "@/utils/phoneUtils";
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
import { ProfileLayout } from "@/components/profile/profileLayout";

// ─── Validation Schema ────────────────────────────────────────────────────────


const schema = yup.object().shape({
    senderNumber: yup
        .string()
        .required("Sender phone number is required")
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
    testNumber: yup
        .string()
        .required("Verification number is required")
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
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
    const userCountry = useUserCountry();

    const [showOtpModal, setShowOtpModal] = useState(false);


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
        (currentAccessToken !== MASKED_DISPLAY_VALUE && currentAccessToken !== (settings?.whatsapp?.accessToken || ""));

    const isVerified =
        !!settings?.whatsapp?.metaVerified || !!settings?.whatsapp?.verified;

    const needsVerification =
        credentialsChanged && (!!currentAccessToken && currentAccessToken !== MASKED_DISPLAY_VALUE);

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

    const handleVerifyOtp = async (otpValue: string) => {
        if (otpValue.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        }
        try {
            await confirmVerify({ otp: otpValue }).unwrap();
            setShowOtpModal(false);
            toast.success("WhatsApp configuration verified and saved!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Invalid or expired verification code.");
        }
    };

    if (error) {
        return <APIErrorState title="Failed to load settings" error={error} />;
    }

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        {/* ── Page Header ── */}
                        <SettingsHeader
                            title="WhatsApp Configuration"
                            description="Connect your Meta WhatsApp Cloud API — credentials are stored per account (not on the server .env)."
                            isVerified={isVerified}
                            icon={Cloud}
                            extraBadges={
                                <Badge
                                    variant="outline"
                                    className="bg-blue-50/50 text-blue-600 border-blue-100 flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-medium"
                                >
                                    <Key className="h-3 w-3" />
                                    Secure &amp; Encrypted
                                </Badge>
                            }
                        />

                        {/* ── Credentials first (single page, no steps) ── */}
                        <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <Card className="border-border/80 shadow-sm rounded-2xl overflow-hidden">
                                    <CardHeader className="pb-2 border-b bg-muted/20">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Cloud className="h-5 w-5 text-[#3882a5]" aria-hidden />
                                                Meta Cloud API credentials
                                            </CardTitle>
                                            <Badge
                                                variant="outline"
                                                className="w-fit text-[10px] uppercase tracking-wider text-muted-foreground"
                                            >
                                                WhatsApp Cloud API
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-sm pt-1">
                                            From{" "}
                                            <strong className="text-foreground">developers.facebook.com</strong> → your app
                                            → WhatsApp → API Setup. Values are stored encrypted per account.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-8">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-muted/15 p-6 rounded-2xl border border-dashed border-border/80">
                                            <InputField
                                                label="Phone Number ID"
                                                placeholder="e.g. 10472938439201"
                                                {...register("phoneNumberId")}
                                                error={errors.phoneNumberId?.message}
                                                required
                                                className="h-12 bg-background border-border rounded-xl font-medium"
                                                helperText="From Meta → WhatsApp → API Setup"
                                            />
                                            <MaskedInputField
                                                label="Permanent access token"
                                                placeholder={isVerified ? MASKED_DISPLAY_VALUE : "EAAG...."}
                                                {...register("accessToken")}
                                                error={errors.accessToken?.message}
                                                required
                                                className="h-12 bg-background border-border rounded-xl font-medium"
                                                helperText={
                                                    isVerified
                                                        ? "Leave unchanged if masked to keep the current token"
                                                        : "System user or long-lived token with whatsapp_business_messaging"
                                                }
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-foreground">Phone numbers</h3>
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <Controller
                                                    name="senderNumber"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <PhoneInputField
                                                            id="senderNumber"
                                                            label="Sender phone number"
                                                            value={field.value || ""}
                                                            onChange={(val) => field.onChange(val)}
                                                            placeholder="Enter sender number"
                                                            error={errors.senderNumber?.message}
                                                            required
                                                            defaultCountry={userCountry}
                                                            helperText="Your WhatsApp Business display number"
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="testNumber"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <PhoneInputField
                                                            id="testNumber"
                                                            label="OTP recipient number"
                                                            value={field.value || ""}
                                                            onChange={(val) => field.onChange(val)}
                                                            placeholder="Enter recipient number"
                                                            error={errors.testNumber?.message}
                                                            required
                                                            defaultCountry={userCountry}
                                                            helperText="Where the verification code is sent"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end border-t border-border/50">
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
                                        variant="primary"
                                        size="xl"
                                        className="w-full min-w-[200px] px-8 sm:w-auto shadow-lg shadow-[#3882a5]/20 transition-all active:scale-[0.98]"
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

                        {/* ── Template guide below (reference only) ── */}
                        <div className="mt-10 space-y-4">
                            <h2 className="text-base font-bold text-foreground tracking-tight">
                                Message templates setup guide
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Approve these templates in Meta before notifications work. Same flow as before — no extra
                                steps here.
                            </p>

                            <Card className="border-border/80 shadow-sm rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <ListOrdered className="h-4 w-4 text-[#3882a5]" />
                                        Before messages deliver
                                    </CardTitle>
                                    <CardDescription>
                                        In <strong>Meta Business Suite</strong> or{" "}
                                        <strong>developers.facebook.com</strong>, create or approve these{" "}
                                        <strong>template names</strong> for your WhatsApp Business account. Our app sends
                                        them with language code{" "}
                                        <Badge variant="secondary" className="mx-0.5 align-middle text-[10px]">
                                            {WHATSAPP_META_TEMPLATE_LANGUAGE}
                                        </Badge>
                                        .
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                                        <li>Open your app → WhatsApp → API Setup (Cloud API).</li>
                                        <li>
                                            Under <strong>Message templates</strong>, ensure each row below exists and is{" "}
                                            <strong>Approved</strong> (same names, English).
                                        </li>
                                        <li>Body wording can match your brand, but variable count and order must align.</li>
                                    </ol>

                                    <div className="overflow-x-auto rounded-xl border bg-muted/10">
                                        <table className="w-full min-w-[640px] text-left text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                                                    <th className="px-4 py-3 font-semibold">Template name</th>
                                                    <th className="px-4 py-3 font-semibold">Used for</th>
                                                    <th className="px-4 py-3 font-semibold">Body variables</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {WHATSAPP_META_TEMPLATES.map((row) => (
                                                    <tr key={row.name} className="border-b border-border/60 last:border-0">
                                                        <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                                                            {row.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">{row.usedFor}</td>
                                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                                            {row.variables}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100">
                                        <Info className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                                        <p>
                                            <strong>Plain text (not a template):</strong> {WHATSAPP_PLAIN_TEXT_NOTE}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* OTP Verification Modal */}
                        <OtpVerificationModal
                            isOpen={showOtpModal}
                            onClose={() => setShowOtpModal(false)}
                            onVerify={(otp) => handleVerifyOtp(otp)}
                            isLoading={isConfirmingVerify}
                            length={6}
                            title="Verify WhatsApp API"
                            description="We sent a 6-digit code via your Meta WhatsApp Cloud API credentials. Enter it to confirm connection."
                        />
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
