"use client";

import { useEffect } from "react";
import { 
    useGetSettingsQuery, 
    useSaveSMSConfigMutation 
} from "@/store/api/settingsApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
    MessageSquare, 
    Save, 
    Info,
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    MapPin
} from "lucide-react";
import { SettingsHeader } from "./SettingsHeader";
import { ActionButton } from "@/components/common/actionButton";
import { FormContainer } from "@/components/common/formContainer";
import { APIErrorState } from "@/components/common/APIErrorState";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

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
        if (!settings?.sms?.templates || isDirty) return;
        const sms = settings.sms;
        reset({
            templates: {
                newRequest: sms.templates.newRequest || "",
                approvedVisitor: sms.templates.approvedVisitor || "",
                approvedEmployee: sms.templates.approvedEmployee || "",
                rejectedVisitor: sms.templates.rejectedVisitor || "",
                visitorCheckedIn: sms.templates.visitorCheckedIn || "",
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
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
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

    const TemplateCard = ({ 
        id, 
        label, 
        icon: Icon, 
        placeholders,
        error 
    }: { 
        id: keyof FormValues['templates'], 
        label: string, 
        icon: any,
        placeholders: string[],
        error?: string 
    }) => {
        const isEnabled = watch(`enabledTemplates.${id}`);

        return (
            <div className={`space-y-4 p-6 rounded-2xl border transition-all duration-300 ${
                isEnabled 
                ? 'border-border/50 bg-muted/20 hover:bg-muted/30 shadow-sm' 
                : 'border-border/20 bg-muted/5 opacity-75 grayscale-[0.5]'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg transition-colors ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <Label className={`text-base font-semibold transition-colors ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {label}
                        </Label>
                    </div>
                    <Controller
                        name={`enabledTemplates.${id}`}
                        control={control}
                        render={({ field }) => (
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className={`space-y-2 transition-all duration-300 ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <Textarea
                        {...register(`templates.${id}`)}
                        placeholder="Enter message template..."
                        className={`min-h-[100px] bg-background resize-none rounded-xl border-border/60 focus:border-primary transition-all ${error ? 'border-destructive' : ''}`}
                    />
                    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                </div>

                <div className={`space-y-2 transition-all duration-300 ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Info className="h-3 w-3" />
                        <span>Available Placeholders</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {placeholders.map((p) => (
                            <code key={p} className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-primary border border-primary/10">
                                {`{${p}}`}
                            </code>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-foreground">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                                    <TemplateCard
                                        id="newRequest"
                                        label="New Appointment Request (to Employee)"
                                        icon={Calendar}
                                        placeholders={["companyName", "visitorName", "employeeName", "date", "time", "approvalLink"]}
                                        error={errors.templates?.newRequest?.message}
                                    />
                                    <TemplateCard
                                        id="visitorCheckedIn"
                                        label="Visitor Checked-in / Arrived (to Employee)"
                                        icon={MapPin}
                                        placeholders={["companyName", "visitorName", "employeeName"]}
                                        error={errors.templates?.visitorCheckedIn?.message}
                                    />
                                    <TemplateCard
                                        id="approvedVisitor"
                                        label="Appointment Approved (to Visitor)"
                                        icon={CheckCircle2}
                                        placeholders={["companyName", "visitorName", "employeeName", "date", "time"]}
                                        error={errors.templates?.approvedVisitor?.message}
                                    />
                                    <TemplateCard
                                        id="approvedEmployee"
                                        label="Appointment Approved (to Employee)"
                                        icon={User}
                                        placeholders={["companyName", "visitorName", "employeeName", "date", "time"]}
                                        error={errors.templates?.approvedEmployee?.message}
                                    />
                                    <TemplateCard
                                        id="rejectedVisitor"
                                        label="Appointment Rejected (to Visitor)"
                                        icon={XCircle}
                                        placeholders={["companyName", "visitorName", "date"]}
                                        error={errors.templates?.rejectedVisitor?.message}
                                    />
                                </div>

                                <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end border-t border-border/50">
                                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
                                            disabled={isSaving}
                                            variant="primary"
                                            size="xl"
                                            className="min-w-[200px] shadow-lg shadow-primary/20"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            <span>{isSaving ? "Saving..." : "Save Templates"}</span>
                                        </ActionButton>
                                    </div>
                                </div>
                            </form>
                        </FormContainer>
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
