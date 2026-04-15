"use client";

import { useEffect, useState } from "react";
import { useGetSettingsQuery, useSaveVoiceConfigMutation } from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, PhoneCall, Save, PhoneForwarded, RefreshCw, Power, Wallet, Info } from "lucide-react";
import { useGetWalletBalanceQuery } from "@/store/api/walletApi";
import { SettingsHeader } from "./SettingsHeader";
import { InputField } from "@/components/common/inputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditBalancePill } from "@/components/dashboard/CreditBalancePill";
import { PhoneInputField } from "@/components/common/phoneInputField";

const schema = yup.object().shape({
    enabled: yup.boolean().default(false),
    backupEnabled: yup.boolean().default(false),
    backupNumber: yup.string()
        .trim()
        .when("backupEnabled", {
            is: true,
            then: (schema) => schema
                .matches(/^[+]?[1-9][\d]{0,15}$/, "Use E.164 format (e.g. +919876543210)")
                .required("Backup number is required when backup calling is enabled"),
            otherwise: (schema) => schema.optional(),
        }),
    maxRetries: yup.number()
        .min(1, "Minimum 1 retry")
        .max(5, "Maximum 5 retries")
        .when("enabled", {
            is: true,
            then: (schema) => schema.required("Retry limit is required when voice calls are enabled"),
            otherwise: (schema) => schema.optional(),
        }),
});

interface FormValues {
    enabled: boolean;
    backupEnabled: boolean;
    backupNumber: string;
    maxRetries: number;
}

export function VoiceCallSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const { data: walletData } = useGetWalletBalanceQuery();
    const [saveVoice, { isLoading: isSaving }] = useSaveVoiceConfigMutation();

    const callCost = walletData?.callCostPerAttempt ?? 5;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        mode: "onBlur",
        defaultValues: {
            enabled: false,
            backupEnabled: false,
            backupNumber: "",
            maxRetries: 1,
        },
    });

    useEffect(() => {
        if (!settings?.voiceCall || isDirty) return;
        reset({
            enabled: settings.voiceCall.enabled,
            backupEnabled: settings.voiceCall.backupEnabled ?? false,
            backupNumber: settings.voiceCall.backupNumber || "",
            maxRetries: settings.voiceCall.maxRetries || 1,
        });
    }, [settings, reset, isDirty]);

    const onSubmit = async (data: FormValues) => {
        try {
            await saveVoice(data).unwrap();
            toast.success("Voice call configuration saved successfully");
            router.refresh();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save voice settings");
        }
    };

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="Voice Call Alerts"
                            description="Configure automated voice calls for appointment approvals. Set a backup number to ensure calls are always attended."
                            icon={PhoneCall}
                            isVerified={settings?.voiceCall?.enabled}
                            providerName="IVR System"
                        />

                        <FormContainer isPage={true} isLoading={isLoading} isEditMode={false} className="p-0">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
                                <div className="space-y-2.5 pt-0">
                                    {/* Enable Toggle */}
                                    <Card className="border-border/50">
                                        <CardContent className="p-2 px-4 py-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${watch("enabled") ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                                        <Power className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">Voice Call Alerts</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {watch("enabled") 
                                                                ? "System will automatically call employees for appointment approvals" 
                                                                : "Enable to use voice calls for appointment approvals"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={watch("enabled")}
                                                    onCheckedChange={(checked) => setValue("enabled", checked, { shouldDirty: true })}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Credit Wallet Info */}
                                    <div className="relative group overflow-hidden transition-all duration-300 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 p-2 px-4 py-3 shadow-sm hover:shadow-md">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="flex items-start gap-4">
                                                <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shadow-inner">
                                                    <Wallet className="size-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                        Communication Wallet
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold">REQUIRED</Badge>
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                                                        Voice call alerts deduct <span className="text-slate-900 dark:text-slate-100 font-bold underline decoration-amber-500/30">{callCost} credits</span> per attempt. Please maintain a positive balance for uninterrupted service.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3 px-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 min-w-[200px]">
                                                <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Balance</span>
                                                    <div className="scale-110">
                                                        <CreditBalancePill forceShow={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 bg-[#3882a5]/5 rounded-full blur-3xl" />
                                    </div>

                                    {/* Configuration Fields */}
                                    {watch("enabled") && (
                                        <div className="space-y-2 bg-muted/20 px-4 py-4 rounded-2xl border border-dashed animate-in fade-in slide-in-from-top-2">

                                            {/* Row 1: Backup Routing Toggle */}
                                            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <PhoneForwarded className="h-4 w-4 text-[#3882a5]" />
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">Backup Routing</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {watch("backupEnabled")
                                                                ? "Calls backup number if employee doesn't answer"
                                                                : "Enable to route missed calls to a backup number"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={watch("backupEnabled")}
                                                    onCheckedChange={(checked) =>
                                                        setValue("backupEnabled", checked, { shouldDirty: true })
                                                    }
                                                />
                                            </div>

                                            {/* Row 2: Global Backup Number (only when backupEnabled) */}
                                            {watch("backupEnabled") && (
                                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-border/60 bg-background px-3 py-2.5">
                                                    <Controller
                                                        name="backupNumber"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <PhoneInputField
                                                                id="backupNumber"
                                                                label="Global Backup Number"
                                                                value={field.value || ""}
                                                                onChange={(val) => field.onChange(val)}
                                                                placeholder="Enter backup number"
                                                                error={errors.backupNumber?.message}
                                                                required={watch("backupEnabled")}
                                                                helperText="Manager/Owner number called if employee doesn't answer"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {/* Row 3: Retry Logic — label left, number input right */}
                                            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw className="h-4 w-4 text-[#3882a5]" />
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">Retry Logic</p>
                                                        <p className="text-xs text-muted-foreground">Times to retry before backup call</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    {...register("maxRetries")}
                                                    className="w-16 text-center border border-border rounded-lg px-2 py-1.5 text-sm font-semibold bg-background focus:outline-none focus:ring-2 focus:ring-[#3882a5]/30"
                                                />
                                            </div>
                                            {errors.maxRetries && (
                                                <p className="text-xs text-red-500 px-1">{errors.maxRetries.message}</p>
                                            )}

                                        </div>
                                    )}

                                    {/* How it Works */}
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Info className="h-4 w-4" />
                                                How Smart Calling Works
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                                <li>Visitor creates appointment → System checks your credit balance</li>
                                                <li>Primary call → Employee receives automated voice call to approve/reject</li>
                                                <li>No-pick notification → If employee doesn't answer, you get a red alert</li>
                                                <li>Backup call → If backup calling is <strong>enabled</strong>, system calls your backup number (e.g., Manager)</li>
                                                <li>Manual retry → You can retry calls anytime from dashboard (credits deducted)</li>
                                            </ol>
                                        </CardContent>
                                    </Card>
                                </div>

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
                                        disabled={isSaving}
                                        variant="primary"
                                        size="xl"
                                        className="w-full min-w-[200px] px-8 sm:w-auto shadow-lg shadow-[#3882a5]/20 transition-all active:scale-[0.98]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        {isSaving ? "Saving..." : "Save Settings"}
                                    </ActionButton>
                                </div>
                            </form>
                        </FormContainer>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
