"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Employee, useUpdateEmployeeMutation } from "@/store/api/employeeApi";
import { User, Mail, Phone, Building, MessageSquare, PhoneCall, Bell, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatName, getInitials } from "@/utils/helpers";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { LoadingSpinner } from "@/components/common/loadingSpinner";

interface EmployeeSettingsDialogProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeSettingsDialog({ employee, open, onOpenChange }: EmployeeSettingsDialogProps) {
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [settings, setSettings] = useState({
        email: true,
        whatsapp: true,
        sms: true,
        call: true,
    });

    useEffect(() => {
        if (employee?.notificationSettings) {
            setSettings({
                email: employee.notificationSettings.email ?? true,
                whatsapp: employee.notificationSettings.whatsapp ?? true,
                sms: employee.notificationSettings.sms ?? true,
                call: employee.notificationSettings.call ?? true,
            });
        }
    }, [employee]);

    if (!employee) return null;

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            await updateEmployee({
                id: employee._id,
                notificationSettings: settings,
            }).unwrap();
            showSuccessToast("Notification settings updated successfully");
            onOpenChange(false);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to update settings");
        }
    };

    const notificationOptions = [
        {
            id: "email",
            label: "Email Notifications",
            description: "Receive visitor arrival alerts via email",
            icon: <Mail className="h-5 w-5 text-blue-500" />,
            enabled: settings.email,
        },
        {
            id: "whatsapp",
            label: "WhatsApp Alerts",
            description: "Real-time updates delivered to your WhatsApp",
            icon: <MessageSquare className="h-5 w-5 text-green-500" />,
            enabled: settings.whatsapp,
        },
        {
            id: "sms",
            label: "SMS Notifications",
            description: "Traditional text messages for instant alerts",
            icon: <Phone className="h-5 w-5 text-amber-500" />,
            enabled: settings.sms,
        },
        {
            id: "call",
            label: "Voice Call Notification",
            description: "Automated call when a visitor arrives",
            icon: <PhoneCall className="h-5 w-5 text-purple-500" />,
            enabled: settings.call,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden p-0 border-none bg-background/80 backdrop-blur-xl shadow-2xl">
                <div className="relative h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                    <div className="absolute -bottom-10 left-6">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                            <AvatarImage src={employee.photo} alt={employee.name} />
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {getInitials(formatName(employee.name) || employee.name)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="pt-12 px-6 pb-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {formatName(employee.name)}
                                {employee.isVerified && (
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                )}
                            </h2>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                <Building className="h-4 w-4" />
                                {formatName(employee.department)} • {formatName(employee.designation || "Employee")}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Details</div>
                            <div className="text-sm font-medium">{employee.phone}</div>
                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary/80">
                            <Bell className="h-4 w-4" />
                            Notification Preferences
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {notificationOptions.map((option) => (
                                <div 
                                    key={option.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                        option.enabled 
                                            ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10" 
                                            : "bg-muted/30 border-transparent"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${option.enabled ? "bg-background shadow-sm" : "bg-muted"}`}>
                                            {option.icon}
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label htmlFor={option.id} className="font-semibold cursor-pointer">
                                                {option.label}
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground leading-tight">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch 
                                        id={option.id} 
                                        checked={option.enabled}
                                        onCheckedChange={() => handleToggle(option.id as any)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-xs text-muted-foreground italic">
                            * Settings apply specifically to {formatName(employee.name)} notifications.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isUpdating} className="min-w-[120px]">
                                {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
