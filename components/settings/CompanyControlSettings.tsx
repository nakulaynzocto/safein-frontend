"use client";

import { 
    useGetSettingsQuery, 
    useUpdateSettingsMutation 
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { 
    ShieldCheck, 
    CheckCircle, 
    Camera, 
    Key, 
    MessageSquareQuote,
    Mail,
    Phone,
    MessageSquare,
    Zap,
    ChevronRight,
    Settings2,
    Activity,
    FileOutput
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";

export function CompanyControlSettings() {
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettings] = useUpdateSettingsMutation();
    const { expandedSections, toggleSection } = useCollapsibleSections(["features", "channels"]);

    const handleFeatureToggle = async (featureKey: string, enabled: boolean) => {
        try {
            await updateSettings({
                features: {
                    ...settings?.features,
                    [featureKey]: enabled
                }
            }).unwrap();
            toast.success("Settings updated successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update settings");
        }
    };

    const handleNotificationToggle = async (type: "emailEnabled" | "smsEnabled" | "whatsappEnabled", enabled: boolean) => {
        try {
            await updateSettings({
                notifications: {
                    ...settings?.notifications,
                    [type]: enabled
                }
            }).unwrap();
            toast.success("Notification settings updated");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update notifications");
        }
    };

    const handleVoiceToggle = async (enabled: boolean) => {
        try {
            await updateSettings({
                voiceCall: {
                    ...settings?.voiceCall,
                    enabled
                }
            }).unwrap();
            toast.success("Voice settings updated");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update voice settings");
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6 space-y-8 animate-pulse p-4">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <APIErrorState title="Failed to load settings" error={error} />;
    }

    const featureItems = [
        {
            id: "enableAutoApproval",
            title: "Auto-Approval System",
            description: "Automatically approve appointment requests without manual intervention",
            icon: CheckCircle,
            color: "bg-[#3882a5]",
            checked: settings?.features?.enableAutoApproval ?? false
        },
        {
            id: "enableVisitorImageCapture",
            title: "Visitor Image Capture",
            description: "Require visitors to take a photo during the check-in process",
            icon: Camera,
            color: "bg-[#3882a5]",
            checked: settings?.features?.enableVisitorImageCapture ?? false
        },
        {
            id: "enableVerification",
            title: "Entry Verification (OTP)",
            description: "Require an OTP verification for visitors at the time of entry",
            icon: Key,
            color: "bg-[#3882a5]",
            checked: settings?.features?.enableVerification ?? false
        },
        {
            id: "enableFeedbackSystem",
            title: "Feedback System",
            description: "Collect experience feedback from visitors after their visit",
            icon: MessageSquareQuote,
            color: "bg-[#3882a5]",
            checked: settings?.features?.enableFeedbackSystem ?? false
        },
        {
            id: "enableVisitSlip",
            title: "Visit Slip Verification",
            description: "Allow visitors to print or show an entry script as proof of check-in",
            icon: FileOutput,
            color: "bg-[#3882a5]",
            checked: settings?.features?.enableVisitSlip ?? false
        }
    ];

    const notificationChannels = [
        {
            id: "emailEnabled",
            title: "Email Notifications",
            description: "Send appointment updates and alerts via Email",
            icon: Mail,
            color: "bg-[#3882a5]",
            checked: settings?.notifications?.emailEnabled ?? false,
            handler: (checked: boolean) => handleNotificationToggle("emailEnabled", checked)
        },
        {
            id: "smsEnabled",
            title: "SMS Alerts",
            description: "Send instant text message alerts for key events",
            icon: MessageSquare,
            color: "bg-[#3882a5]",
            checked: settings?.notifications?.smsEnabled ?? false,
            handler: (checked: boolean) => handleNotificationToggle("smsEnabled", checked)
        },
        {
            id: "whatsappEnabled",
            title: "WhatsApp Business",
            description: "Deliver rich notifications directly to WhatsApp",
            icon: Phone,
            color: "bg-[#3882a5]",
            checked: settings?.notifications?.whatsappEnabled ?? false,
            handler: (checked: boolean) => handleNotificationToggle("whatsappEnabled", checked)
        },
        {
            id: "voiceEnabled",
            title: "Smart Voice Calls",
            description: "Automated IVR calls for urgent appointment approvals",
            icon: Zap,
            color: "bg-[#3882a5]",
            checked: settings?.voiceCall?.enabled ?? false,
            handler: (checked: boolean) => handleVoiceToggle(checked)
        }
    ];

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="Company Controls"
                            description="Manage platform features and communication preferences tailored for your organization's workflow."
                            icon={ShieldCheck}
                        />

                        <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                            <div className="space-y-6 pb-12 p-3">
                                
                                {/* Section: Feature Management */}
                                <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                    <Collapsible open={expandedSections.includes('features')} onOpenChange={() => toggleSection('features')}>
                                        <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('features')}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                    <Settings2 size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">Feature Management</h3>
                                                    <p className="text-xs text-gray-500">Enable or disable core system behaviors</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('features') && "rotate-90")} />
                                        </div>

                                        <CollapsibleContent>
                                            <div className="px-5 pb-6 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {featureItems.map((item) => (
                                                    <div 
                                                        key={item.id}
                                                        className="group relative rounded-xl border border-border/40 bg-muted/5 p-4 transition-all hover:bg-muted/10"
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "h-10 w-10 rounded-lg text-white shadow-md flex items-center justify-center",
                                                                    item.color
                                                                )}>
                                                                    <item.icon size={18} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                                                    <p className="text-[11px] text-gray-500 max-w-md">{item.description}</p>
                                                                </div>
                                                            </div>
                                                            <BrandSwitch 
                                                                checked={item.checked} 
                                                                onCheckedChange={(checked) => handleFeatureToggle(item.id, checked)} 
                                                                variant="default"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* Section: Communication Channels */}
                                <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                    <Collapsible open={expandedSections.includes('channels')} onOpenChange={() => toggleSection('channels')}>
                                        <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('channels')}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                    <Activity size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">Communication Channels</h3>
                                                    <p className="text-xs text-gray-500">Manage master toggles for all notification types</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('channels') && "rotate-90")} />
                                        </div>

                                        <CollapsibleContent>
                                            <div className="px-5 pb-6 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {notificationChannels.map((item) => (
                                                    <div 
                                                        key={item.id}
                                                        className="group rounded-xl border border-border/40 bg-muted/5 p-4 transition-all hover:bg-muted/10"
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "h-10 w-10 rounded-lg text-white shadow-md flex items-center justify-center",
                                                                    item.color
                                                                )}>
                                                                    <item.icon size={18} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                                                    <p className="text-[11px] text-gray-500 leading-tight">{item.description}</p>
                                                                </div>
                                                            </div>
                                                            <BrandSwitch 
                                                                checked={item.checked} 
                                                                onCheckedChange={item.handler} 
                                                                variant="default" 
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* Footer Note */}
                                <div className="rounded-2xl bg-muted/30 p-6 border border-dashed border-border flex items-center gap-4 mt-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#3882a5]">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                        <span className="font-bold text-gray-800">Security Note:</span> These settings control critical platform behaviors for your company. Changes are applied instantly across all entry points and user dashboards.
                                    </p>
                                </div>

                            </div>
                        </FormContainer>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
