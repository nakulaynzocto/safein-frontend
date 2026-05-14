"use client";

import { useEffect, useState } from "react";
import { useGetSettingsQuery, useSaveSMTPConfigMutation, useUpdateSettingsMutation } from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Save, Server, Key, Palette, Settings2, Activity } from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { InputField } from "@/components/common/inputField";
import { MaskedInputField, MASKED_DISPLAY_VALUE } from "@/components/common/MaskedInputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplateSettings } from "./EmailTemplateSettings";
import { Card } from "@/components/ui/card";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";

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
    const [updateSettings] = useUpdateSettingsMutation();
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;
    const [selectedPreset, setSelectedPreset] = useState("Brevo API");

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            deliveryMode: 'shared',
            provider: 'brevo',
            apiKey: "",
            fromName: "",
            fromEmail: "",
            host: ""
        },
    });

    const deliveryMode = watch("deliveryMode");
    const provider = watch("provider");

    // Sync form with backend data
    useEffect(() => {
        if (!settings?.smtp) return;
        const s = settings.smtp;
        reset({
            deliveryMode: s.deliveryMode || 'shared',
            provider: s.provider || 'brevo',
            apiKey: s.apiKey ? MASKED_DISPLAY_VALUE : "",
            fromName: s.fromName || "",
            fromEmail: s.fromEmail || "",
            host: s.host || ""
        });
        setSelectedPreset(PRESETS.find(p => p.provider === s.provider)?.label || "Brevo API");
    }, [settings, reset]);

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            apiKey: data.apiKey === MASKED_DISPLAY_VALUE ? "" : data.apiKey,
        };

        try {
            await saveSMTP(payload).unwrap();
            toast.success(data.deliveryMode === 'custom' ? "Custom configuration verified!" : "Switched to Standard Relay");
        } catch (err: any) {
            toast.error(err?.data?.message || "Operation failed.");
        }
    };

    if (error) return <APIErrorState title="Failed to load settings" error={error} />;

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="Email Delivery Settings"
                            description="Configure how official notifications are delivered to your visitors and employees."
                            isVerified={!!settings?.smtp?.verified}
                            providerName={deliveryMode === 'shared' ? "Aynzo Relay" : selectedPreset}
                            icon={Mail}
                        />

                        <Tabs defaultValue="connection" className="w-full">
                            <TabsList className="mb-8 flex w-full flex-wrap gap-1 bg-muted/30 p-1 border border-border/50 rounded-xl">
                                <TabsTrigger value="connection" className="flex-1 min-w-[140px] py-2.5 font-semibold transition-all">
                                    <Settings2 className="h-4 w-4 mr-2 shrink-0" /> Connection Config
                                </TabsTrigger>
                                <TabsTrigger value="templates" className="flex-1 min-w-[140px] py-2.5 font-semibold transition-all">
                                    <Palette className="h-4 w-4 mr-2 shrink-0" /> Branding & Templates
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="connection">
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
                                                    <BrandSwitch 
                                                        checked={settings?.notifications?.emailEnabled ?? false}
                                                        onCheckedChange={async (checked) => {
                                                            try {
                                                                await updateSettings({
                                                                    notifications: {
                                                                        ...settings?.notifications,
                                                                        emailEnabled: checked
                                                                    }
                                                                }).unwrap();
                                                                toast.success("Master Email settings updated");
                                                            } catch (err: any) {
                                                                toast.error(err?.data?.message || "Failed to update master settings");
                                                            }
                                                        }}
                                                        variant="default"
                                                    />
                                                </div>
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
                                                        setValue("deliveryMode", strategy.id as any);
                                                        if (strategy.id === 'shared') handleSubmit(onSubmit)();
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
                                                        {...register("apiKey")}
                                                        error={errors.apiKey?.message as any}
                                                        required
                                                    />
                                                    {provider === 'mailgun' && (
                                                        <InputField label="Mailgun Domain" {...register("host")} error={errors.host?.message as any} required />
                                                    )}
                                                </div>

                                                {/* Branding */}
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-muted/20 p-6 rounded-2xl border-dashed border">
                                                    <InputField label="Sender Name" {...register("fromName")} error={errors.fromName?.message as any} required />
                                                    <InputField label="Sender Email" {...register("fromEmail")} error={errors.fromEmail?.message as any} required />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-6 border-t">
                                            <ActionButton type="submit" isLoading={isSaving} variant="primary" size="xl" className="min-w-[200px]" label="Verify & Save" icon={Save} />
                                        </div>
                                    </form>
                                </FormContainer>
                            </TabsContent>

                            <TabsContent value="templates">
                                <Card className="p-8"><EmailTemplateSettings /></Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
