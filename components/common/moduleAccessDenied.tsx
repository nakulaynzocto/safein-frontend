"use client";

import { useState } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LucideIcon } from "lucide-react";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { AddonPurchaseModal } from "@/components/common/AddonPurchaseModal";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { cn } from "@/lib/utils";

interface ModuleAccessDeniedProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "error" | "warning";
    buttonLabel?: string;
    containerHeight?: string;
    addonType?: 'employee' | 'appointment' | 'spotPass';
    addonButtonLabel?: string;
    isExpired?: boolean;
}

export function ModuleAccessDenied({
    title,
    description,
    icon: Icon = ShieldAlert,
    variant = "error",
    buttonLabel = "Upgrade Plan",
    containerHeight = "min-h-[60vh]",
    addonType,
    addonButtonLabel = "Buy Extra Limits",
    isExpired = false
}: ModuleAccessDeniedProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);

    const isError = variant === "error";

    // If it's just a limit reach (not expired), and we have an addon, 
    // we might want the addon button to be primary or the first choice.
    // BUT only if NOT an employee
    const showAddonAction = !!addonType && !isExpired && !isEmployee;

    return (
        <div className={cn(
            "flex w-full items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in duration-500",
            containerHeight
        )}>
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
            </div>

            <Card className="w-full max-w-2xl overflow-hidden border-border/50 shadow-xl backdrop-blur-sm bg-background/95 relative">
                {/* Decorative top accent */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1.5 w-full",
                    isError ? "bg-primary" : "bg-accent"
                )} />

                <CardHeader className="text-center pb-2 px-6 pt-6 sm:pt-8">
                    <div className={cn(
                        "mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-sm ring-4 ring-white transition-transform hover:scale-105 duration-300",
                        isError ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    )}>
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-base sm:text-lg text-gray-500 mt-2 leading-relaxed max-w-xl mx-auto">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 pb-6 sm:pb-8 px-6 sm:px-10">
                    {isEmployee ? (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full">
                            <p className="text-sm text-gray-600 italic text-center flex items-center justify-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-gray-400" />
                                Please contact your administrator to increase limits or renew subscription.
                            </p>
                        </div>
                    ) : (
                        <>
                            {showAddonAction ? (
                                <>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[160px] shadow-md hover:shadow-lg transition-all h-11 sm:h-12 text-base"
                                        onClick={() => setShowAddonModal(true)}
                                    >
                                        {addonButtonLabel}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[160px] h-11 sm:h-12 text-base border-gray-300 hover:bg-gray-50"
                                        onClick={() => setShowUpgradeModal(true)}
                                    >
                                        {buttonLabel}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className={cn(
                                        "w-full sm:w-auto min-w-[200px] shadow-md hover:shadow-lg transition-all h-11 sm:h-12 text-base font-medium"
                                    )}
                                    onClick={() => setShowUpgradeModal(true)}
                                >
                                    {buttonLabel}
                                </Button>
                            )}
                        </>
                    )}
                </CardFooter>
            </Card>
            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
            <AddonPurchaseModal
                isOpen={showAddonModal}
                onClose={() => setShowAddonModal(false)}
                type={addonType}
            />
        </div>
    );
}
