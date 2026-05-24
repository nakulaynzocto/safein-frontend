"use client";

import { useState, useEffect } from "react";
import { 
    useGetSettingsQuery, 
    useUpdateSettingsMutation,
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { 
    Lock,
    Link,
    ShieldCheck,
    MessageSquare,
    ChevronRight,
    Calendar,
    MapPin,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

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

    const coreSmsTemplates = ["newAppointmentRequest", "appointmentLink"];
    const normalizedEnabledTemplates = (settings?.sms as any)?.enabledTemplates || {};
    
    // SMS toggles are managed individually by tenants, while templates are global

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
                                                {/* Read-only info banner */}
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
                                                    <Lock size={13} />
                                                    <span>SMS template content is managed globally by SafeIn Admin. You can <strong>turn them on or off</strong> individually below.</span>
                                                </div>
                                                <div className="space-y-4 pt-2">
                                                    {[
                                                        { id: "newAppointmentRequest", label: "SafeIn_New_Request", icon: Calendar, placeholders: ["visitorName", "approvalLink"] },
                                                        { id: "appointmentLink", label: "SafeIn_Booking_Link", icon: Link, placeholders: ["companyName", "bookingUrl"] },
                                                        { id: "specialVisitorEntry", label: "SafeIn_Special_Entry_Pass", icon: ShieldCheck, placeholders: ["companyName", "otp"] },
                                                    ].map((template) => {
                                                        const isEnabled = normalizedEnabledTemplates[template.id] !== undefined
                                                            ? normalizedEnabledTemplates[template.id]
                                                            : coreSmsTemplates.includes(template.id);
                                                        return (
                                                        <div key={template.id} className="border border-border/50 rounded-xl bg-background transition-all overflow-hidden">
                                                            <div className="flex items-center justify-between p-4 px-5">
                                                                 <div className="flex items-center gap-4">
                                                                    <div className="p-2.5 rounded-lg bg-muted text-[#3882a5]">
                                                                        <template.icon size={18} />
                                                                    </div>
                                                                    <h4 className="font-bold text-[#074463]">{template.label}</h4>
                                                                </div>
                                                                
                                                                 <div className="flex items-center gap-4">
                                                                    <BrandSwitch 
                                                                        checked={isEnabled}
                                                                        onCheckedChange={async (checked) => {
                                                                            try {
                                                                                await updateSettings({
                                                                                    sms: {
                                                                                        enabledTemplates: {
                                                                                            ...normalizedEnabledTemplates,
                                                                                            [template.id]: checked
                                                                                        }
                                                                                    }
                                                                                }).unwrap();
                                                                                toast.success(`${template.label} updated successfully`);
                                                                            } catch (err: any) {
                                                                                toast.error(err?.data?.message || "Failed to update notification settings");
                                                                            }
                                                                        }}
                                                                        variant="default"
                                                                    />
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     )})}
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
