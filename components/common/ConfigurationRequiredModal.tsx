"use client";

import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { routes } from "@/utils/routes";
import { useGetSettingsQuery } from "@/store/api/settingsApi";

interface ConfigurationRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "smtp" | "whatsapp" | "both" | null;
}

export function ConfigurationRequiredModal({
    isOpen,
    onClose,
    type,
}: ConfigurationRequiredModalProps) {
    const { data: settings } = useGetSettingsQuery();
    
    if (!type) return null;

    const emailDisabled = settings?.notifications?.emailEnabled === false;
    const whatsappDisabled = settings?.notifications?.whatsappEnabled === false;

    const getTitle = () => {
        if (type === "both") return "Delivery channels restricted";
        if (type === "smtp") return "Email channel disabled";
        if (type === "whatsapp") return "WhatsApp channel disabled";
        return "Configuration required";
    };

    const getDescription = () => {
        if (type === "smtp") {
            return "Email notifications have been restricted for your workspace. Please contact your system administrator or enable this channel in settings to proceed.";
        }
        if (type === "whatsapp") {
            return "WhatsApp notifications have been restricted for your workspace. Please contact your system administrator or enable this channel in settings to proceed.";
        }
        return "At least one delivery channel (Email or WhatsApp) must be enabled before you can proceed. Please check your workspace notification settings.";
    };

    const getPrimaryAction = () => {
        return { label: "General Settings", href: routes.privateroute.SETTINGS_CONTROLS };
    };

    const action = getPrimaryAction();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {getTitle()}
                    </DialogTitle>
                    <DialogDescription className="text-left text-sm leading-relaxed">
                        {getDescription()}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        Close
                    </Button>
                    
                    <Button
                        type="button"
                        asChild
                        className="w-full bg-[#3882a5] text-white hover:bg-[#2d6a87] sm:w-auto"
                    >
                        <Link href={action.href} onClick={onClose}>
                            {action.label}
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
