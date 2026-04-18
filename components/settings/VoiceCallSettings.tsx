import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
    PhoneCall, 
    Save, 
    Loader2, 
    Wallet,
    ChevronRight,
    Settings2,
    Calendar,
    User,
    QrCode,
    RefreshCw,
    Languages,
    PhoneForwarded,
} from "lucide-react";
import { toast } from "sonner";

import {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useSaveVoiceConfigMutation,
    useGetVoiceDefaultsQuery,
} from "@/store/api/settingsApi";
import { SettingsHeader } from "./SettingsHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { PhoneInputField } from "../common/phoneInputField";
import { Label } from "@/components/ui/label";
import { SettingsMasterBanner } from "./SettingsMasterBanner";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";

const FRONTEND_VOICE_DEFAULTS = {
    "en-US": "Hello {employeeName}, you have a new appointment request from {visitorName} for {purpose} scheduled at {time} on {date}. Press 1 to Accept, 2 to Reject, or 3 to Repeat.",
    "hi-IN": "नमस्ते {employeeName}, आपके पास {visitorName} द्वारा {purpose} के लिए {date} को {time} बजे एक नया अपॉइंटमेंट अनुरोध आया है। स्वीकार करने के लिए 1, अस्वीकार करने के लिए 2, या संदेश फिर से सुनने के लिए 3 दबाएं।"
};

const voiceSchema = yup.object().shape({
    enabled: yup.boolean().default(false),
    backupEnabled: yup.boolean().default(false),
    backupNumber: yup.string().when("backupEnabled", {
        is: true,
        then: (schema) => schema.required("Backup number is required"),
        otherwise: (schema) => schema.optional(),
    }),
    maxRetries: yup.number().min(1, "Minimum 1 retry").max(5, "Maximum 5 retries").default(1),
    language: yup.string().oneOf(["en-US", "hi-IN"]).default("en-US"),
    callScript: yup.string()
        .trim()
        .min(10, "Script is too short")
        .max(500, "Script is too long")
        .required("Call script is required"),
    callScripts: yup.object().shape({
        "en-US": yup.string(),
        "hi-IN": yup.string(),
    }).optional(),
    callOnLinkInvite: yup.boolean().default(true),
    callOnAdminEntry: yup.boolean().default(true),
    callOnQrCheckin: yup.boolean().default(true),
});

interface VoiceFormValues {
    enabled: boolean;
    backupEnabled: boolean;
    backupNumber: string;
    maxRetries: number;
    language: "en-US" | "hi-IN";
    callScript: string;
    callScripts: Record<string, string>;
    callOnLinkInvite: boolean;
    callOnAdminEntry: boolean;
    callOnQrCheckin: boolean;
}

export function VoiceCallSettings({ walletData }: { walletData?: any }) {
    const { data: settings, isLoading } = useGetSettingsQuery();
    const { data: voiceDefaults } = useGetVoiceDefaultsQuery();
    const [saveVoice, { isLoading: isSaving }] = useSaveVoiceConfigMutation();
    const [updateSettings] = useUpdateSettingsMutation();
    const { expandedSections, toggleSection } = useCollapsibleSections(["triggers", "script", "advanced"]);

    const scripts = useMemo(() => voiceDefaults?.scripts || {}, [voiceDefaults?.scripts]);
    const callCost = walletData?.callCostPerAttempt ?? 4;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { errors, isDirty },
    } = useForm<VoiceFormValues>({
        resolver: yupResolver(voiceSchema) as any,
        defaultValues: {
            enabled: false,
            backupEnabled: false,
            backupNumber: "",
            maxRetries: 1,
            language: "en-US",
            callScript: "",
            callScripts: { "en-US": "", "hi-IN": "" },
            callOnLinkInvite: true,
            callOnAdminEntry: true,
            callOnQrCheckin: true,
        },
    });

    const isBackupEnabled = watch("backupEnabled");
    const currentLang = watch("language");

    useEffect(() => {
        if (!settings?.voiceCall || isDirty || !Object.keys(scripts).length) return;
        
        const v = settings.voiceCall;
        const lang = (v.language as "en-US" | "hi-IN") || "en-US";
        
        const savedScripts = v.callScripts || {};
        const initialScripts = {
            "en-US": savedScripts["en-US"] || scripts["en-US"] || "",
            "hi-IN": savedScripts["hi-IN"] || scripts["hi-IN"] || "",
        };

        const scriptToSet = v.callScript || initialScripts[lang];

        reset({
            enabled: v.enabled,
            backupEnabled: v.backupEnabled ?? false,
            backupNumber: v.backupNumber || "",
            maxRetries: v.maxRetries || 1,
            language: lang,
            callScript: scriptToSet,
            callScripts: initialScripts,
            callOnLinkInvite: v.callOnLinkInvite ?? true,
            callOnAdminEntry: v.callOnAdminEntry ?? true,
            callOnQrCheckin: v.callOnQrCheckin ?? true,
        });
    }, [settings?.voiceCall, reset, scripts, isDirty]);

    const switchLanguage = (newLang: "en-US" | "hi-IN") => {
        const currentText = watch("callScript");
        const currentScriptsMap = watch("callScripts") || {};
        const updatedMap = { ...currentScriptsMap, [currentLang]: currentText };
        
        setValue("callScripts", updatedMap, { shouldDirty: true });
        setValue("language", newLang, { shouldDirty: true });
        setValue("callScript", updatedMap[newLang] || scripts[newLang] || FRONTEND_VOICE_DEFAULTS[newLang], { shouldDirty: true });
    };

    const handleResetToDefault = () => {
        const scriptToUse = scripts[currentLang] || FRONTEND_VOICE_DEFAULTS[currentLang];
        
        setValue("callScript", scriptToUse, { shouldDirty: true });
        
        // Also update the underlying map so language switching doesn't revert the reset
        const currentMap = watch("callScripts") || {};
        setValue("callScripts", { ...currentMap, [currentLang]: scriptToUse }, { shouldDirty: true });
        
        toast.info(`Script reset to ${currentLang === 'en-US' ? 'English' : 'Hindi'} default`);
    };

    const onSubmit = async (formData: VoiceFormValues) => {
        try {
            const finalData = {
                ...formData,
                callScripts: {
                    ...formData.callScripts,
                    [formData.language]: formData.callScript
                }
            };
            await saveVoice(finalData).unwrap();
            toast.success("Voice settings updated successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update voice settings");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6 text-foreground">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="Voice Call Alerts"
                            description="Configure automated voice calls for immediate appointment approvals. When enabled, the system will call host numbers directly."
                            icon={PhoneCall}
                        />

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-foreground pb-12">
                            {/* Wallet Info Banner */}
                            <div className="bg-gradient-to-r from-amber-500/[0.05] to-transparent p-5 rounded-2xl border border-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                        <Wallet className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">IVR Billing Information</p>
                                        <p className="text-xs text-amber-700/70">Automated calls deduct <span className="font-bold underline">{callCost} credits</span> per attempt.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-amber-500/10">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-[#074463]">BALANCE: {Number(walletData?.balance || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <SettingsMasterBanner
                                title="All Voice Call Alerts"
                                description="Enable or disable automated voice call system"
                                icon={PhoneCall}
                                checked={settings?.voiceCall?.enabled ?? false}
                                onCheckedChange={async (checked) => {
                                    try {
                                        await updateSettings({
                                            voiceCall: { enabled: checked },
                                        }).unwrap();
                                    } catch {
                                        toast.error("Failed to update Voice status");
                                    }
                                }}
                            >
                                <div className="p-2 space-y-2">
                                    {/* Trigger Events Section */}
                                    <div className="rounded-xl border border-border/30 bg-background overflow-hidden mx-3 mt-3">
                                        <Collapsible open={expandedSections.includes('triggers')} onOpenChange={() => toggleSection('triggers')}>
                                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('triggers')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                        <QrCode size={18} />
                                                    </div>
                                                    <h4 className="font-bold text-[#074463] text-sm">Automated Triggers</h4>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", expandedSections.includes('triggers') && "rotate-90")} />
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-4 pt-0 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {[
                                                        { id: "callOnLinkInvite", label: "Link Bookings", sub: "Visitor books via link", icon: Calendar },
                                                        { id: "callOnAdminEntry", label: "Admin Entries", sub: "Host creates entry", icon: User },
                                                        { id: "callOnQrCheckin", label: "QR Check-ins", sub: "Visitor scans QR", icon: QrCode },
                                                    ].map(trigger => (
                                                        <div key={trigger.id} className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-center justify-between gap-4 transition-all hover:bg-muted/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-border/30 shadow-sm">
                                                                    <trigger.icon size={18} className="text-[#3882a5]" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-[#074463]">{trigger.label}</p>
                                                                    <p className="text-xs text-muted-foreground">{trigger.sub}</p>
                                                                </div>
                                                            </div>
                                                            <BrandSwitch 
                                                                checked={settings?.voiceCall?.[trigger.id as keyof typeof settings.voiceCall] as boolean ?? true} 
                                                                onCheckedChange={async (checked) => {
                                                                    try {
                                                                        await updateSettings({
                                                                            voiceCall: { [trigger.id]: checked }
                                                                        }).unwrap();
                                                                    } catch (err) {
                                                                        toast.error(`Failed to update ${trigger.label} status`);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    {/* Voice Script Section */}
                                    <div className="rounded-xl border border-border/30 bg-background overflow-hidden mx-3">
                                        <Collapsible open={expandedSections.includes('script')} onOpenChange={() => toggleSection('script')}>
                                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('script')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                        <Languages size={18} />
                                                    </div>
                                                    <h4 className="font-bold text-[#074463] text-sm">Call Script & Language</h4>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", expandedSections.includes('script') && "rotate-90")} />
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center justify-between bg-muted/30 p-1 rounded-lg border border-border/50 max-w-fit">
                                                        <button type="button" onClick={() => switchLanguage("en-US")} className={cn("px-4 py-1.5 text-[10px] font-bold rounded-md transition-all", currentLang === "en-US" ? "bg-white text-[#3882a5] shadow-sm" : "text-muted-foreground hover:text-foreground")}>English</button>
                                                        <button type="button" onClick={() => switchLanguage("hi-IN")} className={cn("px-4 py-1.5 text-[10px] font-bold rounded-md transition-all", currentLang === "hi-IN" ? "bg-white text-[#3882a5] shadow-sm" : "text-muted-foreground hover:text-foreground")}>Hindi</button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Voice Script Message</Label>
                                                            <button type="button" onClick={handleResetToDefault} className="text-[10px] font-bold text-[#3882a5] flex items-center gap-1 hover:underline">
                                                                <RefreshCw size={10} /> Reset to Default
                                                            </button>
                                                        </div>
                                                        <Controller
                                                            name="callScript"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <textarea {...field} className="w-full min-h-[100px] p-4 rounded-xl border border-border/50 bg-background text-sm font-medium focus:outline-none focus:border-[#3882a5] transition-all resize-none shadow-inner" />
                                                            )}
                                                        />
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {["{visitorName}", "{employeeName}", "{purpose}", "{date}", "{time}"].map(tag => (
                                                                <code key={tag} className="px-1.5 py-0.5 bg-[#3882a5]/5 border border-[#3882a5]/10 rounded text-[9px] text-[#3882a5] font-mono font-bold cursor-pointer hover:bg-[#3882a5]/10 transition-colors" onClick={() => {
                                                                    const currentVal = watch("callScript");
                                                                    setValue("callScript", currentVal + " " + tag, { shouldDirty: true });
                                                                }}>{tag}</code>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    {/* Advanced Settings Section */}
                                    <div className="rounded-xl border border-border/30 bg-background overflow-hidden mx-3 mb-3">
                                        <Collapsible open={expandedSections.includes('advanced')} onOpenChange={() => toggleSection('advanced')}>
                                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('advanced')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                        <PhoneForwarded size={18} />
                                                    </div>
                                                    <h4 className="font-bold text-[#074463] text-sm">Routing & Retry Logic</h4>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", expandedSections.includes('advanced') && "rotate-90")} />
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5">
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-bold text-[#074463]">Backup Routing</p>
                                                            <p className="text-[11px] text-muted-foreground">Call backup number if host is unreachable</p>
                                                        </div>
                                                        <BrandSwitch checked={isBackupEnabled} onCheckedChange={(checked) => setValue("backupEnabled", checked, { shouldDirty: true })} />
                                                    </div>

                                                    {isBackupEnabled && (
                                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                                            <Controller
                                                                name="backupNumber"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <PhoneInputField id="voice-backup-number" label="Global Backup Number" value={field.value} onChange={field.onChange} />
                                                                )}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5">
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-bold text-[#074463]">Maximum Retries</p>
                                                            <p className="text-[11px] text-muted-foreground">Times to retry before initiating backup call</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {[1, 2, 3, 4, 5].map(v => (
                                                                <button key={v} type="button" onClick={() => setValue("maxRetries", v, { shouldDirty: true })} className={cn("h-8 w-8 rounded-lg border text-xs font-bold transition-all", watch("maxRetries") === v ? "bg-[#074463] text-white border-[#074463]" : "bg-white text-muted-foreground")}>{v}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                </div>
                            </SettingsMasterBanner>

                            <div className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-border">
                                        <Settings2 size={18} className="text-[#3882a5]" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900">Finalize Voice Settings</p>
                                        <p className="text-xs text-gray-500">Changes will apply to all future automated IVR calls.</p>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSaving || !isDirty}
                                    className={cn(
                                        "min-w-[180px] h-12 rounded-xl font-bold transition-all shadow-lg active:scale-95",
                                        isDirty ? "bg-[#3882a5] hover:bg-[#2c6985] text-white" : "bg-muted text-muted-foreground shadow-none"
                                    )}
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Update Configuration</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
