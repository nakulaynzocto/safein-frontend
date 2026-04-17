"use client";

import React from "react";
import { CheckCircle2, Home, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
    title?: string;
    message?: string;
    companyName?: string;
    visitorName?: string;
    hostName?: string;
    referenceId?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: LucideIcon;
    customFooterMessage?: string;
}

export function SuccessState({
    title = "Request Sent!",
    message,
    companyName,
    visitorName,
    hostName,
    referenceId,
    actionLabel = "New Registration",
    onAction,
    icon: Icon = CheckCircle2,
    customFooterMessage = "Please wait at the reception area. You will receive a notification once your host approves."
}: SuccessStateProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 flex flex-col items-center text-center space-y-10">
                
                {/* Google Pay Style Animated Tick */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20 duration-1000" />
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-200">
                        <Icon className="h-16 w-16 text-white stroke-[3] animate-in zoom-in duration-1000" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">{title}</h2>
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-[#3882a5]" />
                    <p className="text-slate-500 font-medium px-4">
                        {message || (
                            <>
                                Your visit request has been successfully submitted to <span className="font-bold text-slate-800">{companyName || "the company"}</span>.
                            </>
                        )}
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visitor</p>
                                <p className="truncate text-sm font-bold text-slate-800">{visitorName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Host</p>
                                <p className="truncate text-sm font-bold text-slate-800">{hostName || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center sm:text-left">Reference ID</p>
                                <p className="font-mono text-[12px] font-bold text-[#3882a5] text-center sm:text-left truncate">{referenceId || "GENERATED"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-2xl border border-blue-50 bg-blue-50/50 p-4">
                            <p className="text-xs font-semibold text-blue-600 text-center">
                                {customFooterMessage}
                            </p>
                        </div>

                        {onAction && (
                            <Button 
                                onClick={onAction}
                                className="h-14 w-full rounded-2xl bg-[#3882a5] text-base font-bold text-white shadow-xl shadow-[#3882a5]/20 transition-all hover:bg-[#2d6a87] hover:-translate-y-1 active:scale-95"
                            >
                                <Home className="mr-2 h-4 w-4" /> {actionLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
