import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
    key: string;
    label: string;
    mobileLabel: string;
}

interface StepIndicatorProps {
    steps: Step[];
    activeIndex: number;
    className?: string;
}

export function StepIndicator({ steps, activeIndex, className }: StepIndicatorProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* Desktop View */}
            <div className="hidden items-center sm:flex">
                {steps.map((item, idx) => {
                    const isDone = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    return (
                        <div key={item.key} className="flex flex-1 items-center">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all",
                                        isActive && "border-[#3882a5] bg-[#3882a5] text-white shadow-lg",
                                        isDone && "border-emerald-500 bg-emerald-500 text-white",
                                        !isDone && !isActive && "border-slate-300 bg-white text-slate-500"
                                    )}
                                >
                                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                                </span>
                                <span className={cn("text-sm font-semibold whitespace-nowrap", isActive ? "text-[#1f4f67]" : isDone ? "text-emerald-700" : "text-slate-500")}>
                                    {item.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={cn("mx-3 h-[2px] flex-1 rounded-full min-w-[20px]", idx < activeIndex ? "bg-emerald-400" : "bg-slate-200")} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile View */}
            <div className="flex items-center justify-between px-1 sm:hidden">
                {steps.map((item, idx) => {
                    const isDone = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    return (
                        <div key={item.key} className="flex flex-1 flex-col items-center gap-1.5 px-0.5">
                            <div 
                                className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-all",
                                    isActive && "border-[#3882a5] bg-[#3882a5] text-white shadow-md ring-2 ring-[#3882a5]/20 scale-110",
                                    isDone && "border-emerald-500 bg-emerald-500 text-white",
                                    !isDone && !isActive && "border-slate-300 bg-white text-slate-400"
                                )}
                            >
                                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                            </div>
                            <span 
                                className={cn(
                                    "text-[8px] font-bold uppercase tracking-tighter text-center line-clamp-1",
                                    isActive ? "text-[#1f4f67]" : isDone ? "text-emerald-700" : "text-slate-400"
                                )}
                            >
                                {item.mobileLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
