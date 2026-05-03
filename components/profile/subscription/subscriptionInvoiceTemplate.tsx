import { forwardRef } from "react";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/utils/helpers";
import { formatAddress } from "@/utils/formatAddress";

interface ExtendedSubscriptionItem {
    _id?: string;
    planId: { name: string } | null | string;
    planType: string;
    planName?: string;
    amount: number;
    startDate: string;
    endDate: string;
    billingDetails?: any;
    taxAmount?: number;
    taxPercentage?: number;
    paymentStatus?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    remainingDaysFromPrevious?: number;
    source?: string;
    invoiceNumber?: string;
    discountPercentage?: number;
    discountAmount?: number;
    taxAmount?: number;
    taxSplit?: {
        components: { label: string; rate: number; amount: number }[];
        type: string;
        isIntraState: boolean;
    };
    amountInWords?: string;
    placeOfSupplyCode?: string;
}

interface SubscriptionInvoiceTemplateProps {
    subscription: ExtendedSubscriptionItem | null;
    user: any;
    businessProfile?: any;
}

export const SubscriptionInvoiceTemplate = forwardRef<
    HTMLDivElement,
    SubscriptionInvoiceTemplateProps
>(
    ({ subscription, user, businessProfile }: SubscriptionInvoiceTemplateProps, ref) => {
        if (!subscription) return null;

        const primaryColor = "#3882a5";

        const profile = subscription?.billingDetails;
        const companyDetails = profile?.companyDetails || businessProfile?.companyDetails || {};
        const amount = subscription.amount || 0;
        const discountAmount = subscription.discountAmount || 0;
        const taxAmount = subscription.taxAmount || 0;
        const totalAmount = (amount - discountAmount) + taxAmount;

        const taxSplit = subscription.taxSplit || { components: [], isIntraState: false, type: "" };

        const roundedTotal = Math.round(totalAmount);
        const roundOff = roundedTotal - totalAmount;
        const bankDetails = profile?.bankDetails || profile?.companyDetails?.bankDetails || businessProfile?.bankDetails || {};
        const hasBankDetails = !!(bankDetails?.bankName || bankDetails?.accountNumber || bankDetails?.ifscCode || bankDetails?.upiId || bankDetails?.accountHolderName);

        return (
            <div className="flex justify-center px-1 sm:px-2 print:block print:p-0">
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            background-color: white !important;
                        }
                        .print-wrapper {
                            display: flex !important;
                            justify-content: center !important;
                            align-items: flex-start !important;
                            width: 100% !important;
                            min-height: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-content {
                            width: 210mm !important;
                            margin: 0 auto !important;
                            border: none !important;
                            box-shadow: none !important;
                            transform-origin: top center;
                            transform: scale(0.95);
                        }
                    }
                ` }} />
                <div
                    ref={ref}
                    className="bg-white w-full max-w-[800px] flex flex-col relative overflow-hidden font-sans border shadow-sm print:border-0 print:shadow-none print-content"
                    style={{ minHeight: "297mm", color: "#1a202c" }}
                >
                    {/* Header Band - Matched to Screenshot */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-8 flex justify-between items-center h-48 print:h-48"
                    >
                        <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center p-3 shadow-xl">
                            {companyDetails.logo ? (
                                <img
                                    src={companyDetails.logo}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span
                                    style={{ color: primaryColor }}
                                    className="font-black text-xs text-center leading-tight uppercase"
                                >
                                    YOUR
                                    <br />
                                    LOGO
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <h1 className="text-5xl font-bold uppercase tracking-tight mb-2">
                                Invoice
                            </h1>
                            <div className="text-[13px] opacity-90 font-medium space-y-0.5">
                                <p>Invoice No: {subscription.invoiceNumber || `INV-${subscription._id?.substring(0, 8).toUpperCase() || 'NA'}`}</p>
                                <p>Date: {formatDate(subscription.startDate)}</p>
                                <p>Status: {subscription.paymentStatus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Boxes - Matched to Screenshot */}
                    <div className="px-8 grid grid-cols-2 gap-6 mt-10">
                        {/* Invoice From */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-4 py-2 text-white font-bold text-[11px] uppercase tracking-wider"
                            >
                                INVOICE FROM:
                            </div>
                            <div className="p-5 text-slate-700 text-[11px] space-y-1">
                                <p className="font-bold text-base text-slate-900 mb-1">
                                    {companyDetails.name || "Aynzo Global Private Limited"}
                                </p>
                                {companyDetails.cin && (
                                    <p className="font-semibold text-slate-500">
                                        CIN: {companyDetails.cin}
                                    </p>
                                )}
                                {companyDetails.gstin && (
                                    <>
                                        <p className="font-semibold text-slate-500">
                                            GSTIN: {companyDetails.gstin}
                                        </p>
                                        {companyDetails.gstin.length >= 12 && (
                                            <p className="font-semibold text-slate-500 uppercase">
                                                PAN: {companyDetails.gstin.substring(2, 12)}
                                            </p>
                                        )}
                                    </>
                                )}
                                <p className="leading-relaxed mt-2">{formatAddress(companyDetails)}</p>
                                <p className="font-medium text-[#3882a5]">{companyDetails.email}</p>
                                {companyDetails.phone && <p className="font-medium">{companyDetails.phone}</p>}
                            </div>
                        </div>

                        {/* Invoice To */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-4 py-2 text-white font-bold text-[11px] uppercase tracking-wider"
                            >
                                Invoice To:
                            </div>
                            <div className="p-5 text-slate-700 text-[11px] space-y-1">
                                <p className="font-bold text-base text-slate-900 mb-1">
                                    {user?.companyName || user?.name || "Client"}
                                </p>
                                <p className="leading-relaxed">{user?.address?.street || user?.address?.addressLine1}</p>
                                <p className="leading-relaxed">
                                    {user?.address?.city} {user?.address?.state && `, ${user?.address?.state}`} {user?.address?.pincode || user?.address?.postalCode}
                                </p>
                                <p className="font-medium mt-2">{user?.email}</p>
                                <p className="font-medium">{user?.mobileNumber || user?.phone}</p>
                                <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    Place of Supply: {user?.address?.state || "N/A"} ({subscription.placeOfSupplyCode || "N/A"})
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table Section - Matched to Screenshot */}
                    <div className="px-8 py-8 flex-grow">
                        <table className="w-full text-xs">
                            <thead>
                                <tr
                                    className="border-b-2 text-left"
                                    style={{ borderColor: primaryColor }}
                                >
                                    <th className="py-3 font-bold text-slate-900 w-[5%] text-left">#</th>
                                    <th className="py-3 font-bold text-slate-900 w-[55%]">ITEM DESCRIPTION</th>
                                    <th className="py-3 font-bold text-slate-900 text-center w-[20%]">SAC CODE</th>
                                    <th className="py-3 font-bold text-slate-900 text-right w-[20%]">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-6 text-slate-500 font-medium">1</td>
                                    <td className="py-6 text-slate-800">
                                        <p className="font-bold text-sm text-slate-900">
                                            {typeof subscription.planId === 'object' ? subscription.planId?.name : (subscription.planName || subscription.planType)} Subscription
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-1 italic">
                                            Valid from {formatDate(subscription.startDate)} to {formatDate(subscription.endDate)}
                                        </p>
                                    </td>
                                    <td className="py-6 text-center text-slate-600 font-bold tracking-widest">998311</td>
                                    <td className="py-6 text-right font-bold text-slate-900 text-sm">
                                        {formatCurrency(amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* GST Breakdown Table - Matched to Screenshot */}
                        <div className="mt-8 flex justify-end">
                            <div className="w-[45%]">
                                <table className="w-full text-[12px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-2 text-slate-400 font-bold uppercase text-[9px] tracking-wider">Tax Component</th>
                                            <th className="text-center py-2 text-slate-400 font-bold uppercase text-[9px] tracking-wider">Rate</th>
                                            <th className="text-right py-2 text-slate-400 font-bold uppercase text-[9px] tracking-wider">Tax Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="border-b border-dashed border-slate-100">
                                            <td className="py-2 text-slate-500 font-bold">Subtotal:</td>
                                            <td className="py-2 text-center text-slate-500">-</td>
                                            <td className="py-2 text-right text-slate-900 font-bold">{formatCurrency(amount)}</td>
                                        </tr>
                                        {subscription.discountPercentage && subscription.discountPercentage > 0 ? (
                                            <tr className="border-b border-dashed border-slate-100 text-emerald-600">
                                                <td className="py-2 font-bold italic">Discount ({subscription.discountPercentage}%):</td>
                                                <td className="py-2 text-center">-</td>
                                                <td className="py-2 text-right font-bold">- {formatCurrency(discountAmount)}</td>
                                            </tr>
                                        ) : null}
                                        {taxSplit.components.map((comp: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-2 text-slate-600 font-semibold uppercase text-[10px]">{comp.label}</td>
                                                <td className="py-2 text-center text-slate-500 font-bold">{comp.rate}%</td>
                                                <td className="py-2 text-right text-slate-900 font-bold">{formatCurrency(comp.amount)}</td>
                                            </tr>
                                        ))}
                                        {Math.abs(roundOff) > 0.01 && (
                                            <tr className="border-t border-slate-100 italic">
                                                <td className="py-2 text-slate-400 font-semibold">Round Off</td>
                                                <td className="py-2 text-center">-</td>
                                                <td className="py-2 text-right text-slate-500 font-bold">{formatCurrency(roundOff)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Total Amount Band - Matched to Screenshot */}
                                <div className="flex justify-between items-center bg-gray-900 rounded-xl px-4 py-3 mt-4 shadow-lg print:bg-gray-900 print:print-color-adjust-exact">
                                    <span className="font-black text-white uppercase text-[10px] tracking-widest">
                                        Total Paid:
                                    </span>
                                    <span className="font-black text-white text-xl">
                                        {formatCurrency(roundedTotal)}
                                    </span>
                                </div>

                                <div className="mt-4 text-right">
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-1">Amount in Words:</p>
                                    <p className="text-[11px] font-bold text-slate-800 leading-tight italic">{subscription.amountInWords}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Band - Matched to Screenshot */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-8 mt-auto print:print-color-adjust-exact"
                    >
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold uppercase text-[10px] opacity-60 tracking-wider mb-1">
                                        Governance Note:
                                    </h4>
                                    <p className="text-[10px] opacity-90 leading-relaxed italic">
                                        This is an electronically generated document. No physical signature is required for authentication.
                                    </p>
                                </div>
                                {(subscription.razorpayOrderId || subscription.razorpayPaymentId) && (
                                    <div className="text-[9px] font-bold opacity-50 space-y-1 border-t border-white/20 pt-3 uppercase tracking-widest">
                                        {subscription.razorpayOrderId && <p>Order Ref: {subscription.razorpayOrderId}</p>}
                                        {subscription.razorpayPaymentId && <p>Network ID: {subscription.razorpayPaymentId}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                {hasBankDetails && bankDetails && (
                                    <div className="space-y-1">
                                        <h4 className="font-bold uppercase text-[10px] opacity-60 tracking-wider mb-2 underline decoration-white/30 underline-offset-4">
                                            Settlement Details:
                                        </h4>
                                        <div className="text-[11px] font-bold space-y-0.5 opacity-95">
                                            {bankDetails.accountHolderName && (
                                                <p className="text-[10px] mb-1 opacity-80 uppercase tracking-tight">{bankDetails.accountHolderName}</p>
                                            )}
                                            <p className="font-bold text-base mb-1">{bankDetails.bankName}</p>
                                            <p><span className="opacity-60 text-[9px] uppercase font-black mr-2">A/C</span> {bankDetails.accountNumber}</p>
                                            <p><span className="opacity-60 text-[9px] uppercase font-black mr-2">IFSC</span> {bankDetails.ifscCode}</p>
                                            <p><span className="opacity-60 text-[9px] uppercase font-black mr-2">Node</span> {bankDetails.branchName}</p>
                                            {bankDetails.upiId && (
                                                <p className="mt-1"><span className="opacity-60 text-[9px] uppercase font-black mr-2">UPI</span> {bankDetails.upiId}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

SubscriptionInvoiceTemplate.displayName = "SubscriptionInvoiceTemplate";

export default SubscriptionInvoiceTemplate;
