"use client";

import { useState, useEffect } from "react";
import { 
    useGetSettingsQuery, 
    useUpdateSettingsMutation,
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { 
    MessageSquare, 
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    MapPin,
    ChevronRight,
    Eye,
    Loader2,
    LogOut,
    Star,
    Clock,
    Link
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { cn } from "@/lib/utils";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";

export function SMSSettings() {
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;

    const { expandedSections, toggleSection } = useCollapsibleSections(["templates"]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>("newRequest");

    const coreSmsTemplates = ["newRequest", "visitorCheckedIn", "approvedVisitor", "approvedEmployee", "rejectedVisitor", "appointmentLink"];
    const normalizedEnabledTemplates = (settings?.sms as any)?.enabledTemplates || {};
    
    const handleToggle = async (templateId: string, enabled: boolean) => {
        try {
            const currentEnabledTemplates = (settings?.sms as any)?.enabledTemplates || {};
            await updateSettings({
                sms: {
                    enabledTemplates: {
                        ...currentEnabledTemplates,
                        [templateId]: enabled
                    }
                }
            }).unwrap();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update status");
        }
    };

    const handleMasterToggle = async (enabled: boolean) => {
        try {
            await updateSettings({
                notifications: {
                    ...settings?.notifications,
                    smsEnabled: enabled
                }
            }).unwrap();
            toast.success("Master SMS settings updated");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update master settings");
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6 space-y-8 animate-pulse p-4 text-foreground">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-6 rounded-2xl border border-border/50 bg-background/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                                <Skeleton className="h-6 w-12 rounded-full" />
                            </div>
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <APIErrorState title="Failed to load settings" error={error} />;
    }

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6">
            <ProfileLayout>
                {() => (
                    <div className="mx-auto w-full max-w-full">
                        <SettingsHeader
                            title="SMS Gateway"
                            description="Customize the SMS notifications sent for appointment events. All messages are delivered via the system's platform gateway."
                            icon={MessageSquare}
                        />

                        <FormContainer isPage={true} isLoading={isLoading} isEditMode={false}>
                            <form className="space-y-6 text-foreground pb-12">
                                {/* Master Toggle Section */}
                                {!!modules?.enableSms && (
                                    <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                        <div className="p-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                    <MessageSquare size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">Master SMS Toggle</h3>
                                                    <p className="text-xs text-gray-500">Enable or disable all SMS notifications globally</p>
                                                </div>
                                            </div>
                                            <BrandSwitch 
                                                checked={settings?.notifications?.smsEnabled ?? false} 
                                                onCheckedChange={handleMasterToggle} 
                                                variant="default" 
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                    <Collapsible open={expandedSections.includes('templates')} onOpenChange={() => toggleSection('templates')}>
                                        <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('templates')}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                    <MessageSquare size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">Message Template Controls</h3>
                                                    <p className="text-xs text-gray-500">Enable or disable SMS notifications for specific events</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('templates') && "rotate-90")} />
                                        </div>

                                        <CollapsibleContent>
                                            <div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-4 pt-2">
                                                    {[
                                                        { id: "newRequest", label: "SafeIn_New_Request", icon: Calendar, placeholders: ["companyName", "visitorName", "employeeName", "date", "time", "approvalLink"] },
                                                        { id: "visitorCheckedIn", label: "SafeIn_Visitor_In", icon: MapPin, placeholders: ["companyName", "visitorName", "employeeName"] },
                                                        { id: "approvedVisitor", label: "SafeIn_Visit_Confirmed", icon: CheckCircle2, placeholders: ["companyName", "visitorName", "employeeName", "date", "time"] },
                                                        { id: "approvedEmployee", label: "SafeIn_Visit_Confirmed", icon: User, placeholders: ["visitorName", "employeeName", "date", "time", "companyName"] },
                                                        { id: "rejectedVisitor", label: "SafeIn_Visit_Reject", icon: XCircle, placeholders: ["visitorName", "date", "companyName"] },
                                                        { id: "appointmentLink", label: "SafeIn_Booking_Link", icon: Link, placeholders: ["employeeName", "bookingUrl", "companyName"] },
                                                        { id: "visitorCheckedOut", label: "SafeIn_Visitor_Out", icon: LogOut, placeholders: ["companyName", "visitorName"] },
                                                        { id: "feedbackRequest", label: "feedback_request", icon: Star, placeholders: ["companyName", "visitorName", "feedbackLink"] },
                                                        { id: "hostDelayed", label: "host_delayed", icon: Clock, placeholders: ["companyName", "visitorName", "employeeName", "delayTime"] },
                                                    ].map((template) => (
                                                        <div key={template.id} className="border border-border/50 rounded-xl bg-background transition-all overflow-hidden">
                                                            <div className="flex items-center justify-between p-4 px-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2.5 rounded-lg bg-muted text-[#3882a5]">
                                                                        <template.icon size={18} />
                                                                    </div>
                                                                    <h4 className="font-bold text-[#074463]">{template.label}</h4>
                                                                </div>
                                                                
                                                                 <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs uppercase font-bold text-muted-foreground tracking-tight">Status</span>
                                                                        <Switch 
                                                                            checked={normalizedEnabledTemplates[template.id] !== undefined ? normalizedEnabledTemplates[template.id] : coreSmsTemplates.includes(template.id)}
                                                                            onCheckedChange={(checked) => handleToggle(template.id, checked)}
                                                                            disabled={isUpdating}
                                                                        />
                                                                    </div>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)} 
                                                                        className={cn(
                                                                            "h-9 w-9 flex items-center justify-center rounded-lg border shadow-sm transition-all",
                                                                            selectedTemplate === template.id ? 'bg-[#074463] text-white border-[#074463]' : 'bg-background text-gray-400 hover:text-[#3882a5]'
                                                                        )}
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                 </div>
                                                            </div>

                                                            {selectedTemplate === template.id && (
                                                                <div className="p-6 border-t border-dashed border-border/50 bg-muted/10 animate-in fade-in duration-300">
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label className="text-xs font-bold text-[#3882a5] uppercase tracking-wider">SMS message preview</Label>
                                                                            <div className="min-h-[60px] rounded-xl p-4 font-medium text-sm border border-border/50 bg-background text-gray-800 shadow-inner leading-relaxed">
                                                                                {(settings?.sms?.templates as any)?.[template.id] || "No template content configured."}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                                            <span className="text-xs font-bold text-muted-foreground uppercase mr-1 text-xs">Variables used:</span>
                                                                            {template.placeholders.map(p => (
                                                                                <code key={p} className="px-2 py-0.5 rounded bg-blue-50 text-xs font-bold text-blue-600 border border-blue-100">{"{"}{p}{"}"}</code>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            </form>
                        </FormContainer>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
