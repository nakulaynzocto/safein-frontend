"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    secondaryActionText?: string;
    onSecondaryAction?: () => void;
    variant?: "default" | "destructive" | "warning";
    children?: ReactNode;
    disabled?: boolean;
    disabledMessage?: string;
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    secondaryActionText,
    onSecondaryAction,
    variant = "default",
    children,
    disabled = false,
    disabledMessage,
}: ConfirmationDialogProps) {
    const hasSecondary = !!secondaryActionText;

    const handleCancel = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        onCancel?.();
        onOpenChange(false);
    }, [onCancel, onOpenChange]);

    const handleConfirm = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (!disabled) {
            onConfirm();
            onOpenChange(false);
        }
    }, [disabled, onConfirm, onOpenChange]);

    const handleSecondary = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        onSecondaryAction?.();
        onOpenChange(false);
    }, [onSecondaryAction, onOpenChange]);

    const getIcon = () => {
        switch (variant) {
            case "destructive":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            default:
                return <Info className="h-5 w-5" style={{ color: "#3882a5" }} />;
        }
    };

    const getIconBg = () => {
        switch (variant) {
            case "destructive":
                return "bg-red-50 border border-red-100";
            case "warning":
                return "bg-amber-50 border border-amber-100";
            default:
                return "border";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[92vw] sm:max-w-[460px] rounded-xl border border-border bg-white shadow-lg p-0 gap-0 overflow-hidden"
            >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-muted"
                    >
                        <X size={15} />
                    </button>

                    {/* Icon + Title row */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            getIconBg()
                        )}
                        style={variant === "default" ? { backgroundColor: "rgba(56,130,165,0.08)", borderColor: "rgba(56,130,165,0.2)" } : undefined}
                        >
                            {getIcon()}
                        </div>
                        <DialogHeader className="space-y-0 text-left flex-1">
                            <DialogTitle className="text-[15px] font-semibold leading-snug" style={{ color: "#161718" }}>
                                {title}
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    {/* Description */}
                    <DialogDescription asChild className="text-[13px] leading-relaxed" style={{ color: "#6b7280" }}>
                        <div className="pl-[3.25rem]">{description}</div>
                    </DialogDescription>

                    {disabled && disabledMessage && (
                        <div className="mt-3 ml-[3.25rem] rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-[12px] text-yellow-800 font-medium">
                            {disabledMessage}
                        </div>
                    )}
                    {children && <div className="mt-3 pl-[3.25rem]">{children}</div>}
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Footer */}
                <div className="px-6 py-4 bg-muted/30">
                    {hasSecondary ? (
                        /**
                         * 3 actions → primary CTA full-width on top,
                         * Cancel + Secondary side by side below
                         */
                        <div className="flex flex-col gap-2">
                            {/* Primary — full width */}
                            <Button
                                type="button"
                                onClick={handleConfirm}
                                disabled={disabled}
                                className={cn(
                                    "w-full h-9 rounded-lg text-[13px] font-medium text-white transition-all",
                                    variant === "destructive" || variant === "warning"
                                        ? "bg-destructive hover:bg-destructive/90"
                                        : "hover:opacity-90"
                                )}
                                style={variant === "default" ? { backgroundColor: "#074463" } : undefined}
                            >
                                {confirmText}
                            </Button>

                            {/* Cancel + Secondary — equal halves */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex-1 h-9 rounded-lg text-[13px] font-medium border-border text-foreground hover:bg-muted transition-all"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSecondary}
                                    className="flex-1 h-9 rounded-lg text-[13px] font-medium transition-all"
                                    style={{
                                        borderColor: "rgba(56,130,165,0.4)",
                                        color: "#3882a5",
                                    }}
                                >
                                    {secondaryActionText}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /**
                         * 2 actions → Cancel left, Confirm right
                         */
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="h-9 rounded-lg text-[13px] font-medium border-border text-foreground hover:bg-muted transition-all px-5"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirm}
                                disabled={disabled}
                                className={cn(
                                    "h-9 rounded-lg text-[13px] font-medium text-white px-5 transition-all",
                                    variant === "destructive" || variant === "warning"
                                        ? "bg-destructive hover:bg-destructive/90"
                                        : "hover:opacity-90"
                                )}
                                style={variant === "default" ? { backgroundColor: "#074463" } : undefined}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
