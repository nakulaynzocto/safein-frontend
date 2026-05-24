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
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Loader2,
    MessageSquare,
    Save,
    Key,
    Lock,
    Link,
    Calendar,
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
    MapPin,
    Server,
    Palette,
    Wallet
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
    deliveryMode: yup.string().oneOf(['shared', 'custom']).required(),
    senderNumber: yup.string().when('deliveryMode', (modeArr, schema) => {
        const mode = modeArr[0];
        if (mode === 'custom') {
            return schema.required("Sender phone number is required")
                .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
                    validatePhone(value)
                );
        }
        return schema.notRequired();
    }),
    testNumber: yup.string().when('deliveryMode', (modeArr, schema) => {
        const mode = modeArr[0];
        if (mode === 'custom') {
            return schema.required("Verification number is required")
                .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
                    validatePhone(value)
                );
        }
        return schema.notRequired();
    }),
    phoneNumberId: yup.string().when('deliveryMode', (modeArr, schema) => {
        const mode = modeArr[0];
        if (mode === 'custom') return schema.required("Phone Number ID is required");
        return schema.notRequired();
    }),
    accessToken: yup.string().when('deliveryMode', (modeArr, schema) => {
        const mode = modeArr[0];
        if (mode === 'custom') return schema.required("Access Token is required");
        return schema.notRequired();
    }),
});

interface FormValues {
    whatsappEnabled: boolean;
    deliveryMode: 'shared' | 'custom';
    senderNumber: string;
    testNumber: string;
    phoneNumberId: string;
    accessToken: string;
}

export function WhatsAppSettings({ walletData }: { walletData?: any }) {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettingsMutation, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    const [initiateVerify, { isLoading: isInitiatingVerify }] = useInitiateWhatsAppVerificationMutation();
    const [confirmVerify, { isLoading: isConfirmingVerify }] = useConfirmWhatsAppVerificationMutation();
    const userCountry = useUserCountry();
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;

    const [showOtpModal, setShowOtpModal] = useState(false);
    const { expandedSections, toggleSection } = useCollapsibleSections(["credentials", "templates"]);
    const [localEnabledTemplates, setLocalEnabledTemplates] = useState<Record<string, boolean>>({});

    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        mode: "onBlur",
        defaultValues: {
            whatsappEnabled: false,
            deliveryMode: 'shared',
            senderNumber: "",
            testNumber: "",
            phoneNumberId: "",
            accessToken: "",
        },
    });

    const currentAccessToken = watch("accessToken");
    const deliveryMode = watch("deliveryMode");
    const [isMutationInProgress, setIsMutationInProgress] = useState(false);
    const whatsappCost = walletData?.whatsappCostPerMessage ?? 1.5;

    // Form fields only — do not tie template toggles to `isMutationInProgress` (avoids stale overwrite after template save)
    useEffect(() => {
        if (!settings || isMutationInProgress) return;
        if (!isDirty) {
            reset({
                whatsappEnabled: settings.notifications?.whatsappEnabled ?? false,
                deliveryMode: settings.whatsapp?.deliveryMode || 'shared',
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
        const coreTemplates = ["system_config_update", "new_appointment", "appointment_confirmed", "visit_status_update", "visitor_invitation", "visitor_entry_pass", "visitor_checked_in"];
        WHATSAPP_META_TEMPLATES.forEach((t) => {
            const isCore = coreTemplates.includes(t.name);
            merged[t.name] = normalized[t.name] !== undefined ? normalized[t.name] : isCore;
        });
        setLocalEnabledTemplates(merged);
    }, [settings]);

    const isVerified = settings?.whatsapp?.deliveryMode === 'custom' && (!!settings?.whatsapp?.metaVerified || !!settings?.whatsapp?.verified);
    const credentialsChanged =
        watch("phoneNumberId") !== (settings?.whatsapp?.phoneNumberId || "") ||
        (currentAccessToken !== MASKED_DISPLAY_VALUE && currentAccessToken !== (settings?.whatsapp?.accessToken || ""));
    const hasValidToken = currentAccessToken !== "" && (currentAccessToken !== MASKED_DISPLAY_VALUE || !!settings?.whatsapp?.accessToken);
    const modeChanged = deliveryMode === 'custom' && (settings?.whatsapp?.deliveryMode !== 'custom');

    const needsVerification = deliveryMode === 'custom' && (credentialsChanged || modeChanged || !isVerified) && hasValidToken;

    const onSubmit = async (data: FormValues) => {
        if (data.deliveryMode === 'custom' && needsVerification) {
            try {
                const whatsappConfig = {
                    deliveryMode: 'custom',
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
            const payload: any = {
                notifications: {
                    whatsappEnabled: data.whatsappEnabled,
                },
                whatsapp: {
                    ...settings?.whatsapp,
                    deliveryMode: data.deliveryMode,
                    activeProvider: 'meta',
                    enabledTemplates: localEnabledTemplates
                },
            };

            if (data.deliveryMode === 'custom') {
                payload.whatsapp.senderNumber = data.senderNumber;
                payload.whatsapp.testNumber = data.testNumber;
                payload.whatsapp.phoneNumberId = data.phoneNumberId;
                if (data.accessToken !== MASKED_DISPLAY_VALUE) {
                    payload.whatsapp.accessToken = data.accessToken;
                }
            }

            await updateSettingsMutation(payload).unwrap();
            toast.success(data.deliveryMode === 'shared' ? "Switched to Standard Relay" : "Settings updated successfully!");
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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
                                <div className="p-2 space-y-6">
                                    {/* Master Toggle Section */}
                                    {!!modules?.enableWhatsApp && (
                                        <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                            <div className="p-5 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                        <MessageSquare size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-lg">Master WhatsApp Toggle</h3>
                                                        <p className="text-xs text-gray-500">Enable or disable all WhatsApp Business notifications globally</p>
                                                    </div>
                                                </div>
                                                <Controller
                                                    name="whatsappEnabled"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <BrandSwitch 
                                                            checked={field.value} 
                                                            onCheckedChange={field.onChange} 
                                                            variant="default" 
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Template Management Section */}
                                    <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                        <Collapsible open={expandedSections.includes('templates')} onOpenChange={() => toggleSection('templates')}>
                                            <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('templates')}>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                        <ListOrdered size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-lg">Message Template Controls</h3>
                                                        <p className="text-xs text-gray-500">Enable or disable WhatsApp notifications for specific events</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('templates') && "rotate-90")} />
                                            </div>
                                             <CollapsibleContent>
                                                <div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {/* Read-only info banner */}
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
                                                        <Lock size={13} />
                                                        <span>WhatsApp template content is managed globally by SafeIn Admin. You can <strong>turn them on or off</strong> individually below.</span>
                                                    </div>

                                                    <div className="space-y-4 pt-2">
                                                        {WHATSAPP_META_TEMPLATES.map((t) => {
                                                            const isEnabled = localEnabledTemplates[t.name] !== false;
                                                            
                                                            // Determine icon based on template name
                                                            let IconComponent = MessageSquare;
                                                            if (t.name === "system_config_update") IconComponent = Key;
                                                            else if (t.name === "new_appointment") IconComponent = Calendar;
                                                            else if (t.name === "appointment_confirmed") IconComponent = CheckCircle2;
                                                            else if (t.name === "visitor_checked_in") IconComponent = MapPin;
                                                            else if (t.name === "visit_status_update") IconComponent = XCircle;
                                                            else if (t.name === "visitor_invitation") IconComponent = Link;
                                                            else if (t.name === "visitor_entry_pass") IconComponent = ShieldCheck;

                                                            return (
                                                                <div key={t.name} className="border border-border/50 rounded-xl bg-background transition-all overflow-hidden">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 gap-4">
                                                                        <div className="flex items-start gap-4">
                                                                            <div className="p-2.5 rounded-lg bg-muted text-[#3882a5] shrink-0 mt-0.5">
                                                                                <IconComponent size={18} />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                    <h4 className="font-bold text-[#074463] text-sm">{t.name}</h4>
                                                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 bg-slate-50 text-slate-400 border-slate-200 font-medium">Lang: {WHATSAPP_META_TEMPLATE_LANGUAGE}</Badge>
                                                                                </div>
                                                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{t.usedFor}</p>
                                                                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                                                                    {t.params.map(p => (
                                                                                        <span key={p.index} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50/50 border border-blue-100 text-[10px] font-medium text-slate-600">
                                                                                            <span className="font-bold text-[#3882a5]">{`{{${p.index}}}`}</span>
                                                                                            <span>{p.label}</span>
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-white shadow-sm shrink-0">
                                                                                {isEnabled ? (
                                                                                    <><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-bold text-emerald-600">ACTIVE</span></>
                                                                                ) : (
                                                                                    <><div className="h-1.5 w-1.5 rounded-full bg-slate-300" /><span className="text-[10px] font-bold text-slate-400">INACTIVE</span></>
                                                                                )}
                                                                            </div>
                                                                            <div
                                                                                className="inline-flex"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                onPointerDown={(e) => e.stopPropagation()}
                                                                            >
                                                                                <BrandSwitch 
                                                                                    checked={isEnabled}
                                                                                    onCheckedChange={() => handleTemplateToggle(t.name)}
                                                                                    disabled={isUpdating}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    {/* Strategy Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div 
                                            className={cn("p-6 cursor-pointer border-2 rounded-2xl transition-all relative overflow-hidden", 
                                                deliveryMode === 'shared' ? "border-[#3882a5] bg-[#3882a5]/5" : "hover:border-border bg-white shadow-sm")}
                                            onClick={() => { setValue('deliveryMode', 'shared', { shouldDirty: true }); }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={cn("p-3 rounded-xl bg-[#3882a5]/10 text-[#3882a5]")}>
                                                    <Server className="h-6 w-6" />
                                                </div>
                                                <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", deliveryMode === 'shared' ? "border-[#3882a5] bg-[#3882a5]" : "border-gray-200")}>
                                                    {deliveryMode === 'shared' && <div className="h-2 w-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                            <p className="text-[14px] font-semibold uppercase tracking-wider text-[#074463]">Standard Relay</p>
                                            <p className="text-xs text-gray-500 font-bold mt-1 leading-relaxed">Premium infrastructure handled by SafeIn. No configuration required.</p>
                                        </div>

                                        <div 
                                            className={cn("p-6 cursor-pointer border-2 rounded-2xl transition-all relative overflow-hidden", 
                                                deliveryMode === 'custom' ? "border-[#3882a5] bg-[#3882a5]/5" : "hover:border-border bg-white shadow-sm")}
                                            onClick={() => setValue('deliveryMode', 'custom', { shouldDirty: true })}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={cn("p-3 rounded-xl bg-[#3882a5]/10 text-[#3882a5]")}>
                                                    <Palette className="h-6 w-6" />
                                                </div>
                                                <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", deliveryMode === 'custom' ? "border-[#3882a5] bg-[#3882a5]" : "border-gray-200")}>
                                                    {deliveryMode === 'custom' && <div className="h-2 w-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                            <p className="text-[14px] font-semibold uppercase tracking-wider text-[#074463]">Custom Branding</p>
                                            <p className="text-xs text-gray-500 font-bold mt-1 leading-relaxed">Connect your own Meta API credentials for branded delivery.</p>
                                        </div>
                                    </div>

                                    {deliveryMode === 'shared' ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                            {/* Wallet Info Banner */}
                                            <div className="bg-gradient-to-r from-amber-500/[0.05] to-transparent p-5 rounded-2xl border border-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                                        <Wallet className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-amber-900">WhatsApp API Billing</p>
                                                        <p className="text-xs text-amber-700/70">Relayed messages deduct <span className="font-bold underline">{whatsappCost} credits</span> per delivery.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-amber-500/10">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-[#074463]">BALANCE: {Number(walletData?.balance || 0).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                                                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                                    <ShieldCheck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Shared Relay Active</p>
                                                    <p className="text-xs text-emerald-700 font-bold mt-0.5 leading-relaxed">
                                                        All notifications are routed through our enterprise-grade Meta gateway. This ensures 100% delivery without monthly Meta developer maintenance for your team.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-400">
                                            <Collapsible open={expandedSections.includes('credentials')} onOpenChange={() => toggleSection('credentials')}>
                                                <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('credentials')}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                            <Key size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-800 text-lg">Meta API Credentials</h3>
                                                            <p className="text-xs text-gray-500">Configure your custom Meta App IDs and Access Tokens</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('credentials') && "rotate-90")} />
                                                </div>
                                                <CollapsibleContent>
                                                    <div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-muted/30 border border-border/50">
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
                                    )}

                                </div>

                                <div className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
                                    <div className="flex items-center gap-3 text-foreground">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-border">
                                            <Settings2 size={18} className="text-[#3882a5]" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-sm font-bold text-gray-800">Finalize WhatsApp Settings</p>
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
