"use client";

import { useState } from "react";
import { History, Zap, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import { formatDate, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination";
import { WalletTransaction } from "@/store/api/walletApi";

interface CreditTransactionsTableProps {
    data: WalletTransaction[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    activeTab: "all" | "recharge" | "usage";
    onTypeChange: (type: "all" | "recharge" | "usage") => void;
    title?: string;
    description?: string;
}

export const CreditTransactionsTable = ({
    data,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    activeTab,
    onTypeChange,
    title = "Credit Wallet History",
    description = "View your voice call deductions and wallet recharges.",
}: CreditTransactionsTableProps) => {

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // Removed client-side filteredData logic - server now handles it
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                        <Zap className="text-blue-500" size={20} />
                        {title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                
                {/* Filters */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit border border-gray-200/60">
                    <button
                        onClick={() => onTypeChange("all")}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                            activeTab === "all" ? "bg-white text-[#3882a5] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => onTypeChange("recharge")}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                            activeTab === "recharge" ? "bg-white text-[#3882a5] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Recharges
                    </button>
                    <button
                        onClick={() => onTypeChange("usage")}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                            activeTab === "usage" ? "bg-white text-[#3882a5] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Usage / Deductions
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left min-w-[600px] sm:min-w-full">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-3 w-[15%]">Date</th>
                                <th className="px-3 py-3 w-[15%]">Type</th>
                                <th className="px-3 py-3 w-[40%]">Description</th>
                                <th className="px-3 py-3 text-right">Amount</th>
                                <th className="px-3 py-3 text-right">Credits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {hasData ? (
                                data.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-3 text-[11px] font-bold text-gray-500">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                item.type === 'recharge' 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : item.type === 'usage'
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                            )}>
                                                {item.type === 'recharge' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                <span className="capitalize">{item.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-xs font-semibold text-gray-800">{item.description}</span>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <span className={cn(
                                                "text-xs font-bold",
                                                item.type === 'recharge' ? "text-emerald-600" : "text-gray-600"
                                            )}>
                                                {item.type === 'recharge' ? "+" : ""}{item.amount ? formatCurrency(item.amount) : "₹0.00"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold",
                                                item.type === 'recharge' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                            )}>
                                                {item.type === 'recharge' ? "+" : "-"}{item.credits || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-3 py-12 text-center bg-gray-50/30">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <History className="w-8 h-8 text-gray-300" />
                                            <p className="text-gray-500 font-medium text-sm">
                                                No {activeTab !== "all" ? activeTab : ""} transactions found.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t border-gray-200 pt-4 px-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            hasNextPage={currentPage < totalPages}
                            hasPrevPage={currentPage > 1}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
