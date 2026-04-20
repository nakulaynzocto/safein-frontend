"use client";

import { Zap, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetWalletBalanceQuery } from "@/store/api/walletApi";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { routes } from "@/utils/routes";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { RechargeWalletModal } from "./RechargeWalletModal";

export function CreditBalancePill({ forceShow = false }: { forceShow?: boolean }) {
    const router = useRouter();
    const [isRechargeOpen, setIsRechargeOpen] = useState(false);
    const { data: settings } = useGetSettingsQuery();
    const { data: walletData, isLoading } = useGetWalletBalanceQuery(undefined, {
        pollingInterval: 60000,
        skip: !forceShow && !settings?.voiceCall?.enabled,
    });

    const isVoiceEnabled = settings?.voiceCall?.enabled ?? false;
    if (!forceShow && !isVoiceEnabled) return null;

    const balance = walletData?.balance ?? 0;
    const isLow = !isLoading && balance < 50;

    return (
        <>
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => setIsRechargeOpen(true)}
                            className={cn(
                                "group relative flex items-center h-9 pl-1 pr-3 rounded-xl transition-all duration-300",
                                "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
                                "hover:border-[#3882a5] hover:bg-white dark:hover:bg-slate-950",
                                "shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                                "active:scale-[0.98]"
                            )}
                        >
                            {/* Status Indicator Icon */}
                            <div className={cn(
                                "flex items-center justify-center size-7 rounded-lg transition-all duration-500",
                                isLow 
                                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500" 
                                    : "bg-[#3882a5]/10 text-[#3882a5]"
                            )}>
                                <Zap className={cn(
                                    "size-3.5 fill-current transition-transform duration-500 group-hover:scale-110",
                                    !isLow && !isLoading && "animate-pulse-slow"
                                )} />
                            </div>

                            {/* Balance Info */}
                            <div className="flex items-baseline gap-1.5 ml-2.5">
                                {isLoading ? (
                                    <Loader2 className="size-3 animate-spin text-[#3882a5]" />
                                ) : (
                                    <span className={cn(
                                        "text-[14px] font-bold tabular-nums tracking-tight transition-colors duration-300",
                                        isLow ? "text-amber-600 dark:text-amber-500" : "text-slate-900 dark:text-slate-100"
                                    )}>
                                        {balance.toLocaleString()}
                                    </span>
                                )}
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xs:block">
                                    Credits
                                </span>
                            </div>

                            {/* Subtle Divider */}
                            <div className="mx-2 h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800" />

                            {/* Action Icon */}
                            <Plus className="size-3.5 text-slate-400 group-hover:text-[#3882a5] transition-colors duration-300 group-hover:scale-110" />

                            {/* Mesh Gradient Glow on Hover */}
                            <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#3882a5]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
                        <div className="bg-white dark:bg-slate-950 p-4 min-w-[220px]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="size-8 rounded-full bg-[#3882a5]/10 flex items-center justify-center text-[#3882a5]">
                                    <Zap className="size-4 fill-current" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Voice Credits</h4>
                                    <p className="text-[10px] text-slate-500">Wallet balance for notifications</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] py-1.5 border-t border-slate-100 dark:border-slate-900">
                                    <span className="text-slate-500">Cost per call</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right">{walletData?.callCostPerAttempt || 5} credits</span>
                                </div>
                                <div className="flex justify-between text-[11px] py-1.5 border-t border-slate-100 dark:border-slate-900">
                                    <span className="text-slate-500">Cost per message</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right">{walletData?.smsCostPerMessage || 1} credits</span>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => {
                                    setIsRechargeOpen(true);
                                }}
                                className="w-full mt-3 py-2 px-4 bg-[#3882a5] hover:bg-[#2d6a88] text-white text-[11px] font-bold rounded-lg transition-colors shadow-lg shadow-[#3882a5]/20 active:scale-95"
                            >
                                Recharge Wallet
                            </button>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <RechargeWalletModal
                isOpen={isRechargeOpen}
                onClose={() => setIsRechargeOpen(false)}
                currentBalance={balance}
                creditRate={walletData?.creditRate}
            />
        </>
    );
}
