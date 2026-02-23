"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    useGetSettingsQuery,
    useSaveSMTPConfigMutation,
    useUpdateSettingsMutation,
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle,
    Key,
    Loader2,
    Mail,
    Save,
    Server,
    ShieldAlert,
} from "lucide-react";
import { InputField } from "@/components/common/inputField";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { Badge } from "@/components/ui/badge";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = yup.object().shape({
    host: yup.string().required("SMTP host is required"),
    port: yup.number().typeError("Port must be a number").min(1).max(65535).required("Port is required"),
    secure: yup.boolean().required(),
    user: yup.string().email("Must be a valid email").required("SMTP username (email) is required"),
    pass: yup.string().required("SMTP password is required"),
    fromName: yup.string().required("Sender name is required"),
    fromEmail: yup.string().email("Must be a valid email").required("Sender email is required"),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
}

// ─── SMTP Provider Presets ────────────────────────────────────────────────────

const PRESETS = [
    { label: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
    { label: "Outlook", host: "smtp.office365.com", port: 587, secure: false },
    { label: "Yahoo", host: "smtp.mail.yahoo.com", port: 587, secure: false },
    { label: "Brevo", host: "smtp-relay.brevo.com", port: 587, secure: false },
    { label: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { label: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { label: "Custom", host: "", port: 587, secure: false },
];

// ─── Sub-Component: Preset Button ─────────────────────────────────────────────

interface PresetButtonProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

function PresetButton({ label, isSelected, onClick }: PresetButtonProps) {
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function SMTPSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
    const [saveSMTP, { isLoading: isSaving }] = useSaveSMTPConfigMutation();

    const [emailEnabled, setEmailEnabled] = useState(true);
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>("Custom");

    useEffect(() => {
        if (settings) {
            setEmailEnabled(settings.notifications?.emailEnabled ?? true);
            setWhatsappEnabled(settings.notifications?.whatsappEnabled ?? false);
        }
    }, [settings]);

    const handleToggleEmail = async () => {
        try {
            const newStatus = !emailEnabled;
            setEmailEnabled(newStatus);
            await updateSettings({
                notifications: {
                    emailEnabled: newStatus,
                    whatsappEnabled: settings?.notifications?.whatsappEnabled ?? false
                }
            }).unwrap();
            toast.success(`Email notifications ${newStatus ? 'enabled' : 'disabled'}`);
        } catch (err: any) {
            setEmailEnabled(emailEnabled);
            toast.error("Failed to update notification status");
        }
    };

    const MASKED = "••••••••";
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

    // Populate form from stored settings
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
            pass: smtp.pass || "", // arrives as • masked
            fromName: smtp.fromName || "",
            fromEmail: smtp.fromEmail || "",
        });
    }, [settings, reset, isDirty]);

    // ── Preset selection ──────────────────────────────────────────────────────

    const applyPreset = (preset: typeof PRESETS[0]) => {
        setSelectedPreset(preset.label);
        if (preset.host) {
            setValue("host", preset.host, { shouldDirty: true });
            setValue("port", preset.port, { shouldDirty: true });
            setValue("secure", preset.secure, { shouldDirty: true });
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const onSubmit = async (data: FormValues) => {
        // If user hasn't changed the masked password, don't re-send it
        const payload = {
            ...data,
            pass: data.pass === MASKED ? "" : data.pass,
        };

        if (!payload.pass && !isVerified) {
            toast.error("Please enter your SMTP password.");
            return;
        }

        try {
            const result = await saveSMTP(payload as any).unwrap();
            toast.success("SMTP configuration verified and saved! A test email was sent to your inbox.");

            // Sync form with the new data and clear dirty state
            if (result.smtp) {
                reset({
                    host: result.smtp.host || "",
                    port: result.smtp.port || 587,
                    secure: result.smtp.secure ?? false,
                    user: result.smtp.user || "",
                    pass: MASKED, // Now it's saved, show masked
                    fromName: result.smtp.fromName || "",
                    fromEmail: result.smtp.fromEmail || "",
                });
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "SMTP connection failed. Please check your credentials.");
        }
    };


    // ── Render ─────────────────────────────────────────────────────────────────

    if (error) {
        return (
            <APIErrorState
                title="Failed to load settings"
                error={error}
            />
        );
    }

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">

            {/* ── Page Header ── */}
            <div className="mb-6">

                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-foreground text-xl font-bold tracking-tight">
                            SMTP Email Configuration
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
                                Not Configured
                            </Badge>
                        )}

                        <Badge
                            variant="outline"
                            className="bg-blue-50/50 text-blue-600 border-blue-100 flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-medium"
                        >
                            <Key className="h-3 w-3" />
                            Password Encrypted
                        </Badge>
                    </div>

                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                        Configure a custom SMTP server to send emails from your own domain.
                        A test email will be sent to verify the connection.
                    </p>
                </div>
            </div>

            {/* Notification Toggle */}
            <div className="mb-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all hover:border-[#3882a5]/30">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            emailEnabled ? "bg-[#3882a5]/10" : "bg-gray-100 dark:bg-gray-800"
                        )}>
                            <Mail className={cn("h-5 w-5", emailEnabled ? "text-[#3882a5]" : "text-gray-400")} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Email Notifications</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Master switch to turn all email notifications ON or OFF</p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleEmail}
                        disabled={isUpdatingSettings}
                        className={cn(
                            "relative h-6 w-11 rounded-full p-1 transition-all duration-300",
                            emailEnabled
                                ? "bg-[#3882a5] shadow-[0_0_8px_rgba(56,130,165,0.4)]"
                                : "bg-gray-200 dark:bg-gray-700",
                        )}
                    >
                        <div
                            className={cn(
                                "h-4 w-4 rounded-full bg-white transition-all duration-300",
                                emailEnabled ? "translate-x-5" : "translate-x-0"
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* ── Info Banner (system default active) ── */}
            {!isVerified && (
                <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-amber-600" />
                    <div>
                        <p className="text-sm font-semibold">System SMTP is currently active</p>
                        <p className="text-xs mt-0.5 text-amber-700">
                            Configure a custom SMTP server below to send emails from your own domain and sender address.
                        </p>
                    </div>
                </div>
            )}

            <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Preset Selector */}
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
                        {selectedPreset === "Gmail" && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                                <strong>Gmail tip:</strong> Use an{" "}
                                <a
                                    href="https://myaccount.google.com/apppasswords"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline font-semibold"
                                >
                                    App Password
                                </a>{" "}
                                (not your Google account password) and enable 2-Step Verification first.
                            </p>
                        )}
                    </div>

                    {/* Server Settings */}
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
                                    helperText="Your mail provider's SMTP server address"
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
                                    helperText="Usually 587 (TLS) or 465 (SSL)"
                                />
                            </div>

                            {/* SSL/TLS Toggle */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Secure Connection (SSL/TLS)
                                </label>
                                <div className="flex items-center gap-4 h-12 px-4 bg-background border border-border rounded-xl">
                                    {[
                                        { label: "TLS (port 587)", value: false },
                                        { label: "SSL (port 465)", value: true },
                                    ].map(({ label, value }) => (
                                        <label key={label} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={watch("secure") === value}
                                                onChange={() => setValue("secure", value, { shouldDirty: true })}
                                                className="accent-primary"
                                            />
                                            <span className="text-sm">{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.secure && (
                                    <p className="text-xs text-destructive">{errors.secure.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Authentication */}
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
                                helperText="Usually your email address"
                            />
                            <InputField
                                label="SMTP Password / App Password"
                                type="password"
                                placeholder={isVerified ? MASKED : "Enter password or app password"}
                                {...register("pass")}
                                error={errors.pass?.message}
                                required
                                className="h-12 bg-background border-border rounded-xl font-medium"
                                helperText={isVerified ? "Leave masked to keep current password" : "Stored encrypted at rest"}
                            />
                        </div>
                    </div>

                    {/* Sender Identity */}
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
                                helperText="Name recipients will see in their inbox"
                            />
                            <InputField
                                label="Sender Email Address"
                                type="email"
                                placeholder="no-reply@yourdomain.com"
                                {...register("fromEmail")}
                                error={errors.fromEmail?.message}
                                required
                                className="h-12 bg-background border-border rounded-xl font-medium"
                                helperText="Must be authorised by your SMTP provider"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between border-t border-border/50">
                        <div />

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
                                variant="outline-primary"
                                size="xl"
                                className="w-full min-w-[200px] px-8 sm:w-auto"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Testing &amp; Saving...</span>
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

        </div>
    );
}
