"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    useGetSettingsQuery,
    useRemoveSMSConfigMutation,
    useSaveSMSConfigMutation,
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Save, ShieldAlert, Trash2 } from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { InputField } from "@/components/common/inputField";
import { MaskedInputField, MASKED_DISPLAY_VALUE } from "@/components/common/MaskedInputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { Badge } from "@/components/ui/badge";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";

const schema = yup.object().shape({
    provider: yup.string().oneOf(["twilio", "msg91", "fast2sms"]).required("Provider is required"),
    // Twilio
    accountSid: yup.string().when("provider", {
        is: "twilio",
        then: (schema) => schema.trim().required("Account SID is required"),
        otherwise: (schema) => schema.strip(),
    }),
    authToken: yup.string().optional(),
    fromNumber: yup.string().when("provider", {
        is: "twilio",
        then: (schema) =>
            schema
                .trim()
                .matches(/^[+]?[1-9][\d]{0,15}$/, "Use E.164 format (e.g. +15551234567)")
                .required("Sender number is required"),
        otherwise: (schema) => schema.strip(),
    }),
    // Msg91
    authKey: yup.string().when("provider", {
        is: "msg91",
        then: (schema) => schema.trim().required("Auth Key is required"),
        otherwise: (schema) => schema.strip(),
    }),
    senderId: yup.string().when("provider", {
        is: "msg91",
        then: (schema) => schema.trim().required("Sender ID is required"),
        otherwise: (schema) => schema.strip(),
    }),
    templateId: yup.string().when("provider", {
        is: "msg91",
        then: (schema) => schema.trim().required("Template ID (Flow) is required"),
        otherwise: (schema) => schema.strip(),
    }),
    // Fast2SMS
    apiKey: yup.string().when("provider", {
        is: "fast2sms",
        then: (schema) => schema.trim().required("API Key is required"),
        otherwise: (schema) => schema.strip(),
    }),
});

interface FormValues {
    provider: "twilio" | "msg91" | "fast2sms";
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
    authKey?: string;
    senderId?: string;
    templateId?: string;
    apiKey?: string;
}

export function SMSSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [saveSMS, { isLoading: isSaving }] = useSaveSMSConfigMutation();
    const [removeSMS, { isLoading: isRemoving }] = useRemoveSMSConfigMutation();
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

    const isVerified = !!settings?.sms?.verified;
    const currentProvider = settings?.sms?.provider || "twilio";

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        mode: "onBlur",
        defaultValues: {
            provider: "twilio" as const,
            accountSid: "",
            authToken: "",
            fromNumber: "",
            authKey: "",
            senderId: "",
            templateId: "",
            apiKey: "",
        },
    });

    const selectedProvider = watch("provider");

    useEffect(() => {
        if (!settings?.sms || isDirty) return;
        const s = settings.sms;
        reset({
            provider: (s.provider as any) || "twilio",
            accountSid: s.accountSid || "",
            authToken: s.authToken || "",
            fromNumber: s.fromNumber || "",
            authKey: s.authKey || "",
            senderId: s.senderId || "",
            templateId: s.templateId || "",
            apiKey: s.apiKey || "",
        });
    }, [settings, reset, isDirty]);

    const onSubmit = async (data: FormValues) => {
        const payload: any = { provider: data.provider };

        if (data.provider === "twilio") {
            payload.accountSid = data.accountSid?.trim();
            payload.authToken = data.authToken === MASKED_DISPLAY_VALUE ? "" : data.authToken?.trim() || "";
            payload.fromNumber = data.fromNumber?.trim();
            if (!payload.authToken && !isVerified) {
                toast.error("Please enter your Twilio Auth Token.");
                return;
            }
        } else if (data.provider === "msg91") {
            payload.authKey = data.authKey === MASKED_DISPLAY_VALUE ? "" : data.authKey?.trim() || "";
            payload.senderId = data.senderId?.trim();
            payload.templateId = data.templateId?.trim();
            if (!payload.authKey && !isVerified) {
                toast.error("Please enter your Msg91 Auth Key.");
                return;
            }
        } else if (data.provider === "fast2sms") {
            payload.apiKey = data.apiKey === MASKED_DISPLAY_VALUE ? "" : data.apiKey?.trim() || "";
            if (!payload.apiKey && !isVerified) {
                toast.error("Please enter your Fast2SMS API Key.");
                return;
            }
        }

        try {
            const result = await saveSMS(payload).unwrap();
            toast.success(
                `SMS configuration saved for ${data.provider}. A test SMS was sent to your profile mobile number.`
            );
            if (result.sms) {
                reset({
                    provider: (result.sms.provider as any) || "twilio",
                    accountSid: result.sms.accountSid || "",
                    authToken: result.sms.authToken ? MASKED_DISPLAY_VALUE : "",
                    fromNumber: result.sms.fromNumber || "",
                    authKey: result.sms.authKey ? MASKED_DISPLAY_VALUE : "",
                    senderId: result.sms.senderId || "",
                    templateId: result.sms.templateId || "",
                    apiKey: result.sms.apiKey ? MASKED_DISPLAY_VALUE : "",
                });
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Verification failed. Please check your credentials.");
        }
    };


    const onConfirmRemove = async () => {
        try {
            await removeSMS().unwrap();
            toast.success("SMS configuration removed.");
            reset({
                provider: "twilio",
                accountSid: "",
                authToken: "",
                fromNumber: "",
                authKey: "",
                senderId: "",
                templateId: "",
                apiKey: "",
            });
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to remove SMS settings.");
        } finally {
            setConfirmRemoveOpen(false);
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
                        <SettingsHeader
                            title="SMS Gateway"
                            description="Configure a popular SMS provider to send appointment alerts to visitors and employees. A test message is sent to your profile mobile number to verify the setup."
                            isVerified={isVerified}
                            providerName={currentProvider}
                            icon={MessageSquare}
                        />



                        <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <div className="space-y-6 pt-2">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-foreground">Select Provider</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: "twilio", name: "Twilio" },
                                                { id: "msg91", name: "Msg91" },
                                                { id: "fast2sms", name: "Fast2SMS" },
                                            ].map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setValue("provider", p.id as any, { shouldDirty: true })}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                        selectedProvider === p.id
                                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                            : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                                    }`}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="text-sm font-semibold text-foreground">Gateway Credentials</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 bg-muted/20 p-6 rounded-2xl border border-dashed">
                                        {selectedProvider === "twilio" && (
                                            <>
                                                <InputField
                                                    label="Account SID"
                                                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                    {...register("accountSid")}
                                                    error={errors.accountSid?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                                <MaskedInputField
                                                    label="Auth Token"
                                                    placeholder={isVerified && currentProvider === "twilio" ? MASKED_DISPLAY_VALUE : "Your auth token"}
                                                    {...register("authToken")}
                                                    error={errors.authToken?.message}
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                                <InputField
                                                    label="From (Twilio number)"
                                                    placeholder="+15551234567"
                                                    {...register("fromNumber")}
                                                    error={errors.fromNumber?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                    helperText="Use E.164 format"
                                                />
                                            </>
                                        )}

                                        {selectedProvider === "msg91" && (
                                            <>
                                                <MaskedInputField
                                                    label="Auth Key"
                                                    placeholder={isVerified && currentProvider === "msg91" ? MASKED_DISPLAY_VALUE : "Your msg91 auth key"}
                                                    {...register("authKey")}
                                                    error={errors.authKey?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                                <InputField
                                                    label="Sender ID"
                                                    placeholder="SAFEIN"
                                                    {...register("senderId")}
                                                    error={errors.senderId?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                    helperText="6-character Sender ID (for India DLT)"
                                                />
                                                <InputField
                                                    label="Template ID (Flow)"
                                                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                    {...register("templateId")}
                                                    error={errors.templateId?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                    helperText="Enter the Flow ID from your Msg91 Dashboard"
                                                />
                                            </>
                                        )}

                                        {selectedProvider === "fast2sms" && (
                                            <MaskedInputField
                                                label="API Key"
                                                placeholder={isVerified && currentProvider === "fast2sms" ? MASKED_DISPLAY_VALUE : "Your fast2sms api key"}
                                                {...register("apiKey")}
                                                error={errors.apiKey?.message}
                                                required
                                                className="h-12 bg-background border-border rounded-xl font-medium"
                                            />
                                        )}
                                    </div>
                                </div>
                                </div>

                                <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between border-t border-border/50">
                                    <div className="flex flex-wrap gap-2">
                                        {isVerified && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="text-destructive border-destructive/30 hover:bg-destructive/5 rounded-xl h-11 px-6 font-semibold"
                                                disabled={isRemoving}
                                                onClick={() => setConfirmRemoveOpen(true)}
                                            >
                                                {isRemoving ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Remove config
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                        <ActionButton
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            size="xl"
                                            className="px-8"
                                        >
                                            Cancel
                                        </ActionButton>
                                        <ActionButton
                                            type="submit"
                                            disabled={isSaving}
                                            variant="primary"
                                            size="xl"
                                            className="min-w-[200px] shadow-lg shadow-primary/20"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    <span>Verify &amp; Save</span>
                                                </>
                                            )}
                                        </ActionButton>
                                    </div>
                                </div>
                            </form>
                        </FormContainer>

                        <ConfirmationDialog
                            open={confirmRemoveOpen}
                            onOpenChange={setConfirmRemoveOpen}
                            title="Remove SMS configuration?"
                            description="SMS alerts will stop until you configure a provider again."
                            confirmText="Remove"
                            cancelText="Cancel"
                            onConfirm={onConfirmRemove}
                            variant="warning"
                        />
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}

