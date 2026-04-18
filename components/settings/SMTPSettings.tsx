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

const schema = yup.object().shape({
    host: yup.string().required("SMTP host is required"),
    port: yup.number().typeError("Port must be a number").min(1).max(65535).required("Port is required"),
    secure: yup.boolean().required(),
    user: yup.string().email("Must be a valid email").required("SMTP username (email) is required"),
    pass: yup.string().required("SMTP password is required"),
    fromName: yup.string().required("Sender name is required"),
    fromEmail: yup.string().email("Must be a valid email").required("Sender email is required"),
});

interface FormValues {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
}

const PRESETS = [
    { label: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
    { label: "Outlook", host: "smtp.office365.com", port: 587, secure: false },
    { label: "Yahoo", host: "smtp.mail.yahoo.com", port: 587, secure: false },
    { label: "Brevo", host: "smtp-relay.brevo.com", port: 587, secure: false },
    { label: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { label: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { label: "Custom", host: "", port: 587, secure: false },
];

function PresetButton({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
        >
            {label}
        </button>
    );
}

export function SMTPSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [saveSMTP, { isLoading: isSaving }] = useSaveSMTPConfigMutation();

    const [selectedPreset, setSelectedPreset] = useState("Custom");

    const isVerified = !!settings?.smtp?.verified;





    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        mode: "onBlur",
        defaultValues: {
            host: "",
            port: 587,
            secure: false,
            user: "",
            pass: "",
            fromName: "",
            fromEmail: "",
        },
    });

    useEffect(() => {
        if (!settings?.smtp || isDirty) return;
        const smtp = settings.smtp;
        const matchedPreset = PRESETS.find((p) => p.host === smtp.host)?.label ?? "Custom";
        setSelectedPreset(matchedPreset);
        reset({
            host: smtp.host || "",
            port: smtp.port || 587,
            secure: smtp.secure ?? false,
            user: smtp.user || "",
            pass: smtp.pass || "",
            fromName: smtp.fromName || "",
            fromEmail: smtp.fromEmail || "",
        });
    }, [settings, reset, isDirty]);

    const applyPreset = (preset: typeof PRESETS[0]) => {
        setSelectedPreset(preset.label);
        if (preset.host) {
            setValue("host", preset.host, { shouldDirty: true });
            setValue("port", preset.port, { shouldDirty: true });
            setValue("secure", preset.secure, { shouldDirty: true });
        }
    };

    const onSubmit = async (data: FormValues) => {
        const payload = {
            ...data,
            pass: data.pass === MASKED_DISPLAY_VALUE ? "" : data.pass,
        };

        if (!payload.pass && !isVerified) {
            toast.error("Please enter your SMTP password.");
            return;
        }

        try {
            const result = await saveSMTP(payload as any).unwrap();
            toast.success("SMTP configuration verified and saved!");
            if (result.smtp) {
                reset({
                    host: result.smtp.host || "",
                    port: result.smtp.port || 587,
                    secure: result.smtp.secure ?? false,
                    user: result.smtp.user || "",
                    pass: MASKED_DISPLAY_VALUE,
                    fromName: result.smtp.fromName || "",
                    fromEmail: result.smtp.fromEmail || "",
                });
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "SMTP connection failed. Please check your credentials.");
        }
    };

    if (error) return <APIErrorState title="Failed to load settings" error={error} />;

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="SMTP Email Server"
                            description="Configure SMTP connection, which events send email, and branding & templates for professional communication."
                            isVerified={isVerified}
                            providerName={selectedPreset === "Custom" ? "Custom SMTP" : selectedPreset}
                            icon={Mail}
                        />

                        <Tabs defaultValue="connection" className="w-full">
                            <TabsList className="mb-8 flex w-full flex-wrap gap-1 bg-muted/30 p-1 border border-border/50 rounded-xl min-h-11 items-stretch">
                                <TabsTrigger 
                                    value="connection" 
                                    className="flex-1 min-w-[140px] px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
                                >
                                    <Settings2 className="h-4 w-4 mr-2 shrink-0" />
                                    Connection Config
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="templates" 
                                    className="flex-1 min-w-[140px] px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
                                >
                                    <Palette className="h-4 w-4 mr-2 shrink-0" />
                                    Branding & Templates
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="connection" className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-foreground">Quick Provider Presets</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {PRESETS.map((preset) => (
                                                    <PresetButton
                                                        key={preset.label}
                                                        label={preset.label}
                                                        isSelected={selectedPreset === preset.label}
                                                        onClick={() => applyPreset(preset)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Server className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-sm font-semibold text-foreground">Server Settings</h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 bg-muted/20 p-6 rounded-2xl border border-dashed">
                                                <div className="lg:col-span-2">
                                                    <InputField
                                                        label="SMTP Host"
                                                        placeholder="smtp.gmail.com"
                                                        {...register("host")}
                                                        error={errors.host?.message}
                                                        required
                                                        className="h-12 bg-background border-border rounded-xl font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <InputField
                                                        label="Port"
                                                        type="number"
                                                        placeholder="587"
                                                        {...register("port")}
                                                        error={errors.port?.message}
                                                        required
                                                        className="h-12 bg-background border-border rounded-xl font-medium"
                                                    />
                                                </div>
                                                <div className="flex flex-col space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Security</label>
                                                    <div className="flex items-center gap-4 h-12 px-4 bg-background border border-border rounded-xl">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                checked={!watch("secure")}
                                                                onChange={() => setValue("secure", false, { shouldDirty: true })}
                                                                className="accent-[#3882a5]"
                                                            />
                                                            <span className="text-sm font-medium">TLS (587)</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                checked={watch("secure")}
                                                                onChange={() => setValue("secure", true, { shouldDirty: true })}
                                                                className="accent-[#3882a5]"
                                                            />
                                                            <span className="text-sm font-medium">SSL (465)</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Key className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-sm font-semibold text-foreground">Authentication</h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-muted/20 p-6 rounded-2xl border border-dashed">
                                                <InputField
                                                    label="SMTP Username"
                                                    placeholder="your@email.com"
                                                    type="email"
                                                    {...register("user")}
                                                    error={errors.user?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                                <MaskedInputField
                                                    label="SMTP Password"
                                                    placeholder={isVerified ? MASKED_DISPLAY_VALUE : "Enter password"}
                                                    {...register("pass")}
                                                    error={errors.pass?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-sm font-semibold text-foreground">Sender Identity</h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-muted/20 p-6 rounded-2xl border border-dashed">
                                                <InputField
                                                    label="Sender Name"
                                                    placeholder="Gatekeeper Security"
                                                    {...register("fromName")}
                                                    error={errors.fromName?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                                <InputField
                                                    label="Sender Email"
                                                    type="email"
                                                    placeholder="no-reply@yourdomain.com"
                                                    {...register("fromEmail")}
                                                    error={errors.fromEmail?.message}
                                                    required
                                                    className="h-12 bg-background border-border rounded-xl font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end border-t border-border/50">
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
                                                isLoading={isSaving}
                                                loadingLabel="Saving..."
                                                variant="primary"
                                                size="xl"
                                                className="min-w-[200px] shadow-lg shadow-[#3882a5]/20"
                                                icon={Save}
                                                label="Verify & Save"
                                            />
                                        </div>
                                    </form>
                                </FormContainer>
                            </TabsContent>

                            <TabsContent value="templates" className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Card className="p-8 border-border/50 bg-background shadow-sm rounded-2xl">
                                    <EmailTemplateSettings />
                                </Card>
                            </TabsContent>
                        </Tabs>


                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
