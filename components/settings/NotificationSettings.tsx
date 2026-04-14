"use client";

import { useEffect, useState, memo } from "react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/api/settingsApi";
import { ProfileLayout } from "@/components/profile/profileLayout";
import { toast } from "sonner";
import { 
    Mail, 
    MessageSquare, 
    Smartphone, 
    BellRing, 
    Settings2,
    Loader2, 
    Save 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/common/actionButton";
import { BrandSwitch } from "@/components/common/BrandSwitch";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { SettingsHeader } from "./SettingsHeader";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

// --- Sub-components (Optimized & Memoized) ---

const ChannelSettingsCard = memo(({ 
  title, 
  description, 
  icon: Icon, 
  masterKey, 
  config, 
  onToggleMaster, 
  onToggleCategory 
}: any) => {
  const isMasterOn = config[masterKey];
  const channelType = masterKey.replace('Enabled', ''); // e.g. 'email', 'whatsapp', 'sms'

  return (
    <div className={cn(
        "rounded-2xl border transition-all duration-500 overflow-hidden",
        isMasterOn 
          ? "bg-[#3882a5]/[0.02] border-[#3882a5]/20 shadow-sm" 
          : "bg-gray-50 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800 opacity-80"
      )}>
      <Collapsible open={isMasterOn}>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
              isMasterOn ? "bg-[#3882a5] text-white shadow-lg" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
            )}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{title}</h3>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BrandSwitch 
                checked={isMasterOn} 
                onCheckedChange={() => onToggleMaster(masterKey)} 
            />
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-5 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
             <SubSettingItem 
                label="Visitor Alerts" 
                subLabel="Entry/Exit passes" 
                checked={config.visitor[channelType]} 
                onChange={() => onToggleCategory(`visitor.${channelType}`)}
                disabled={!isMasterOn}
             />
             <SubSettingItem 
                label="Employee Alerts" 
                subLabel="Welcome & updates" 
                checked={config.employee[channelType]} 
                onChange={() => onToggleCategory(`employee.${channelType}`)}
                disabled={!isMasterOn}
             />
             <SubSettingItem 
                label="Appointments" 
                subLabel="Booking & Status" 
                checked={config.appointment[channelType]} 
                onChange={() => onToggleCategory(`appointment.${channelType}`)}
                disabled={!isMasterOn}
             />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});
ChannelSettingsCard.displayName = "ChannelSettingsCard";

const SubSettingItem = ({ label, subLabel, checked, onChange, disabled }: any) => (
    <div className={cn(
        "p-3 rounded-xl border transition-all flex items-center justify-between gap-4",
        checked ? "bg-white dark:bg-gray-900 border-[#3882a5]/20 shadow-sm" : "bg-gray-100/30 dark:bg-gray-800/20 border-transparent opacity-60"
    )}>
        <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{label}</p>
            <p className="text-[10px] text-gray-500 truncate">{subLabel}</p>
        </div>
        <BrandSwitch 
            checked={checked} 
            onCheckedChange={onChange} 
            disabled={disabled}
            className="scale-90"
        />
    </div>
);

// --- Main Component ---

export function NotificationSettings() {
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

    const [config, setConfig] = useState<any>({
        emailEnabled: true,
        whatsappEnabled: false,
        smsEnabled: false,
        visitor: { email: true, whatsapp: false, sms: false },
        employee: { email: true, whatsapp: false, sms: false },
        appointment: { email: true, whatsapp: false, sms: false },
    });

    const [modal, setModal] = useState({ isOpen: false, path: "" });

    useEffect(() => {
        if (settings?.notifications) {
            setConfig({
                emailEnabled: settings.notifications.emailEnabled ?? true,
                whatsappEnabled: settings.notifications.whatsappEnabled ?? false,
                smsEnabled: settings.notifications.smsEnabled ?? false,
                visitor: {
                    email: settings.notifications.visitor?.email ?? true,
                    whatsapp: settings.notifications.visitor?.whatsapp ?? false,
                    sms: settings.notifications.visitor?.sms ?? false,
                },
                employee: {
                    email: settings.notifications.employee?.email ?? true,
                    whatsapp: settings.notifications.employee?.whatsapp ?? false,
                    sms: settings.notifications.employee?.sms ?? false,
                },
                appointment: {
                    email: settings.notifications.appointment?.email ?? true,
                    whatsapp: settings.notifications.appointment?.whatsapp ?? false,
                    sms: settings.notifications.appointment?.sms ?? false,
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
                    <div className="space-y-8 pb-12">
                        <SettingsHeader
                            title="Notification Center"
                            description="Configure how you and your visitors receive updates across different channels. Toggle a master switch to enable a channel, then configure specific alerts."
                            icon={BellRing}
                        />

                        <div className="grid grid-cols-1 gap-6">
                            <ChannelSettingsCard
                                title="Email Notifications"
                                description="Send professional alerts via SMTP server"
                                icon={Mail}
                                masterKey="emailEnabled"
                                config={config}
                                onToggleMaster={handleToggle}
                                onToggleCategory={handleToggle}
                            />
                            
                            <ChannelSettingsCard
                                title="WhatsApp Messages"
                                description="Instant reach via official Meta WhatsApp API"
                                icon={MessageSquare}
                                masterKey="whatsappEnabled"
                                config={config}
                                onToggleMaster={handleToggle}
                                onToggleCategory={handleToggle}
                            />

                            <ChannelSettingsCard
                                title="SMS Alerts"
                                description="Text alerts via Twilio/Msg91 Gateway"
                                icon={Smartphone}
                                masterKey="smsEnabled"
                                config={config}
                                onToggleMaster={handleToggle}
                                onToggleCategory={handleToggle}
                            />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mt-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-800">
                                    <Settings2 size={18} className="text-[#3882a5]" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Finalize Settings</p>
                                    <p className="text-xs text-gray-500">Changes will take effect immediately after saving.</p>
                                </div>
                            </div>
                            <ActionButton
                                onClick={handleSave}
                                disabled={isUpdating}
                                variant="primary"
                                size="xl"
                                className="min-w-[160px] shadow-lg shadow-[#3882a5]/20"
                            >
                                {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
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
