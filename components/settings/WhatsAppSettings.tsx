"use client";

import { useEffect, useState } from "react";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";
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
    Cloud,
    ChevronRight,
    Settings2,
    Verified,
    CheckCircle2,
    XCircle,
    Hash,
    ListOrdered,
    Info,
    AlertTriangle,
    ShieldCheck,
    MapPin
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import {
    WHATSAPP_META_TEMPLATES,
    WHATSAPP_META_TEMPLATE_LANGUAGE,
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
import { Badge } from "@/components/ui/badge";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/** API may return a plain object or (rarely) a Map-like payload */
function normalizeWhatsappEnabledTemplates(raw: unknown): Record<string, boolean> {
    if (!raw || typeof raw !== "object") return {};
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        out[k] = Boolean(v);
    }
    return out;
}

// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = yup.object().shape({
    whatsappEnabled: yup.boolean().default(false),
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

interface FormValues {
    whatsappEnabled: boolean;
    senderNumber: string;
    testNumber: string;
    phoneNumberId: string;
    accessToken: string;
}

export function WhatsAppSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettingsMutation, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    const [initiateVerify, { isLoading: isInitiatingVerify }] = useInitiateWhatsAppVerificationMutation();
    const [confirmVerify, { isLoading: isConfirmingVerify }] = useConfirmWhatsAppVerificationMutation();
    const userCountry = useUserCountry();

    const [showOtpModal, setShowOtpModal] = useState(false);
    const { expandedSections, toggleSection } = useCollapsibleSections(["credentials", "templates"]);
    const [localEnabledTemplates, setLocalEnabledTemplates] = useState<Record<string, boolean>>({});

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
            whatsappEnabled: false,
            senderNumber: "",
            testNumber: "",
            phoneNumberId: "",
            accessToken: "",
        },
    });

    const currentAccessToken = watch("accessToken");
    const [isMutationInProgress, setIsMutationInProgress] = useState(false);

    // Form fields only — do not tie template toggles to `isMutationInProgress` (avoids stale overwrite after template save)
    useEffect(() => {
        if (!settings || isMutationInProgress) return;
        if (!isDirty) {
            reset({
                whatsappEnabled: settings.notifications?.whatsappEnabled ?? false,
                senderNumber: settings.whatsapp?.senderNumber || "",
                testNumber: settings.whatsapp?.testNumber || "",
                phoneNumberId: settings.whatsapp?.phoneNumberId || "",
                accessToken: settings.whatsapp?.accessToken || "",
            });
        }
    }, [settings, reset, isMutationInProgress, isDirty]);

    // Template toggles: hydrate from server whenever `settings` updates (after refetch)
    useEffect(() => {
        if (!settings?.whatsapp) return;
        const normalized = normalizeWhatsappEnabledTemplates(settings.whatsapp.enabledTemplates);
        const merged: Record<string, boolean> = {};
        WHATSAPP_META_TEMPLATES.forEach((t) => {
            merged[t.name] = normalized[t.name] !== undefined ? normalized[t.name] : true;
        });
        setLocalEnabledTemplates(merged);
    }, [settings]);

    const isVerified = !!settings?.whatsapp?.metaVerified || !!settings?.whatsapp?.verified;
    const credentialsChanged =
        watch("phoneNumberId") !== (settings?.whatsapp?.phoneNumberId || "") ||
        (currentAccessToken !== MASKED_DISPLAY_VALUE && currentAccessToken !== (settings?.whatsapp?.accessToken || ""));
    const needsVerification = credentialsChanged && (!!currentAccessToken && currentAccessToken !== MASKED_DISPLAY_VALUE);

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

        setIsMutationInProgress(true);
        try {
            await updateSettingsMutation({
                notifications: {
                    whatsappEnabled: data.whatsappEnabled,
                },
                whatsapp: {
                    activeProvider: 'meta',
                    senderNumber: data.senderNumber,
                    testNumber: data.testNumber,
                    enabledTemplates: localEnabledTemplates
                },
            }).unwrap();
            toast.success("Settings updated successfully!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update settings.");
        } finally {
            setIsMutationInProgress(false);
        }
    };

    const handleTemplateToggle = async (templateName: string) => {
        /** Match UI default: missing key counts as enabled (`!== false`) */
        const currentOn = localEnabledTemplates[templateName] !== false;
        const newValue = !currentOn;
        const updatedTemplates = { ...localEnabledTemplates, [templateName]: newValue };
        setLocalEnabledTemplates(updatedTemplates);

        try {
            await updateSettingsMutation({
                whatsapp: {
                    enabledTemplates: updatedTemplates,
                },
            }).unwrap();
        } catch (err) {
            setLocalEnabledTemplates((prev) => ({ ...prev, [templateName]: !newValue }));
            toast.error("Failed to update template status");
        }
    };

    const handleVerifyOtp = async (otpValue: string) => {
        try {
            await confirmVerify({ otp: otpValue }).unwrap();
            setShowOtpModal(false);
            toast.success("WhatsApp configuration verified and saved!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Invalid code.");
        }
    };

    if (error) return <APIErrorState title="Failed to load settings" error={error} />;

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6 text-foreground">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="WhatsApp Configuration"
                            description="Connect your Meta WhatsApp Cloud API to send automated notifications. All credentials are encrypted."
                            icon={Cloud}
                        />

                        <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
                                <div className="p-2 space-y-2">
                                    {/* Credentials Section */}
                                    <div className="rounded-xl border border-border/30 bg-background overflow-hidden mx-3 mt-3">
                                        <Collapsible open={expandedSections.includes('credentials')} onOpenChange={() => toggleSection('credentials')}>
                                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('credentials')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                        <Key size={18} />
                                                    </div>
                                                    <h4 className="font-bold text-[#074463] text-sm">Meta API Credentials</h4>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", expandedSections.includes('credentials') && "rotate-90")} />
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-4 pt-0 space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/30 border border-border/50">
                                                        <InputField label="Phone Number ID" placeholder="e.g. 10472938.." {...register("phoneNumberId")} error={errors.phoneNumberId?.message} className="h-10 bg-background" />
                                                        <MaskedInputField label="Permanent Access Token" placeholder={isVerified ? MASKED_DISPLAY_VALUE : "EAAG...."} {...register("accessToken")} error={errors.accessToken?.message} className="h-10 bg-background" />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Controller name="senderNumber" control={control} render={({ field }) => (
                                                            <PhoneInputField id="whatsapp-sender-number" label="Sender Business Number" value={field.value} onChange={field.onChange} error={errors.senderNumber?.message} defaultCountry={userCountry} />
                                                        )} />
                                                        <Controller name="testNumber" control={control} render={({ field }) => (
                                                            <PhoneInputField id="whatsapp-test-number" label="OTP Recipient Number" value={field.value} onChange={field.onChange} error={errors.testNumber?.message} defaultCountry={userCountry} />
                                                        )} />
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    {/* Template Management Section */}
                                    <div className="rounded-xl border border-border/30 bg-background overflow-hidden mx-3 mb-3">
                                        <Collapsible open={expandedSections.includes('templates')} onOpenChange={() => toggleSection('templates')}>
                                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('templates')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                        <ListOrdered size={18} />
                                                    </div>
                                                    <h4 className="font-bold text-[#074463] text-sm">Template Management</h4>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", expandedSections.includes('templates') && "rotate-90")} />
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center gap-2 p-3 bg-[#3882a5]/5 rounded-xl border border-[#3882a5]/20 text-[11px] text-[#074463]">
                                                        <Info className="h-4 w-4 shrink-0 text-[#3882a5]" />
                                                        <p>Parameters like <span className="font-bold">{"{{1}}"}</span> must be configured in your <strong>Meta Dashboard</strong> in the exact order shown below for messages to deliver successfully.</p>
                                                    </div>

                                                    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                                                        <table className="w-full text-left text-xs border-collapse">
                                                            <thead className="bg-[#f8fafc] text-[#64748b] uppercase font-bold text-[9px] border-b border-border">
                                                                <tr>
                                                                    <th className="px-5 py-4 w-1/4">Template Details</th>
                                                                    <th className="px-5 py-4 w-5/12">Variable Mapping Settings</th>
                                                                    <th className="px-5 py-4 text-center w-1/6">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/50">
                                                                {WHATSAPP_META_TEMPLATES.map(t => (
                                                                    <tr key={t.name} className="hover:bg-slate-50/50 transition-colors">
                                                                        <td className="px-5 py-5 vertical-top">
                                                                            <div className="flex flex-col gap-1.5">
                                                                                <span className="font-bold text-[#074463] text-[13px]">{t.name}</span>
                                                                                <span className="text-[10px] text-slate-500 leading-relaxed italic pr-4">{t.usedFor}</span>
                                                                                <Badge variant="outline" className="w-fit text-[9px] h-5 bg-slate-50 text-slate-400 border-slate-200 font-medium">Lang: {WHATSAPP_META_TEMPLATE_LANGUAGE}</Badge>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-5 py-5 vertical-top">
                                                                            <div className="grid grid-cols-1 gap-2.5">
                                                                                {t.params.map(p => (
                                                                                    <div key={p.index} className="flex items-center gap-2.5 group">
                                                                                        <span className="flex items-center justify-center h-6 w-10 shrink-0 bg-[#3882a5]/10 border border-[#3882a5]/20 rounded-md text-[10px] font-mono font-bold text-[#3882a5]">
                                                                                            {`{{${p.index}}}`}
                                                                                        </span>
                                                                                        <span className="text-[11px] text-[#475569] font-medium leading-tight">
                                                                                            {p.label}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-5 py-5 text-center vertical-middle">
                                                                            <div className="flex flex-col items-center gap-3">
                                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-white shadow-sm">
                                                                                    {localEnabledTemplates[t.name] !== false ? (
                                                                                        <><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-bold text-emerald-600">ACTIVE</span></>
                                                                                    ) : (
                                                                                        <><div className="h-1.5 w-1.5 rounded-full bg-slate-300" /><span className="text-[9px] font-bold text-slate-400">INACTIVE</span></>
                                                                                    )}
                                                                                </div>
                                                                                <div
                                                                                    className="inline-flex"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    onPointerDown={(e) => e.stopPropagation()}
                                                                                >
                                                                                     <BrandSwitch
                                                                                        checked={localEnabledTemplates[t.name] !== false}
                                                                                        onCheckedChange={() => handleTemplateToggle(t.name)}
                                                                                        disabled={isUpdating}
                                                                                        className="scale-[0.85]"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
                                    <div className="flex items-center gap-3 text-foreground">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-border">
                                            <Settings2 size={18} className="text-[#3882a5]" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-sm font-bold text-gray-900">Finalize WhatsApp Settings</p>
                                            <p className="text-xs text-gray-500">Manual verification is required for credential changes.</p>
                                        </div>
                                    </div>
                                    <ActionButton
                                        type="submit"
                                        disabled={isUpdating || isInitiatingVerify || !isDirty}
                                        isLoading={isUpdating || isInitiatingVerify}
                                        loadingLabel="Saving..."
                                        variant="primary"
                                        size="xl"
                                        className={cn(
                                            "min-w-[220px] font-bold transition-all shadow-lg active:scale-95",
                                            !isDirty && "opacity-50 grayscale pointer-events-none"
                                        )}
                                        icon={Save}
                                        label={needsVerification ? "Verify & Save" : "Update Configuration"}
                                    />
                                </div>
                            </form>
                        </FormContainer>

                        <OtpVerificationModal
                            isOpen={showOtpModal}
                            onClose={() => setShowOtpModal(false)}
                            onVerify={handleVerifyOtp}
                            isLoading={isConfirmingVerify}
                            length={6}
                            title="Verify WhatsApp API"
                            description="Enter the 6-digit code sent to your recipient number."
                        />
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
