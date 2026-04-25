"use client";

import { useEffect, useState } from "react";
import { useGetSettingsQuery, useSaveSMTPConfigMutation } from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Save, Server, Key, Palette, Settings2 } from "lucide-react";
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
                                        
                                        {/* Strategy Selection */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Card 
                                                className={cn("p-4 cursor-pointer border-2 transition-all", 
                                                    deliveryMode === 'shared' ? "border-[#3882a5] bg-[#3882a5]/5" : "hover:border-border")}
                                                onClick={() => { setValue("deliveryMode", 'shared'); handleSubmit(onSubmit)(); }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <Server className="h-5 w-5 text-[#3882a5]" />
                                                    <div className={cn("h-4 w-4 rounded-full border-2", deliveryMode === 'shared' ? "bg-[#3882a5]" : "")} />
                                                </div>
                                                <p className="text-sm font-bold">Standard Relay</p>
                                                <p className="text-[10px] text-muted-foreground">Premium infrastructure handled by Aynzo.</p>
                                            </Card>

                                            <Card 
                                                className={cn("p-4 cursor-pointer border-2 transition-all", 
                                                    deliveryMode === 'custom' ? "border-primary bg-primary/5" : "hover:border-border")}
                                                onClick={() => setValue("deliveryMode", 'custom')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <Palette className="h-5 w-5 text-primary" />
                                                    <div className={cn("h-4 w-4 rounded-full border-2", deliveryMode === 'custom' ? "bg-primary" : "")} />
                                                </div>
                                                <p className="text-sm font-bold">Custom Branding</p>
                                                <p className="text-[10px] text-muted-foreground">Use your own API Key and sender email.</p>
                                            </Card>
                                        </div>

                                        {deliveryMode === 'shared' ? (
                                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                                                <Server className="h-5 w-5 text-emerald-600" />
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-900">Shared Relay Active</p>
                                                    <p className="text-[10px] text-emerald-700">All notifications pass through our verified channels. No extra setup needed.</p>
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
