import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
    PhoneCall, 
    Save, 
    Loader2, 
    Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { useGetSettingsQuery, useSaveVoiceConfigMutation } from "@/store/api/settingsApi";
import { SettingsHeader } from "./SettingsHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetVoiceDefaultsQuery } from "@/store/api/settingsApi";
import { VoiceCallConfigFields } from "./VoiceCallConfigFields";
import { ProfileLayout } from "@/components/profile/profileLayout";

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

    const scripts = useMemo(() => {
        const apiScripts = voiceDefaults?.scripts || {};
        if (!voiceDefaults?.scripts) return {};
        return apiScripts;
    }, [voiceDefaults?.scripts]);

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

    const onSubmit = async (formData: VoiceFormValues) => {
        try {
            // Ensure the scripts map reflects the latest text for the current language
            const updatedScripts = {
                ...formData.callScripts,
                [formData.language]: formData.callScript
            };
            
            const finalData = {
                ...formData,
                callScripts: updatedScripts
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <SettingsHeader
                            title="Voice Call Alerts"
                            description="Configure automated voice calls for immediate appointment approvals. When enabled, the system will call host numbers directly."
                            icon={PhoneCall}
                            isVerified={watch("enabled")}
                            providerName="SafeIn IVR"
                        />

                        <div className="space-y-4">
                            {/* Wallet Info Banner */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-4 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/20 rounded-xl">
                                        <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">IVR Billing Information</p>
                                        <p className="text-xs text-amber-600/70 dark:text-amber-400/60">Automated calls deduct <span className="font-bold underline">{callCost} credits</span> per attempt.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold whitespace-nowrap">BALANCE: {Number(walletData?.balance || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Common UI Fields extracted into reusable component */}
                            <VoiceCallConfigFields
                                control={control}
                                register={register}
                                watch={watch}
                                setValue={setValue}
                                errors={errors}
                                scripts={scripts}
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-border/10">
                            <Button
                                type="submit"
                                disabled={isSaving || !isDirty}
                                className={cn(
                                    "w-full sm:w-auto h-12 px-8 rounded-xl font-bold transition-all shadow-lg active:scale-95",
                                    isDirty ? "bg-[#3882a5] hover:bg-[#2c6985] text-white" : "bg-muted text-muted-foreground"
                                )}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Settings
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </ProfileLayout>
        </div>
    );
}
