"use client";

import { useEffect, useState } from "react";
import { useGetSettingsQuery, useSaveSMTPConfigMutation, useUpdateSettingsMutation } from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Save, Server, Palette, Settings2, Activity, ChevronRight, Calendar, ShieldCheck, Bell } from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { InputField } from "@/components/common/inputField";
import { MaskedInputField, MASKED_DISPLAY_VALUE } from "@/components/common/MaskedInputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

// Dynamic Schema: Validates only if mode is 'custom'
const schema = yup.object().shape({
    deliveryMode: yup.string().oneOf(['shared', 'custom']).required(),
    provider: yup.string().oneOf(['smtp', 'brevo', 'sendgrid', 'mailgun']).required(),
    apiKey: yup.string().when('deliveryMode', {
        is: 'custom',
        then: (s) => s.when('provider', {
            is: (p: string) => p !== 'smtp',
            then: (s2) => s2.required("API Key is required"),
            otherwise: (s2) => s2.notRequired()
        }),
        otherwise: (s) => s.notRequired()
    }),
    fromName: yup.string().when('deliveryMode', {
        is: 'custom',
        then: (s) => s.required("Sender name is required"),
        otherwise: (s) => s.notRequired()
    }),
    fromEmail: yup.string().when('deliveryMode', {
        is: 'custom',
        then: (s) => s.email("Must be a valid email").required("Sender email is required"),
        otherwise: (s) => s.notRequired()
    }),
    // Host is only required for SMTP or Mailgun (domain)
    host: yup.string().when(['deliveryMode', 'provider'], ([mode, prov], s) => {
        if (mode === 'custom' && (prov === 'smtp' || prov === 'mailgun')) return s.required();
        return s.notRequired();
    })
});

const PRESETS = [
    { label: "Brevo API", provider: "brevo" },
    { label: "SendGrid API", provider: "sendgrid" },
    { label: "Mailgun API", provider: "mailgun" },
];

export function SMTPSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [saveSMTP, { isLoading: isSaving }] = useSaveSMTPConfigMutation();
    const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;
    const [selectedPreset, setSelectedPreset] = useState("Brevo API");
    const [isTemplatesExpanded, setIsTemplatesExpanded] = useState(false);

    const emailTemplatesList = [
        { id: "visitorApproval", label: "Visitor Approval Request", desc: "Sent to hosts to approve or reject visitor entries.", icon: ShieldCheck },
        { id: "appointmentRejection", label: "Appointment Rejection Alert", desc: "Sent to visitors when an appointment is rejected.", icon: Mail },
        { id: "newAppointmentRequest", label: "New Appointment Request", desc: "Sent to hosts when a new appointment request is created.", icon: Calendar },
        { id: "appointmentConfirmation", label: "Appointment Confirmation", desc: "Sent to visitors once an appointment is confirmed.", icon: Mail },
        { id: "appointmentLink", label: "Appointment Booking Link", desc: "Sent to visitors containing their dynamic booking page URL.", icon: Settings2 },
        { id: "visitorCheckedIn", label: "Visitor Checked-In Alert", desc: "Sent to hosts when their visitor checks in at the gate.", icon: Activity },
        { id: "specialVisitorEntry", label: "Special Visitor Entry Pass", desc: "Sent to VIP / Special Visitors with access credentials.", icon: ShieldCheck }
    ];

    const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isDirty } } = useForm({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            deliveryMode: 'shared',
            provider: 'brevo',
            apiKey: "",
            fromName: "",
            fromEmail: "",
            host: "",
            emailEnabled: false,
            enabledTemplates: {} as Record<string, boolean>
        },
    });

    const deliveryMode = watch("deliveryMode");
    const provider = watch("provider");
    const emailEnabled = watch("emailEnabled");
    const enabledTemplates = watch("enabledTemplates") || {};

    // Sync form with backend data
    useEffect(() => {
        if (!settings) return;
        if (!isDirty) {
            const s = settings.smtp || {};
            const rawTemplates = settings.emailTemplates?.enabledTemplates || {};
            const mergedTemplates: Record<string, boolean> = {};
            emailTemplatesList.forEach(t => {
                mergedTemplates[t.id] = rawTemplates[t.id] !== false;
            });

            reset({
                deliveryMode: s.deliveryMode || 'shared',
                provider: s.provider || 'brevo',
                apiKey: s.apiKey ? MASKED_DISPLAY_VALUE : "",
                fromName: s.fromName || "",
                fromEmail: s.fromEmail || "",
                host: s.host || "",
                emailEnabled: settings.notifications?.emailEnabled ?? false,
                enabledTemplates: mergedTemplates
            });
            setSelectedPreset(PRESETS.find(p => p.provider === s.provider)?.label || "Brevo API");
        }
    }, [settings, reset, isDirty]);

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            apiKey: data.apiKey === MASKED_DISPLAY_VALUE ? "" : data.apiKey,
        };

        try {
            if (data.deliveryMode === 'custom' || data.deliveryMode === 'shared') {
                await saveSMTP(payload).unwrap();
            }

            await updateSettings({
                notifications: {
                    ...settings?.notifications,
                    emailEnabled: data.emailEnabled
                },
                emailTemplates: {
                    ...settings?.emailTemplates,
                    enabledTemplates: data.enabledTemplates
                }
            }).unwrap();

            toast.success("Settings updated successfully!");
            reset(data); // reset to new clean state
        } catch (err: any) {
            toast.error(err?.data?.message || "Operation failed.");
        }
    };

    const isSavingOverall = isSaving || isUpdatingSettings;

    if (error) return <APIErrorState title="Failed to load settings" error={error} />;

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <SettingsHeader
                                title="Email Delivery Settings"
                                description="Configure how official notifications are delivered to your visitors and employees."
                                isVerified={!!settings?.smtp?.verified}
                                providerName={deliveryMode === 'shared' ? "Aynzo Relay" : selectedPreset}
                                icon={Mail}
                            />
                            <ActionButton
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSavingOverall || !isDirty}
                                isLoading={isSavingOverall}
                                loadingLabel="Saving..."
                                variant="primary"
                                size="xl"
                                className={cn(
                                    "w-full sm:w-auto min-w-[220px] font-bold transition-all shadow-lg active:scale-95",
                                    !isDirty && "opacity-50 grayscale pointer-events-none"
                                )}
                                icon={Save}
                                label="Update Configuration"
                            />
                        </div>

                        <FormContainer isPage isLoading={isLoading}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                
                                {/* Master Email Toggle Section */}
                                {!!modules?.enableEmail && (
                                    <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                        <div className="p-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                    <Activity size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">Master Email Toggle</h3>
                                                    <p className="text-xs text-gray-500">Enable or disable all Email notifications globally</p>
                                                </div>
                                            </div>
                                            <Controller
                                                name="emailEnabled"
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

                                {/* Collapsible Email Templates Control Section */}
                                {!!modules?.enableEmail && (
                                    <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                        <Collapsible open={isTemplatesExpanded} onOpenChange={setIsTemplatesExpanded}>
                                            <div 
                                                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" 
                                                onClick={() => setIsTemplatesExpanded(!isTemplatesExpanded)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                        <Settings2 size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-lg">Message Template Controls</h3>
                                                        <p className="text-xs text-gray-500">Enable or disable Email notifications for specific events</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", isTemplatesExpanded && "rotate-90")} />
                                            </div>

                                            <CollapsibleContent>
                                                <div className="px-5 pb-8 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-4 pt-4">
                                                        {emailTemplatesList.map((template) => {
                                                            const isEnabled = enabledTemplates[template.id] !== false;
                                                            return (
                                                                <div key={template.id} className="border border-border/50 rounded-xl bg-background transition-all overflow-hidden">
                                                                    <div className="flex items-center justify-between p-4 px-5">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="p-2.5 rounded-lg bg-muted text-[#3882a5]">
                                                                                <template.icon size={18} />
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-bold text-[#074463] text-sm">{template.label}</h4>
                                                                                <p className="text-xs text-gray-500 mt-0.5">{template.desc}</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <BrandSwitch 
                                                                            checked={isEnabled}
                                                                            onCheckedChange={(checked) => {
                                                                                setValue('enabledTemplates', {
                                                                                    ...enabledTemplates,
                                                                                    [template.id]: checked
                                                                                }, { shouldDirty: true });
                                                                            }}
                                                                            variant="default"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                )}

                                {/* Strategy Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { 
                                            id: 'shared', 
                                            label: 'Standard Relay', 
                                            desc: 'Premium infrastructure handled by Aynzo.', 
                                            icon: Server, 
                                            colorClass: "text-[#3882a5]", 
                                            activeClass: "border-[#3882a5] bg-[#3882a5]/5",
                                            radioClass: "bg-[#3882a5]"
                                        },
                                        { 
                                            id: 'custom', 
                                            label: 'Custom Branding', 
                                            desc: 'Use your own API Key and sender email.', 
                                            icon: Palette, 
                                            colorClass: "text-primary", 
                                            activeClass: "border-primary bg-primary/5",
                                            radioClass: "bg-primary"
                                        }
                                    ].map((strategy) => (
                                        <Card 
                                            key={strategy.id}
                                            className={cn("p-4 cursor-pointer border-2 transition-all", 
                                                deliveryMode === strategy.id ? strategy.activeClass : "hover:border-border")}
                                            onClick={() => {
                                                setValue("deliveryMode", strategy.id as any, { shouldDirty: true });
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <strategy.icon className={cn("h-5 w-5", strategy.colorClass)} />
                                                <div className={cn("h-4 w-4 rounded-full border-2", deliveryMode === strategy.id ? strategy.radioClass : "")} />
                                            </div>
                                            <p className="text-sm font-bold">{strategy.label}</p>
                                            <p className="text-xs text-muted-foreground">{strategy.desc}</p>
                                        </Card>
                                    ))}
                                </div>

                                {deliveryMode === 'shared' ? (
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                                        <Server className="h-5 w-5 text-emerald-600" />
                                        <div>
                                            <p className="text-xs font-bold text-emerald-900">Shared Relay Active</p>
                                            <p className="text-xs text-emerald-700">All notifications pass through our verified channels. No extra setup needed.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                        {/* Provider Presets */}
                                        <div className="flex flex-wrap gap-2">
                                            {PRESETS.map((p) => (
                                                <button 
                                                    key={p.label} type="button"
                                                    onClick={() => { setValue("provider", p.provider); setSelectedPreset(p.label); }}
                                                    className={cn("px-4 py-2 rounded-lg text-xs font-bold border", 
                                                        provider === p.provider ? "bg-primary text-white" : "bg-background")}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* API Input */}
                                        <div className="grid grid-cols-1 gap-6 bg-muted/20 p-6 rounded-2xl border-dashed border">
                                            <MaskedInputField
                                                label="API Key / Token"
                                                placeholder="Enter your provider API Key"
                                                {...register("apiKey")}
                                                error={errors.apiKey?.message as any}
                                                required
                                            />
                                            {provider === 'mailgun' && (
                                                <InputField label="Mailgun Domain" placeholder="e.g., mg.yourdomain.com" {...register("host")} error={errors.host?.message as any} required />
                                            )}
                                        </div>

                                        {/* Branding */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-muted/20 p-6 rounded-2xl border-dashed border">
                                            <InputField label="Sender Name" placeholder="e.g., Aynzo Notifications" {...register("fromName")} error={errors.fromName?.message as any} required />
                                            <InputField label="Sender Email" placeholder="e.g., info@yourdomain.com" {...register("fromEmail")} error={errors.fromEmail?.message as any} required />
                                        </div>
                                    </div>
                                )}

                                </form>
                        </FormContainer>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
