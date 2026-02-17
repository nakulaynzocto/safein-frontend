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

            <Card className="w-full max-w-lg overflow-hidden border-border/50 shadow-xl backdrop-blur-sm bg-background/95 relative">
                {/* Decorative top accent */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1.5 w-full",
                    isError ? "bg-red-500" : "bg-orange-500"
                )} />

                <CardHeader className="text-center pb-2 px-6 pt-10 sm:pt-12">
                    <div className={cn(
                        "mx-auto mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full shadow-sm ring-4 ring-white transition-transform hover:scale-105 duration-300",
                        isError ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    )}>
                        <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-base sm:text-lg text-gray-500 mt-3 leading-relaxed max-w-sm mx-auto">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 pb-8 sm:pb-10 px-6 sm:px-10">
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
                                        variant="default"
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
                                    variant="default"
                                    size="lg"
                                    className={cn(
                                        "w-full sm:w-auto min-w-[200px] shadow-md hover:shadow-lg transition-all h-11 sm:h-12 text-base font-medium",
                                        isError ? "bg-red-600 hover:bg-red-700" : ""
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
