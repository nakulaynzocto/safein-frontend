"use client";

import { useEffect, useState, memo } from "react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/api/settingsApi";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { toast } from "sonner";
import { 
    Users, 
    UserCheck, 
    CalendarCheck, 
    Loader2, 
    Save 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/common/actionButton";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";

// --- Sub-components (Optimized & Memoized) ---

const SettingItem = memo(({ label, subLabel, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        <div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
            <p className="text-[10px] text-gray-500">{subLabel}</p>
        </div>
        <BrandSwitch checked={checked} onCheckedChange={onChange} />
    </div>
));
SettingItem.displayName = "SettingItem";

const MasterSwitchCard = memo(({ title, description, checked, onChange, isEnabled }: any) => (
    <div className={cn(
        "relative overflow-hidden p-5 rounded-2xl border transition-all duration-300",
        isEnabled 
            ? "bg-[#3882a5]/5 border-[#3882a5]/20 shadow-[0_0_15px_-5px_rgba(56,130,165,0.1)]" 
            : "bg-white border-gray-200"
    )}>
        <div className="flex items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <BrandSwitch checked={checked} onCheckedChange={onChange} />
        </div>
    </div>
));
MasterSwitchCard.displayName = "MasterSwitchCard";

const NotificationCard = memo(({ title, description, type, config, onToggle }: any) => (
    <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all hover:shadow-md">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="p-5 space-y-4">
            <SettingItem 
                label="Email Notifications" 
                subLabel="Send via SMTP server" 
                checked={config[type].email} 
                onChange={() => onToggle(`${type}.email`)} 
            />
            <SettingItem 
                label="WhatsApp Messages" 
                subLabel="Send via Meta API" 
                checked={config[type].whatsapp} 
                onChange={() => onToggle(`${type}.whatsapp`)} 
            />
        </div>
    </div>
));
NotificationCard.displayName = "NotificationCard";

// --- Main Component ---

export function NotificationSettings() {
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

    const [config, setConfig] = useState<any>({
        emailEnabled: true,
        whatsappEnabled: true,
        visitor: { email: true, whatsapp: true },
        employee: { email: true, whatsapp: true },
        appointment: { email: true, whatsapp: true },
    });

    const [modal, setModal] = useState({ isOpen: false, path: "" });

    useEffect(() => {
        if (settings?.notifications) {
            setConfig({
                emailEnabled: settings.notifications.emailEnabled ?? true,
                whatsappEnabled: settings.notifications.whatsappEnabled ?? true,
                visitor: {
                    email: settings.notifications.visitor?.email ?? true,
                    whatsapp: settings.notifications.visitor?.whatsapp ?? true,
                },
                employee: {
                    email: settings.notifications.employee?.email ?? true,
                    whatsapp: settings.notifications.employee?.whatsapp ?? true,
                },
                appointment: {
                    email: settings.notifications.appointment?.email ?? true,
                    whatsapp: settings.notifications.appointment?.whatsapp ?? true,
                },
            });
        }
    }, [settings]);

    const handleToggle = (path: string) => {
        const keys = path.split(".");
        const currentValue = keys.length === 1 ? config[keys[0]] : config[keys[0]][keys[1]];

        if (currentValue) {
            setModal({ isOpen: true, path });
        } else {
            executeToggle(path);
        }
    };

    const executeToggle = (path: string) => {
        const keys = path.split(".");
        setConfig((prev: any) => {
            if (keys.length === 1) return { ...prev, [keys[0]]: !prev[keys[0]] };
            return {
                ...prev,
                [keys[0]]: { ...prev[keys[0]], [keys[1]]: !prev[keys[0]][keys[1]] }
            };
        });
    };

    const handleSave = async () => {
        try {
            await updateSettings({ notifications: config }).unwrap();
            toast.success("Notification settings updated successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update notification settings");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#3882a5]" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full px-1 pt-4 sm:pt-6 text-foreground">
            <ProfileLayout>
                {() => (
                    <div className="space-y-6 pb-12">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 border-b-2 border-[#3882a5] w-fit mb-2">
                                Notification Center
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Configure how you and your visitors receive updates across different channels.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MasterSwitchCard 
                                title="Email (SMTP)" 
                                description="Master switch for all email alerts" 
                                checked={config.emailEnabled} 
                                isEnabled={config.emailEnabled}
                                onChange={() => handleToggle("emailEnabled")} 
                            />
                            <MasterSwitchCard 
                                title="WhatsApp" 
                                description="Master switch for WhatsApp messages" 
                                checked={config.whatsappEnabled} 
                                isEnabled={config.whatsappEnabled}
                                onChange={() => handleToggle("whatsappEnabled")} 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <NotificationCard 
                                title="Visitor Alerts" 
                                description="Check-in, Check-out, and Entry passes" 
                                type="visitor" 
                                config={config} 
                                onToggle={handleToggle} 
                            />
                            <NotificationCard 
                                title="Employee Alerts" 
                                description="Welcome emails and account updates" 
                                type="employee" 
                                config={config} 
                                onToggle={handleToggle} 
                            />
                            <NotificationCard 
                                title="Appointments" 
                                description="Booking confirmation and status changes" 
                                type="appointment" 
                                config={config} 
                                onToggle={handleToggle} 
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 mt-8">
                            <ActionButton
                                onClick={handleSave}
                                disabled={isUpdating}
                                variant="primary"
                                size="xl"
                                className="min-w-[200px] shadow-lg shadow-[#3882a5]/20 transition-all active:scale-[0.98]"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </ActionButton>
                        </div>

                        <ConfirmationDialog 
                            open={modal.isOpen} 
                            onOpenChange={(open) => setModal(prev => ({ ...prev, isOpen: open }))}
                            title="Turn off notifications?"
                            description="Turning this off may result in missing important updates and time-sensitive alerts."
                            confirmText="Yes, turn off"
                            cancelText="Keep enabled"
                            onConfirm={() => executeToggle(modal.path)}
                            variant="warning"
                        />
                    </div>
                )}
            </ProfileLayout>
        </div>
    );
}
