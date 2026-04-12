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
    if (!type) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {type === "both" ? "Configure email or WhatsApp" : "Configuration required"}
                    </DialogTitle>
                    <DialogDescription className="text-left text-sm leading-relaxed">
                        {type === "smtp" && (
                            <>
                                Custom <strong className="text-foreground">SMTP</strong> is not configured. Email
                                invites will not be delivered until you verify your mail server settings.
                            </>
                        )}
                        {type === "whatsapp" && (
                            <>
                                <strong className="text-foreground">WhatsApp (Meta Cloud API)</strong> is not
                                verified for your workspace. Mobile invites are sent via WhatsApp — complete setup
                                first.
                            </>
                        )}
                        {type === "both" && (
                            <>
                                At least one delivery channel must be set up before you can proceed. Configure{" "}
                                <strong className="text-foreground">SMTP</strong> (email) and/or{" "}
                                <strong className="text-foreground">WhatsApp</strong> (Meta Cloud API).
                            </>
                        )}
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
                    {type === "both" ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full sm:w-auto"
                            >
                                <Link href={routes.privateroute.SETTINGS_SMTP} onClick={onClose}>
                                    SMTP settings
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                className="w-full bg-[#3882a5] text-white hover:bg-[#2d6a87] sm:w-auto"
                                asChild
                            >
                                <Link href={routes.privateroute.SETTINGS_WHATSAPP} onClick={onClose}>
                                    WhatsApp settings
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            asChild
                            className="w-full bg-[#3882a5] text-white hover:bg-[#2d6a87] sm:w-auto"
                        >
                            <Link
                                href={
                                    type === "smtp"
                                        ? routes.privateroute.SETTINGS_SMTP
                                        : routes.privateroute.SETTINGS_WHATSAPP
                                }
                                onClick={onClose}
                            >
                                Open {type === "smtp" ? "SMTP" : "WhatsApp"} settings
                            </Link>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
