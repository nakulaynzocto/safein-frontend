"use client";

import { useRef, useState } from "react";
import { History, Eye, Printer, X } from "lucide-react";

import { formatDate, cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { SubscriptionInvoiceTemplate } from "./subscriptionInvoiceTemplate";
import { useReactToPrint } from "react-to-print";

interface SubscriptionItem {
    _id: string;
    planId: { name: string } | null;
    planType: string;
    planName?: string;
    amount: number;
    startDate: string;
    endDate: string;
    paymentStatus: "succeeded" | "pending" | "failed";
    source: string;
    taxAmount?: number;
    taxPercentage?: number;
    billingDetails?: any;
    purchaseDate: string;
    remainingDaysFromPrevious: number;
    currency?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    subscriptionId: string;
}

interface SubscriptionHistoryTableProps {
    data: SubscriptionItem[];
    isLoading: boolean;
    currentPage: number;
    onPageChange: (page: number) => void;
    // Assuming we can get total pages from API or parent logic, default to 1 if not
    totalPages?: number;
    user?: any;
}

export const SubscriptionHistoryTable = ({
    data,
    isLoading,
    currentPage,
    onPageChange,
    totalPages = 1,
    user,
}: SubscriptionHistoryTableProps) => {
    const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionItem | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: selectedInvoice ? `Invoice-${selectedInvoice._id}` : "Invoice",
    });

    const handleViewInvoice = (item: SubscriptionItem) => {
        setSelectedInvoice(item);
        setIsViewOpen(true);
    };

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

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <History className="text-gray-500" size={20} />
                    Subscription History
                </h4>
                <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                        No subscription history found
                    </p>
                </div>
            </div>
        );
    }

    const columns = [
        {
            header: "Plan",
            className: "px-2 py-3 text-left align-top w-[20%]",
            cell: (item: SubscriptionItem) => (
                <div className="flex flex-col min-w-[100px]">
                    <span className="font-bold text-gray-900 capitalize text-xs hover:text-clip overflow-hidden">
                        {item.planName || item.planType}
                    </span>
                    {item.amount === 0 && (
                        <span className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 leading-tight">
                            Manual
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Start",
            className: "px-2 py-3 text-left align-top whitespace-nowrap w-[12%]",
            cell: (item: SubscriptionItem) => (
                <span className="text-gray-500 text-[11px] font-bold">
                    {formatDate(item.startDate)}
                </span>
            ),
        },
        {
            header: "Expires",
            className: "px-2 py-3 text-left align-top whitespace-nowrap w-[12%]",
            cell: (item: SubscriptionItem) => (
                <span className="text-gray-500 text-[11px] font-bold">
                    {formatDate(item.endDate)}
                </span>
            ),
        },
        {
            header: "Status",
            className: "px-2 py-3 text-left align-top whitespace-nowrap w-[15%]",
            cell: (item: SubscriptionItem) => (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-900 capitalize">
                    <div
                        className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.paymentStatus === "succeeded"
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                : item.paymentStatus === "pending"
                                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
                        )}
                    />
                    {item.paymentStatus}
                </span>
            ),
        },
        {
            header: "Amt",
            className: "px-2 py-3 text-right align-top whitespace-nowrap w-[10%]",
            cell: (item: SubscriptionItem) => (
                <span className="font-bold text-gray-900 text-xs">
                    {item.amount !== null && item.amount !== undefined
                        ? item.amount > 0
                            ? formatCurrency(item.amount)
                            : "Free"
                        : "-"}
                </span>
            ),
        },
        {
            header: "Tax",
            className: "px-2 py-3 text-right align-top whitespace-nowrap w-[10%]",
            cell: (item: SubscriptionItem) => (
                <span className="font-medium text-gray-500 text-xs">
                    {item.taxAmount && item.taxAmount > 0 ? formatCurrency(item.taxAmount) : "-"}
                </span>
            ),
        },
        {
            header: "Action",
            className: "px-2 py-3 text-center align-top w-[11%]",
            cell: (item: SubscriptionItem) => (
                <div className="flex items-center justify-center">
                    {item.paymentStatus === "succeeded" && (
                        <button
                            onClick={() => handleViewInvoice(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="View Invoice"
                        >
                            <Eye size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 tracking-tight">
                    <History className="text-gray-500" size={20} />
                    Subscription History
                </h4>

                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-left min-w-[600px] sm:min-w-full">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                                <tr>
                                    {columns.map((col, index) => (
                                        <th key={index} className={col.className}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {data.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        {columns.map((col, index) => (
                                            <td key={index} className={col.className}>
                                                {col.cell(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="border-t border-gray-200 pt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) onPageChange(currentPage - 1);
                                        }}
                                        className={
                                            currentPage === 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>

                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    if (
                                        totalPages > 7 &&
                                        Math.abs(page - currentPage) > 2 &&
                                        page !== 1 &&
                                        page !== totalPages
                                    ) {
                                        if (Math.abs(page - currentPage) === 3) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }
                                        return null;
                                    }

                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={page === currentPage}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onPageChange(page);
                                                }}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) onPageChange(currentPage + 1);
                                        }}
                                        className={
                                            currentPage === totalPages
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                        <div className="text-center text-xs text-gray-500 mt-2">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent
                    className="sm:max-w-[900px] w-[98vw] max-h-[95vh] overflow-y-auto p-0 gap-0"
                    showCloseButton={false}
                >
                    <DialogHeader className="p-4 border-b border-gray-200 sticky top-0 bg-white z-50 flex flex-row items-center justify-between shadow-sm">
                        <DialogTitle className="text-xl font-bold">Invoice Preview</DialogTitle>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                size="sm"
                                className="gap-2 text-[#3882a5] border-[#3882a5] hover:bg-[#3882a5]/10 hover:text-[#3882a5]"
                            >
                                <Printer size={16} />
                                Print / Download
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsViewOpen(false)}
                                className="h-8 w-8 rounded-full hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-2 bg-gray-100/50 flex justify-center min-h-[600px] overflow-x-auto">
                        <div className="shadow-2xl border border-gray-200/50 bg-white">
                            <SubscriptionInvoiceTemplate
                                ref={invoiceRef}
                                subscription={selectedInvoice}
                                user={user}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
