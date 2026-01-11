"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionButton } from "@/components/common/actionButton";
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/utils/routes";

export type StatusType = "error" | "warning" | "success" | "info";

interface StatusPageProps {
    type: StatusType;
    title: string;
    message: string;
    description?: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
        href?: string;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        href?: string;
    };
    showHomeButton?: boolean;
    showBackButton?: boolean;
    className?: string;
}

const statusConfig = {
    error: {
        icon: XCircle,
        iconColor: "text-red-600",
        iconBg: "bg-red-50",
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
        titleColor: "text-red-600",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        iconBg: "bg-yellow-50",
        borderColor: "border-yellow-200",
        bgColor: "bg-yellow-50",
        titleColor: "text-yellow-600",
    },
    success: {
        icon: CheckCircle,
        iconColor: "text-green-600",
        iconBg: "bg-green-50",
        borderColor: "border-green-200",
        bgColor: "bg-green-50",
        titleColor: "text-green-600",
    },
    info: {
        icon: AlertCircle,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        titleColor: "text-blue-600",
    },
};

export function StatusPage({
    type,
    title,
    message,
    description,
    primaryAction,
    secondaryAction,
    showHomeButton = false,
    showBackButton = false,
    className = "",
}: StatusPageProps) {
    const config = statusConfig[type];
    const Icon = config.icon;

    const renderButton = (
        action: { label: string; onClick: () => void; href?: string },
        variant: "default" | "outline" = "default",
    ) => {
        if (action.href) {
            return (
                <Link href={action.href}>
                    <ActionButton variant={variant} size="xl" className="w-full sm:w-auto">
                        {action.label}
                    </ActionButton>
                </Link>
            );
        }
        return (
            <ActionButton variant={variant} onClick={action.onClick} size="xl" className="w-full sm:w-auto">
                {action.label}
            </ActionButton>
        );
    };

    return (
        <div className={`flex min-h-screen items-center justify-center bg-gray-50 p-4 ${className}`}>
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="pb-4 text-center">
                    <div
                        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}
                    >
                        <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                    <CardTitle className={`text-xl font-bold ${config.titleColor}`}>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Main Message Box */}
                    <div className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4`}>
                        <p className={`text-sm font-medium ${config.titleColor} text-center leading-relaxed`}>
                            {message}
                        </p>
                    </div>

                    {/* Description */}
                    {description && <p className="text-center text-sm leading-relaxed text-gray-600">{description}</p>}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                        {primaryAction && renderButton(primaryAction, "default")}
                        {secondaryAction && renderButton(secondaryAction, "outline")}
                        {showHomeButton && (
                            <Link href={routes.publicroute.HOME}>
                                <ActionButton variant="outline" size="xl" className="w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </ActionButton>
                            </Link>
                        )}
                        {showBackButton && (
                            <ActionButton
                                variant="outline"
                                onClick={() => window.history.back()}
                                size="xl"
                                className="w-full sm:w-auto"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back
                            </ActionButton>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
