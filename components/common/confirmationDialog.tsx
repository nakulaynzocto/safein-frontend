"use client";

import type { ReactNode } from "react";
import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
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
    variant = "default",
    children,
    disabled = false,
    disabledMessage,
}: ConfirmationDialogProps) {
    const handleCancel = useCallback(() => {
        onCancel?.();
        onOpenChange(false);
    }, [onCancel, onOpenChange]);

    const handleConfirm = useCallback(() => {
        if (!disabled) {
            onConfirm();
            onOpenChange(false);
        }
    }, [disabled, onConfirm, onOpenChange]);

    const getIcon = () => {
        switch (variant) {
            case "destructive":
                return <AlertCircle className="h-8 w-8 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-8 w-8 text-red-500" />;
            default:
                return <Info className="h-8 w-8 text-blue-500" />;
        }
    };

    const getIconBg = () => {
        switch (variant) {
            case "destructive":
            case "warning":
                return "bg-red-50";
            default:
                return "bg-blue-50";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl bg-white p-0 overflow-hidden">
                <div className="p-6 text-center">
                    <div className={cn(
                        "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                        getIconBg()
                    )}>
                        {getIcon()}
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-center mt-2">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    {disabled && disabledMessage && (
                        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 text-left">
                            {disabledMessage}
                        </div>
                    )}
                    {children && <div className="mt-4">{children}</div>}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 p-6 bg-gray-50/50 border-t border-gray-100">
                    <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        className="w-full sm:flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-colors"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={disabled}
                        className={cn(
                            "w-full sm:flex-1 h-12 rounded-xl text-white font-semibold shadow-lg transition-all active:scale-[0.98]",
                            variant === "destructive" || variant === "warning" 
                                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                                : "bg-[#3882a5] hover:bg-[#2d6a87] shadow-[#3882a5]/20"
                        )}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
