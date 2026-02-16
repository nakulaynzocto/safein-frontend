"use client";

import { useState } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LucideIcon } from "lucide-react";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { cn } from "@/lib/utils";

interface ModuleAccessDeniedProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "error" | "warning";
    buttonLabel?: string;
    containerHeight?: string;
}

export function ModuleAccessDenied({
    title,
    description,
    icon: Icon = ShieldAlert,
    variant = "error",
    buttonLabel = "View Plans",
    containerHeight = "h-[70vh]"
}: ModuleAccessDeniedProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isError = variant === "error";

    return (
        <div className={cn("flex w-full items-center justify-center p-4", containerHeight)}>
            <Card className="w-full max-w-lg overflow-hidden border-dashed">
                <CardHeader className="text-center pb-2 px-6 pt-8">
                    <div className={cn(
                        "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                        isError ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    )}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
                    <CardDescription className="text-base text-gray-500 mt-2">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pb-8">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto min-w-[150px]"
                        onClick={() => setShowUpgradeModal(true)}
                    >
                        {buttonLabel}
                    </Button>
                </CardFooter>
            </Card>
            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </div>
    );
}
