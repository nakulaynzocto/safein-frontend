"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/api/settingsApi";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare, Phone, Save } from "lucide-react";
import { PageSkeleton } from "@/components/common/pageSkeleton";

export function SettingsPageContent() {
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

    const [emailEnabled, setEmailEnabled] = useState(true);
    const [whatsappEnabled, setWhatsappEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);

    useEffect(() => {
        if (settings) {
            setEmailEnabled(settings.notifications?.emailEnabled ?? true);
            setWhatsappEnabled(settings.notifications?.whatsappEnabled ?? true);
            setSmsEnabled(settings.notifications?.smsEnabled ?? false);
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            await updateSettings({
                notifications: {
                    emailEnabled,
                    whatsappEnabled,
                    smsEnabled,
                },
            }).unwrap();

            toast.success("Settings updated successfully!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update settings");
        }
    };

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-center">Failed to load settings</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
            <Card className="w-full">
                <CardHeader className="px-4 pt-4 pb-4 sm:px-6 sm:pt-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                        Notification Settings
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Control how you receive appointment notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
                    <div className="bg-muted/30 hover:bg-muted/50 flex flex-col items-start justify-between gap-3 rounded-lg p-3 transition-colors sm:flex-row sm:items-center sm:gap-4">
                        <div className="w-full flex-1 space-y-0.5 sm:w-auto">
                            <Label
                                htmlFor="email-enabled"
                                className="flex cursor-pointer items-center gap-2 text-sm font-medium sm:text-base"
                            >
                                <Mail className="text-primary h-4 w-4 flex-shrink-0" />
                                Email Notifications
                            </Label>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                Receive appointment notifications via email
                            </p>
                        </div>
                        <button
                            onClick={() => setEmailEnabled(!emailEnabled)}
                            className={cn(
                                "relative h-6 w-12 self-start rounded-full p-1 transition-all duration-300 sm:self-auto",
                                emailEnabled
                                    ? "bg-primary shadow-[0_0_8px_rgba(7,68,99,0.4)]"
                                    : "bg-muted border-border border",
                            )}
                        >
                            <div
                                className={cn(
                                    "h-4 w-4 rounded-full transition-all duration-300",
                                    emailEnabled
                                        ? "bg-primary-foreground translate-x-6"
                                        : "bg-muted-foreground translate-x-0",
                                )}
                            />
                        </button>
                    </div>

                    <div className="bg-muted/30 hover:bg-muted/50 flex flex-col items-start justify-between gap-3 rounded-lg p-3 transition-colors sm:flex-row sm:items-center sm:gap-4">
                        <div className="w-full flex-1 space-y-0.5 sm:w-auto">
                            <Label
                                htmlFor="whatsapp-enabled"
                                className="flex cursor-pointer items-center gap-2 text-sm font-medium sm:text-base"
                            >
                                <MessageSquare className="h-4 w-4 flex-shrink-0 text-green-600" />
                                WhatsApp Notifications
                            </Label>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                Receive notifications via WhatsApp Cloud API
                            </p>
                        </div>
                        <button
                            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                            className={cn(
                                "relative h-6 w-12 self-start rounded-full p-1 transition-all duration-300 sm:self-auto",
                                whatsappEnabled
                                    ? "bg-primary shadow-[0_0_8px_rgba(7,68,99,0.4)]"
                                    : "bg-muted border-border border",
                            )}
                        >
                            <div
                                className={cn(
                                    "h-4 w-4 rounded-full transition-all duration-300",
                                    whatsappEnabled
                                        ? "bg-primary-foreground translate-x-6"
                                        : "bg-muted-foreground translate-x-0",
                                )}
                            />
                        </button>
                    </div>

                    <div className="bg-muted/30 hover:bg-muted/50 flex flex-col items-start justify-between gap-3 rounded-lg p-3 transition-colors sm:flex-row sm:items-center sm:gap-4">
                        <div className="w-full flex-1 space-y-0.5 sm:w-auto">
                            <Label
                                htmlFor="sms-enabled"
                                className="flex cursor-pointer items-center gap-2 text-sm font-medium sm:text-base"
                            >
                                <Phone className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                SMS Notifications
                            </Label>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                Receive appointment notifications via SMS
                            </p>
                        </div>
                        <button
                            onClick={() => setSmsEnabled(!smsEnabled)}
                            className={cn(
                                "relative h-6 w-12 self-start rounded-full p-1 transition-all duration-300 sm:self-auto",
                                smsEnabled
                                    ? "bg-primary shadow-[0_0_8px_rgba(7,68,99,0.4)]"
                                    : "bg-muted border-border border",
                            )}
                        >
                            <div
                                className={cn(
                                    "h-4 w-4 rounded-full transition-all duration-300",
                                    smsEnabled
                                        ? "bg-primary-foreground translate-x-6"
                                        : "bg-muted-foreground translate-x-0",
                                )}
                            />
                        </button>
                    </div>

                    <div className="border-t pt-4">
                        <Button onClick={handleSave} disabled={isUpdating} className="w-full sm:w-auto">
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
