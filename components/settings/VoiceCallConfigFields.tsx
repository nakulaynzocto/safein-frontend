import { Controller } from "react-hook-form";
import { RefreshCw, Info, PhoneForwarded } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PhoneInputField } from "../common/phoneInputField";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceCallConfigFieldsProps {
    control: any;
    register: any;
    watch: any;
    setValue: any;
    errors: any;
    scripts: Record<string, string>;
    isLoadingScripts?: boolean;
}

export function VoiceCallConfigFields({
    control,
    register,
    watch,
    setValue,
    errors,
    scripts,
    isLoadingScripts = false
}: VoiceCallConfigFieldsProps) {
    const isBackupEnabled = watch("backupEnabled");
    const currentLang = watch("language");
    const currentScript = watch("callScript");

    const switchLanguage = (newLang: "en-US" | "hi-IN") => {
        const currentText = watch("callScript");
        const currentScriptsMap = watch("callScripts") || {};
        
        const updatedMap = { ...currentScriptsMap, [currentLang]: currentText };
        setValue("callScripts", updatedMap, { shouldDirty: true });
        setValue("language", newLang, { shouldDirty: true });
        setValue("callScript", updatedMap[newLang] || scripts[newLang] || "", { shouldDirty: true });
    };

    const resetToDefault = () => {
        const lang = watch("language") as "en-US" | "hi-IN";
        const defaultScript = scripts[lang] || "";
        setValue("callScript", defaultScript, { shouldDirty: true });
        
        const currentMap = watch("callScripts") || {};
        setValue("callScripts", { ...currentMap, [lang]: defaultScript }, { shouldDirty: true });
        
        toast.info(`Reset to ${lang === "hi-IN" ? "Hindi" : "English"} default script`);
    };

    return (
        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            {/* Call Announcement Settings */}
            <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-[#3882a5]" />
                        <h4 className="text-sm font-bold text-foreground">Call Announcement Settings</h4>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => switchLanguage("en-US")}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                                currentLang === "en-US"
                                    ? "bg-white dark:bg-slate-900 text-[#3882a5] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            English (India)
                        </button>
                        <button
                            type="button"
                            onClick={() => switchLanguage("hi-IN")}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                                currentLang === "hi-IN"
                                    ? "bg-white dark:bg-slate-900 text-[#3882a5] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            Hindi (India)
                        </button>
                    </div>
                </div>

                {/* Voice Script Message */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice Script Message</label>
                        <button
                            type="button"
                            onClick={resetToDefault}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#3882a5] hover:underline"
                        >
                            <RefreshCw className="h-2.5 w-2.5" />
                            Reset to Default
                        </button>
                    </div>

                    <Controller
                        name="callScript"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                {...field}
                                disabled={isLoadingScripts}
                                placeholder="Enter the automated message..."
                                className={cn(
                                    "w-full min-h-[100px] p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-4 transition-all resize-none bg-background",
                                    errors.callScript
                                        ? "border-red-300 bg-red-50/10 focus:ring-red-500/20"
                                        : "border-slate-200 dark:border-slate-800 focus:ring-[#3882a5]/20",
                                    isLoadingScripts && "opacity-50 cursor-wait"
                                )}
                            />
                        )}
                    />
                    {errors.callScript && (
                        <p className="text-[10px] font-bold text-red-500 italic mt-1">{errors.callScript.message}</p>
                    )}
                    {currentScript && !currentScript.includes("{purpose}") && (
                        <p className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Pro-tip: Add {"{purpose}"} so the Host knows why the visitor is coming.
                        </p>
                    )}
                </div>

                {/* Personalization Tags */}
                <div className="bg-blue-50/50 dark:bg-[#3882a5]/5 rounded-xl p-3 border border-blue-100/50 dark:border-[#3882a5]/10">
                    <div className="flex gap-2">
                        <Info className="h-4 w-4 text-[#3882a5] shrink-0" />
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Personalization Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {["{visitorName}", "{employeeName}", "{purpose}", "{date}", "{time}"].map(tag => (
                                    <code key={tag} className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-[#3882a5]/30 rounded text-[10px] text-[#3882a5] font-mono font-bold">{tag}</code>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                Placeholders will be automatically replaced with real names during the call.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backup Routing */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <PhoneForwarded className="h-4 w-4 text-[#3882a5]" />
                    <div>
                        <p className="text-sm font-bold text-foreground">Backup Routing</p>
                        <p className="text-xs text-muted-foreground">
                            {isBackupEnabled
                                ? "Calls backup number if employee doesn't answer"
                                : "Enable to route missed calls to a backup number"}
                        </p>
                    </div>
                </div>
                <Switch
                    checked={isBackupEnabled}
                    onCheckedChange={(checked) => setValue("backupEnabled", checked, { shouldDirty: true })}
                />
            </div>

            {/* Global Backup Number (only when backupEnabled) */}
            {isBackupEnabled && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm">
                    <Controller
                        name="backupNumber"
                        control={control}
                        render={({ field }) => (
                            <PhoneInputField
                                id="backupNumber"
                                label="Global Backup Number"
                                value={field.value || ""}
                                onChange={(val: string) => field.onChange(val)}
                                placeholder="Enter backup number"
                                error={errors.backupNumber?.message}
                                required={isBackupEnabled}
                                helperText="Manager/Owner number called if employee doesn't answer"
                            />
                        )}
                    />
                </div>
            )}

            {/* Retry Logic */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm">
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
        </div>
    );
}
