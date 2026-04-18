"use client";

import { useState, useEffect } from "react";
import { 
    useGetSettingsQuery, 
    useSaveSMSConfigMutation,
    useUpdateSettingsMutation
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
    MessageSquare, 
    Save, 
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    MapPin,
    ChevronRight,
    Settings2,
    Eye,
    Palette,
    Phone,
    Mail
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm, Controller, type Path } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SettingsMasterBanner } from "./SettingsMasterBanner";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";

const schema = yup.object().shape({
    templates: yup.object().shape({
        newRequest: yup.string().required("Template is required"),
        approvedVisitor: yup.string().required("Template is required"),
        approvedEmployee: yup.string().required("Template is required"),
        rejectedVisitor: yup.string().required("Template is required"),
        visitorCheckedIn: yup.string().required("Template is required"),
    }),
    enabledTemplates: yup.object().shape({
        newRequest: yup.boolean(),
        approvedVisitor: yup.boolean(),
        approvedEmployee: yup.boolean(),
        rejectedVisitor: yup.boolean(),
        visitorCheckedIn: yup.boolean(),
    }),
});

interface FormValues {
    templates: {
        newRequest: string;
        approvedVisitor: string;
        approvedEmployee: string;
        rejectedVisitor: string;
        visitorCheckedIn: string;
    };
    enabledTemplates: {
        newRequest: boolean;
        approvedVisitor: boolean;
        approvedEmployee: boolean;
        rejectedVisitor: boolean;
        visitorCheckedIn: boolean;
    };
}

export function SMSSettings() {
    const router = useRouter();
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [saveSMS, { isLoading: isSaving }] = useSaveSMSConfigMutation();

    const [updateSettings] = useUpdateSettingsMutation();

    const { expandedSections, toggleSection } = useCollapsibleSections(["templates"]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>("newRequest");

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            templates: {
                newRequest: "",
                approvedVisitor: "",
                approvedEmployee: "",
                rejectedVisitor: "",
                visitorCheckedIn: "",
            },
            enabledTemplates: {
                newRequest: true,
                approvedVisitor: true,
                approvedEmployee: true,
                rejectedVisitor: true,
                visitorCheckedIn: true,
            }
        },
    });

    useEffect(() => {
        if (!settings?.sms || isDirty) return;
        const sms = settings.sms;
        reset({
            templates: {
                newRequest: sms.templates?.newRequest || "",
                approvedVisitor: sms.templates?.approvedVisitor || "",
                approvedEmployee: sms.templates?.approvedEmployee || "",
                rejectedVisitor: sms.templates?.rejectedVisitor || "",
                visitorCheckedIn: sms.templates?.visitorCheckedIn || "",
            },
            enabledTemplates: {
                newRequest: sms.enabledTemplates?.newRequest ?? true,
                approvedVisitor: sms.enabledTemplates?.approvedVisitor ?? true,
                approvedEmployee: sms.enabledTemplates?.approvedEmployee ?? true,
                rejectedVisitor: sms.enabledTemplates?.rejectedVisitor ?? true,
                visitorCheckedIn: sms.enabledTemplates?.visitorCheckedIn ?? true,
            }
        });
    }, [settings, reset, isDirty]);

    const onSubmit = async (data: FormValues) => {
        try {
            await saveSMS(data).unwrap();
            toast.success("SMS templates saved successfully!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save templates.");
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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-foreground pb-12">
                                
                                <SettingsMasterBanner
                                    title="All SMS Notifications"
                                    description="Enable or disable all outgoing SMS notifications"
                                    icon={MessageSquare}
                                    checked={settings?.notifications?.smsEnabled ?? false}
                                    onCheckedChange={async (checked) => {
                                        try {
                                            await updateSettings({
                                                notifications: { smsEnabled: checked },
                                            }).unwrap();
                                        } catch {
                                            toast.error("Failed to update SMS status");
                                        }
                                    }}
                                />
                                
                                <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                                    <Collapsible open={expandedSections.includes('templates')} onOpenChange={() => toggleSection('templates')}>
                                        <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('templates')}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                                    <MessageSquare size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">Message Template Controls</h3>
                                                    <p className="text-xs text-gray-500">Enable and customize SMS content for specific events</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('templates') && "rotate-90")} />
                                        </div>

                                        <CollapsibleContent>
                                            <div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-4 pt-2">
                                                    {[
                                                        { id: "newRequest", label: "New Appointment Request", icon: Calendar, placeholders: ["companyName", "visitorName", "employeeName", "date", "time", "approvalLink"] },
                                                        { id: "visitorCheckedIn", label: "Visitor Checked-in / Arrived", icon: MapPin, placeholders: ["companyName", "visitorName", "employeeName"] },
                                                        { id: "approvedVisitor", label: "Appointment Approved (Visitor)", icon: CheckCircle2, placeholders: ["companyName", "visitorName", "employeeName", "date", "time"] },
                                                        { id: "approvedEmployee", label: "Appointment Approved (Employee)", icon: User, placeholders: ["companyName", "visitorName", "employeeName", "date", "time"] },
                                                        { id: "rejectedVisitor", label: "Appointment Rejected (Visitor)", icon: XCircle, placeholders: ["companyName", "visitorName", "date"] },
                                                    ].map((template) => (
                                                        <div key={template.id} className="border border-border/50 rounded-xl bg-muted/5 transition-all overflow-hidden shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                                                            <div className="flex items-center justify-between p-4 px-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2.5 rounded-lg bg-background border border-border/50 text-[#3882a5]">
                                                                        <template.icon size={18} />
                                                                    </div>
                                                                    <h4 className="font-bold text-[#074463]">{template.label}</h4>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Status</span>
                                                                        <Controller
                                                                            name={`enabledTemplates.${template.id}` as Path<FormValues>}
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <BrandSwitch
                                                                                    checked={Boolean(field.value)}
                                                                                    onCheckedChange={async (checked: boolean) => {
                                                                                        // Update form state directly
                                                                                        field.onChange(checked);
                                                                                        
                                                                                        // Immediate save to backend
                                                                                        try {
                                                                                            const currentFormValues = watch();
                                                                                            await saveSMS({
                                                                                                templates: currentFormValues.templates,
                                                                                                enabledTemplates: {
                                                                                                    ...currentFormValues.enabledTemplates,
                                                                                                    [template.id]: checked
                                                                                                }
                                                                                            }).unwrap();
                                                                                        } catch (err: any) {
                                                                                            // Rollback form state if save fails
                                                                                            field.onChange(!checked);
                                                                                            console.error("Failed to update status:", err);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
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
                                                                        <Settings2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {selectedTemplate === template.id && (
                                                                <div className="p-6 border-t border-dashed border-border/50 bg-white/40 animate-in fade-in duration-300">
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label className="text-xs font-bold text-gray-700">SMS message text content</Label>
                                                                            <Textarea
                                                                                {...register(`templates.${template.id}` as Path<FormValues>)}
                                                                                className="min-h-[120px] rounded-lg p-4 font-medium text-sm border-border bg-background resize-none" 
                                                                                placeholder="Enter SMS template..."
                                                                            />
                                                                            {errors.templates?.[template.id as keyof FormValues['templates']] && (
                                                                                <p className="text-xs text-destructive font-semibold">{(errors.templates as any)[template.id]?.message}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Available Variables:</span>
                                                                            {template.placeholders.map(p => (
                                                                                <code key={p} className="px-2 py-1 rounded bg-[#3882a5]/5 text-[10px] font-bold text-[#3882a5] border border-[#3882a5]/10">{"{"}{p}{"}"}</code>
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

                                <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end border-t border-border/50 items-center">
                                    <p className="text-sm font-semibold text-muted-foreground tracking-tight hidden sm:block mr-auto">Templates will be matched with system triggers automatically</p>
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
                                        className="min-w-[200px] shadow-lg shadow-[#3882a5]/20 font-black tracking-widest px-10"
                                        icon={Save}
                                        label="APPLY ALL TEMPLATES"
                                    />
                                </div>
                            </form>
                        </FormContainer>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
