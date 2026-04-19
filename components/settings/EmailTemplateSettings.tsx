"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    useGetSettingsQuery, 
    useSaveEmailTemplatesMutation, 
    useGetEmailTemplateDefaultsQuery,
    useUpdateSettingsMutation
} from "@/store/api/settingsApi";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useGetSafeinProfileQuery } from "@/store/api/safeinProfileApi";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import {
    Palette,
    Save,
    Eye,
    Settings2,
    CheckCircle2,
    Link,
    Mail,
    ChevronRight
} from "lucide-react";

import { ActionButton } from "@/components/common/actionButton";
import { InputField } from "@/components/common/inputField";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SettingsMasterBanner } from "./SettingsMasterBanner";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";

/** Same default as Gatekeeper `DEFAULT_EMAIL_BRANDING.logoUrl` — used if API state is briefly empty */
const PREVIEW_LOGO_FALLBACK =
    "https://res.cloudinary.com/dlt9v7m8i/image/upload/v1713374825/safein-logo-dark.png";

/** Absolute URL for preview when logo is stored as a relative / uploads path */
function resolveCompanyLogoUrl(raw: string | undefined | null): string | undefined {
    if (!raw?.trim()) return undefined;
    const s = raw.trim();
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    const base =
        (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "")) ||
        "http://localhost:4010";
    const clean = s.replace(/^\/?(public\/)?/, "");
    return `${base}/${clean}`;
}

export const TEMPLATE_TYPES = [
    { id: "appointmentApproval", label: "Approval Notification", icon: CheckCircle2, placeholders: ["visitorName", "employeeName", "date", "time", "companyName"] },
    { id: "appointmentRejection", label: "Rejection Notification", icon: Settings2, placeholders: ["visitorName", "employeeName", "date", "time", "companyName"] },
    { id: "newAppointmentRequest", label: "New Request Notification", icon: Mail, placeholders: ["visitorName", "employeeName", "date", "time", "purpose", "approvalToken", "companyName"] },
    { id: "appointmentConfirmation", label: "Confirmation Notification", icon: CheckCircle2, placeholders: ["visitorName", "employeeName", "date", "time", "companyName"] },
    { id: "appointmentLink", label: "Invite Link Notification", icon: Link, placeholders: ["employeeName", "bookingUrl", "companyName"] },
];

export function EmailTemplateSettings() {
    const { user } = useAppSelector((state) => state.auth);
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [saveTemplates, { isLoading: isSaving }] = useSaveEmailTemplatesMutation();
    const [updateSettings] = useUpdateSettingsMutation();
    
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>("appointmentApproval");
    const { expandedSections, toggleSection } = useCollapsibleSections(["branding", "templates"]);
    
    const [globalStyles, setGlobalStyles] = useState({
        primaryColor: "#10567a",
        textColor: "#2d3748",
        headerBg: "#ffffff",
        footerBg: "#f7fafc",
        footerText: "© 2024 Gatekeeper Security. All rights reserved.",
        logoUrl: ""
    });

    const [templates, setTemplates] = useState<any>({
        appointmentApproval: { subject: "", body: "" },
        appointmentRejection: { subject: "", body: "" },
        newAppointmentRequest: { subject: "", body: "" },
        appointmentConfirmation: { subject: "", body: "" },
        appointmentLink: { subject: "", body: "" },
    });

    const [enabledTemplates, setEnabledTemplates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (settings?.emailTemplates) {
            if (settings.emailTemplates.templates) setTemplates(settings.emailTemplates.templates);
            if (settings.emailTemplates.globalStyles) {
                const gs = settings.emailTemplates.globalStyles as any;
                setGlobalStyles({
                    primaryColor: gs.primaryColor || "#10567a",
                    textColor: gs.textColor || "#2d3748",
                    headerBg: gs.headerBg || "#ffffff",
                    footerBg: gs.footerBg || "#f7fafc",
                    footerText: gs.footerText || "",
                    logoUrl: gs.logoUrl || ""
                });
            }
            if (settings.emailTemplates.enabledTemplates) setEnabledTemplates(settings.emailTemplates.enabledTemplates);
        }
    }, [settings]);
    const { data: safeinProfileResponse } = useGetSafeinProfileQuery(undefined, {
        skip: !user?.id,
    });
    const { data: profileUser } = useGetProfileQuery(undefined, {
        skip: !user?.id,
    });



    /** Preview: billing company logo → email branding URL (server syncs profile/default) → profile picture */
    const previewLogoUrl = useMemo(() => {
        const first = (raw: string | undefined | null) => resolveCompanyLogoUrl(raw?.trim() || undefined);
        const safein = safeinProfileResponse?.data;
        return (
            first(safein?.companyDetails?.logo) ||
            first((safein as { logo?: string } | undefined)?.logo) ||
            first(globalStyles.logoUrl) ||
            first(profileUser?.profilePicture) ||
            PREVIEW_LOGO_FALLBACK
        );
    }, [
        safeinProfileResponse?.data,
        globalStyles.logoUrl,
        profileUser?.profilePicture,
    ]);

    const handleSave = async () => {
        try {
            await saveTemplates({
                globalStyles,
                templates
            }).unwrap();
            toast.success("Email settings saved successfully!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save settings");
        }
    };

    const updateGlobalStyle = (key: string, value: string) => {
        setGlobalStyles(prev => ({ ...prev, [key]: value }));
    };

    const updateTemplate = (key: string, field: string, value: string) => {
        setTemplates((prev: any) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const { data: defaultData } = useGetEmailTemplateDefaultsQuery();

    const resetToDefault = (id: string) => {
        const defaults = defaultData?.templates?.[id];
        if (defaults) {
            setTemplates((prev: any) => ({
                ...prev,
                [id]: { 
                    subject: defaults.subject,
                    body: defaults.body
                }
            }));
            toast.success("Reset to default");
        }
    };

    if (isLoading) {
        return <Skeleton className="h-[600px] w-full rounded-[40px]" />;
    }

    // Sample data for preview
    const mockData: Record<string, string> = {
        visitorName: "Nakul Singh",
        employeeName: "John Doe",
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: "10:30 AM",
        companyName: settings?.companyName || user?.companyName || "Your Company",
        purpose: "Business Meeting",
        otp: "123456",
        approvalToken: "#",
        bookingUrl: "#",
    };

    const replaceMock = (text: string) => {
        let result = text;
        const data = { ...mockData, primaryColor: globalStyles.primaryColor };
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = new RegExp(`{${key}}`, 'g');
            result = result.replace(placeholder, value);
        });
        return result;
    };

    return (
        <div className="space-y-8 pb-4">
            <SettingsMasterBanner
                title="All Email Notifications"
                description="Enable or disable all outgoing email notifications"
                icon={Mail}
                checked={settings?.notifications?.emailEnabled ?? false}
                onCheckedChange={async (checked) => {
                    try {
                        await updateSettings({
                            notifications: { emailEnabled: checked },
                        }).unwrap();
                    } catch {
                        toast.error("Failed to update email status");
                    }
                }}
            />

            {/* 1. Global Branding Section */}
            <div className="rounded-2xl border border-border/50 bg-background overflow-hidden mb-6 shadow-sm">
                <Collapsible open={expandedSections.includes('branding')} onOpenChange={() => toggleSection('branding')}>
                    <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('branding')}>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                <Palette size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Email Branding</h3>
                                <p className="text-xs text-gray-500">Global styles, colors and company identity</p>
                            </div>
                        </div>
                        <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('branding') && "rotate-90")} />
                    </div>

                    <CollapsibleContent>
                        <div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4">
                                {/* Branding Controls */}
                                <div className="xl:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 border border-border/50 bg-muted/5 rounded-xl space-y-4">
                                            <h3 className="text-sm font-bold text-[#074463]">Color Palette</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1.5 w-full">
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Primary Color</Label>
                                                    <div className="flex items-center gap-3 p-2 bg-background rounded-lg border w-full">
                                                        <input 
                                                            type="color" 
                                                            value={globalStyles.primaryColor} 
                                                            onChange={(e) => updateGlobalStyle("primaryColor", e.target.value)} 
                                                            className="w-6 h-6 rounded cursor-pointer border-none shrink-0" 
                                                        />
                                                        <span className="text-xs font-mono font-bold truncate">{globalStyles.primaryColor}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 w-full">
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Text Color</Label>
                                                    <div className="flex items-center gap-3 p-2 bg-background rounded-lg border w-full">
                                                        <input type="color" value={globalStyles.textColor} onChange={(e) => updateGlobalStyle("textColor", e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none shrink-0" />
                                                        <span className="text-xs font-mono font-bold truncate">{globalStyles.textColor}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 border border-border/50 bg-muted/5 rounded-xl space-y-4">
                                            <h3 className="text-sm font-bold text-[#074463]">Email Layout</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1.5 w-full">
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Header Bg</Label>
                                                    <div className="flex items-center gap-3 p-2 bg-background rounded-lg border w-full">
                                                        <input type="color" value={globalStyles.headerBg} onChange={(e) => updateGlobalStyle("headerBg", e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none shrink-0" />
                                                        <span className="text-xs font-mono font-bold truncate">{globalStyles.headerBg}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 w-full">
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Footer Bg</Label>
                                                    <div className="flex items-center gap-3 p-2 bg-background rounded-lg border w-full">
                                                        <input type="color" value={globalStyles.footerBg} onChange={(e) => updateGlobalStyle("footerBg", e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none shrink-0" />
                                                        <span className="text-xs font-mono font-bold truncate">{globalStyles.footerBg}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-border/50 bg-muted/5 rounded-xl space-y-6">
                                        <h3 className="text-sm font-bold text-[#074463]">Company Information</h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            <InputField
                                                label="Company Logo URL"
                                                value={globalStyles.logoUrl ?? ""}
                                                onChange={(e) => updateGlobalStyle("logoUrl", e.target.value)}
                                                className="h-10 rounded-lg border-border"
                                                placeholder="https://yourlogo.com/logo.png"
                                            />
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-muted-foreground uppercase">Footer Copyright Text</Label>
                                                <Textarea 
                                                    value={globalStyles.footerText} 
                                                    onChange={(e) => updateGlobalStyle("footerText", e.target.value)} 
                                                    className="rounded-lg bg-background min-h-[80px] border-border p-3 text-sm resize-none" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Branding Preview */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Eye size={16} className="text-muted-foreground" />
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Branding Live Preview</span>
                                    </div>
                                    <div className="rounded-xl border border-border/50 bg-white overflow-hidden shadow-sm flex flex-col min-h-[400px]">
                                        <div className="flex-1 bg-muted/5 p-4">
                                            <div className="mx-auto w-full bg-white shadow-sm rounded-lg overflow-hidden flex flex-col h-full border border-border/20" style={{ color: globalStyles.textColor, fontFamily: 'sans-serif' }}>
                                                <div className="shrink-0 p-4 text-center border-b border-border/20" style={{ backgroundColor: globalStyles.headerBg }}>
                                                    {previewLogoUrl ? (
                                                        <img src={previewLogoUrl} alt="Logo" className="h-6 mx-auto object-contain" />
                                                    ) : (
                                                        <h1 style={{ color: globalStyles.primaryColor, fontWeight: 900, fontSize: '18px' }}>{mockData.companyName}</h1>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-6 text-[12px] leading-relaxed">
                                                    <div style={{ color: globalStyles.primaryColor, fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>Verification Successful</div>
                                                    <p style={{ marginBottom: '15px' }}>Hello <strong>User</strong>, your account has been verified successfully.</p>
                                                    <div style={{ backgroundColor: globalStyles.primaryColor + '10', borderLeft: `4px solid ${globalStyles.primaryColor}`, padding: '12px', marginBottom: '15px' }}>
                                                        Welcome to our platform. We are excited to have you on board!
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <button style={{ backgroundColor: globalStyles.primaryColor, color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold' }}>ACCESS DASHBOARD</button>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 p-3 text-center text-[8px] border-t border-border/20" style={{ backgroundColor: globalStyles.footerBg, color: 'inherit', opacity: 0.6 }}>
                                                    {globalStyles.footerText}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* 2. Email Template Controls Section */}
            <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
                <Collapsible open={expandedSections.includes('templates')} onOpenChange={() => toggleSection('templates')}>
                    <div className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleSection('templates')}>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Email Template Controls</h3>
                                <p className="text-xs text-gray-500">Configure triggers and customize notification content</p>
                            </div>
                        </div>
                        <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", expandedSections.includes('templates') && "rotate-90")} />
                    </div>

                    <CollapsibleContent>
                        <div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4 pt-2">
                                {TEMPLATE_TYPES.map((template) => (
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
                                                    <BrandSwitch 
                                                        checked={enabledTemplates[template.id] ?? true}
                                                        onCheckedChange={async (checked: boolean) => {
                                                            // Optimistic update
                                                            setEnabledTemplates(prev => ({ ...prev, [template.id]: checked }));
                                                            try {
                                                                await updateSettings({
                                                                    emailTemplates: {
                                                                        enabledTemplates: {
                                                                            [template.id]: checked
                                                                        }
                                                                    }
                                                                }).unwrap();
                                                            } catch (err: any) {
                                                                // Rollback on error
                                                                setEnabledTemplates(prev => ({ ...prev, [template.id]: !checked }));
                                                                console.error("Failed to update status:", err);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <button 
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
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                    <div className="space-y-5">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-xs font-bold text-gray-700">Email Subject</Label>
                                                                <button onClick={() => resetToDefault(template.id)} className="text-[10px] font-bold text-[#3882a5] hover:underline">RESET TO DEFAULT</button>
                                                            </div>
                                                            <InputField value={templates[template.id]?.subject || ""} onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)} className="h-10 rounded-lg border-border" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-gray-700">HTML Body Content</Label>
                                                            <Textarea value={templates[template.id]?.body || ""} onChange={(e) => updateTemplate(template.id, 'body', e.target.value)} className="min-h-[250px] rounded-lg p-4 font-mono text-xs border-border bg-background" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Placeholders:</span>
                                                            {template.placeholders.map(p => (
                                                                <code key={p} className="px-2 py-1 rounded bg-[#3882a5]/5 text-[10px] font-bold text-[#3882a5] border border-[#3882a5]/10">{"{"}{p}{"}"}</code>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Eye size={16} className="text-muted-foreground" />
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Live Visual Preview</span>
                                                        </div>
                                                        <div className="rounded-xl border border-border/50 bg-white overflow-hidden shadow-sm flex flex-col min-h-[400px]">
                                                            <div className="bg-muted/30 border-b p-4 font-bold text-sm truncate text-[#074463]">{replaceMock(templates[template.id]?.subject || "Subject Preview")}</div>
                                                            <div className="flex-1 bg-muted/5 p-6">
                                                                <div className="mx-auto w-full bg-white shadow-sm rounded-lg overflow-hidden flex flex-col h-full border border-border/20" style={{ color: globalStyles.textColor, fontFamily: 'sans-serif' }}>
                                                                    <div className="shrink-0 p-6 text-center border-b border-border/20" style={{ backgroundColor: globalStyles.headerBg }}>
                                                                        {previewLogoUrl ? <img src={previewLogoUrl} alt="Logo" className="h-6 mx-auto object-contain" /> : <h1 style={{ color: globalStyles.primaryColor, fontWeight: 900, fontSize: '20px' }}>{mockData.companyName}</h1>}
                                                                    </div>
                                                                    <div className="flex-1 overflow-y-auto p-6 text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: replaceMock(templates[template.id]?.body || "Content preview here...") }} />
                                                                    <div className="shrink-0 p-4 text-center text-[9px] border-t border-border/20 bg-muted/30 text-muted-foreground">{globalStyles.footerText}</div>
                                                                </div>
                                                            </div>
                                                        </div>
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

            <div className="flex justify-end pt-10 items-center gap-6">
                <p className="text-sm font-semibold text-muted-foreground tracking-tight hidden sm:block">Update your branding and templates in one click</p>
                <ActionButton 
                    onClick={handleSave} 
                    isLoading={isSaving || isLoading} 
                    variant="primary"
                    size="xl"
                    disabled={isSaving}
                    className="font-black tracking-widest px-10"
                    icon={Save}
                    label="APPLY ALL SETTINGS"
                />
            </div>
        </div>
    );
}
