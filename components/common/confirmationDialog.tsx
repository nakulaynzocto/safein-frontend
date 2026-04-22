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
                return <AlertCircle className="h-6 w-6 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-6 w-6 text-amber-500" />;
            default:
                return <Info className="h-6 w-6 text-accent" />;
        }
    };

    const getIconBg = () => {
        switch (variant) {
            case "destructive":
                return "bg-red-50";
            case "warning":
                return "bg-amber-50";
            default:
                return "bg-accent/10";
        }
    };

    const confirmBtnClass = cn(
        "rounded-2xl text-white font-bold shadow-sm transition-all active:scale-[0.98] text-sm",
        variant === "destructive" || variant === "warning"
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-accent hover:bg-accent/90"
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[92vw] sm:max-w-[480px] rounded-3xl border-none shadow-2xl bg-white p-0 gap-0 overflow-hidden"
            >
                {/* Body */}
                <div className="relative px-6 pt-7 pb-5 text-center">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                    >
                        <X size={16} />
                    </button>

                    <div className={cn(
                        "mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                        getIconBg()
                    )}>
                        {getIcon()}
                    </div>

                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-[17px] font-black text-gray-900 text-center tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription asChild className="text-gray-500 text-center text-[13px] leading-relaxed">
                            <div>{description}</div>
                        </DialogDescription>
                    </DialogHeader>

                    {disabled && disabledMessage && (
                        <div className="mt-3 rounded-xl border border-yellow-100 bg-yellow-50/50 p-2.5 text-[11px] text-yellow-800 text-center font-medium">
                            {disabledMessage}
                        </div>
                    )}
                    {children && <div className="mt-3">{children}</div>}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-3 bg-gray-50/60 border-t border-gray-100">
                    {hasSecondary ? (
                        /**
                         * 3-button layout:
                         *  Row 1: [Book Appointment] — full width, primary CTA
                         *  Row 2: [Stay Here]  [Auto-fill & Review] — equal halves
                         */
                        <div className="flex flex-col gap-2 w-full">
                            <Button
                                type="button"
                                onClick={handleConfirm}
                                disabled={disabled}
                                className={cn("w-full h-11", confirmBtnClass)}
                            >
                                {confirmText}
                            </Button>
                            <div className="flex gap-2 w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleCancel}
                                    className="flex-1 h-10 rounded-2xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-semibold text-sm transition-all"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSecondary}
                                    className="flex-1 h-10 rounded-2xl border-accent/30 text-accent hover:bg-accent/5 font-bold text-sm transition-all"
                                >
                                    {secondaryActionText}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /**
                         * 2-button layout: [Cancel] [Confirm] side by side, right-aligned
                         */
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                                className="h-10 rounded-2xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-semibold text-sm px-6 transition-all"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirm}
                                disabled={disabled}
                                className={cn("h-10 px-8", confirmBtnClass)}
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
