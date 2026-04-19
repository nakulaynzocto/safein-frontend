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
                return <AlertCircle className="h-6 w-6 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-6 w-6 text-red-500" />;
            default:
                return <Info className="h-6 w-6 text-[#3882a5]" />;
        }
    };

    const getIconBg = () => {
        switch (variant) {
            case "destructive":
            case "warning":
                return "bg-red-50";
            default:
                return "bg-[#3882a5]/10";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[380px] rounded-3xl border-none shadow-2xl bg-white p-0 gap-0 overflow-hidden">
                <div className="relative p-5 text-center">
                    <button 
                        onClick={handleCancel}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className={cn(
                        "mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 scale-100 hover:scale-110",
                        getIconBg()
                    )}>
                        {getIcon()}
                    </div>
                    
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-lg font-black text-gray-900 text-center tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription asChild className="text-gray-500 text-center text-[13px] leading-relaxed px-2">
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

                <DialogFooter className="flex flex-row gap-2.5 p-4 bg-gray-50/80 border-t border-gray-100/50">
                    <Button 
                        variant="ghost" 
                        onClick={handleCancel} 
                        className="flex-1 h-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-bold transition-all text-sm"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={disabled}
                        className={cn(
                            "flex-1 h-10 rounded-xl text-white font-bold shadow-md transition-all active:scale-95 text-sm",
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
