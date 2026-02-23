
import { useRef, forwardRef } from "react";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/utils/helpers";
import { formatAddress, formatRegisteredAddress } from "@/utils/formatAddress";

interface ExtendedSubscriptionItem {
    _id: string;
    planId: { name: string } | null | string;
    planType: string;
    amount: number;
    startDate: string;
    endDate: string;
    billingDetails?: any;
    taxAmount?: number;
    taxPercentage?: number;
    paymentStatus?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    purchaseDate: string;
    remainingDaysFromPrevious?: number;
    source?: string;
    invoiceNumber?: string;
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

        const currencySymbol =
            subscription?.billingDetails?.localization?.currencySymbol ||
            businessProfile?.localization?.currencySymbol ||
            "₹";
        const primaryColor = "#3882a5";

        const profile = subscription?.billingDetails;
        const companyDetails = profile?.companyDetails || {};
        const amount = subscription.amount || 0;
        const taxAmount = subscription.taxAmount || 0;
        const taxPercentage = subscription.taxPercentage || 0;
        const totalAmount = amount + taxAmount;

        const companyState = companyDetails.address?.state || companyDetails.state || 'Karnataka';
        const companyCountry = companyDetails.address?.country || companyDetails.country || 'India';

        const taxSplit = subscription.taxSplit || { components: [], isIntraState: false, type: "" };

        const roundedTotal = Math.round(totalAmount);
        const roundOff = roundedTotal - totalAmount;
        const bankDetails = profile?.companyDetails?.bankDetails || businessProfile?.bankDetails || {};
        const hasBankDetails = !!(bankDetails?.bankName || bankDetails?.accountNumber || bankDetails?.ifscCode || bankDetails?.upiId);

        return (
            <div className="flex justify-center px-1 sm:px-2">
                <div
                    ref={ref}
                    className="bg-white w-full max-w-[800px] flex flex-col relative overflow-hidden font-sans border shadow-sm print:border-0 print:shadow-none"
                    style={{ minHeight: "297mm" }}
                >
                    {/* Header Band - Compact */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-6 flex justify-between items-start h-36 print:h-36"
                    >
                        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center p-2 shadow-lg -mt-1">
                            {companyDetails.logo ? (
                                <img
                                    src={companyDetails.logo}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span
                                    style={{ color: primaryColor }}
                                    className="font-black text-[10px] text-center leading-tight"
                                >
                                    YOUR
                                    <br />
                                    LOGO
                                </span>
                            )}
                        </div>
                        <div className="text-right space-y-1">
                            <h1 className="text-2xl font-bold uppercase tracking-wide">
                                Invoice
                            </h1>
                            <div className="text-xs opacity-90 font-medium">
                                <p>Invoice No: {subscription.invoiceNumber || `INV-${subscription._id.substring(0, 8).toUpperCase()}`}</p>
                                <p>Date: {formatDate(subscription.startDate)}</p>
                                <p>Status: {subscription.paymentStatus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Boxes - Compact */}
                    <div className="px-6 grid grid-cols-2 gap-4 mt-6">
                        {/* Invoice To */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-3 py-1.5 text-white font-bold text-[10px] uppercase tracking-wide"
                            >
                                Invoice To:
                            </div>
                            <div className="p-3 text-slate-700 text-xs space-y-0.5">
                                <p className="font-bold text-sm text-slate-900">
                                    {user?.companyName || "Client"}
                                </p>
                                <p className="text-[11px]">{user?.address?.street}</p>
                                <p className="text-[11px]">
                                    {user?.address?.city} {user?.address?.state && `, ${user?.address?.state}`} {user?.address?.pincode}
                                </p>
                                <p className="text-[11px]">{user?.email}</p>
                                <p className="text-[11px]">{user?.mobileNumber}</p>
                                <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase">
                                    Place of Supply: {user.address.state} ({subscription.placeOfSupplyCode || "N/A"})
                                </p>
                            </div>
                        </div>

                        {/* Invoice From */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-3 py-1.5 text-white font-bold text-[10px] uppercase tracking-wide"
                            >
                                INVOICE FROM:
                            </div>
                            <div className="p-3 text-slate-700 text-xs space-y-0.5">
                                <p className="font-bold text-sm text-slate-900">
                                    {companyDetails.name || "Aynzo Global Private Limited"}
                                </p>
                                {companyDetails.cin && (
                                    <p className="text-[10px] font-semibold text-slate-500">
                                        CIN: {companyDetails.cin}
                                    </p>
                                )}
                                {companyDetails.gstin && (
                                    <>
                                        <p className="text-[10px] font-semibold text-slate-500">
                                            GSTIN: {companyDetails.gstin}
                                        </p>
                                        {companyDetails.gstin.length >= 12 && (
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase">
                                                PAN: {companyDetails.gstin.substring(2, 12)}
                                            </p>
                                        )}
                                    </>
                                )}
                                <p className="text-[11px]">{formatAddress(companyDetails)}</p>
                                <p className="text-[11px]">{companyDetails.email}</p>
                                {companyDetails.phone && <p className="text-[11px]">{companyDetails.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Items Table Section - Tightened */}
                    <div className="px-6 py-4 flex-grow">
                        <table className="w-full text-xs">
                            <thead>
                                <tr
                                    className="border-b border-slate-200 text-left"
                                    style={{ borderColor: primaryColor }}
                                >
                                    <th className="py-2 font-bold text-slate-700 w-[5%] text-left">#</th>
                                    <th className="py-2 font-bold text-slate-700 w-[55%]">ITEM DESCRIPTION</th>
                                    <th className="py-2 font-bold text-slate-700 text-center w-[20%]">SAC CODE</th>
                                    <th className="py-2 font-bold text-slate-700 text-right w-[20%]">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-3 text-slate-600">1</td>
                                    <td className="py-3 text-slate-800">
                                        <p className="font-bold">
                                            {typeof subscription.planId === 'object' ? subscription.planId?.name : subscription.planType} Subscription
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            Valid from {formatDate(subscription.startDate)} to {formatDate(subscription.endDate)}
                                        </p>
                                    </td>
                                    <td className="py-3 text-center text-slate-600 font-medium italic">998311</td>
                                    <td className="py-3 text-right font-bold text-slate-800">
                                        {formatCurrency(amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* GST Breakdown Table - Compact */}
                        <div className="mt-4 flex justify-end">
                            <div className="w-[45%]">
                                <table className="w-full text-[11px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-1 text-slate-400 font-bold uppercase text-[9px]">Tax Component</th>
                                            <th className="text-center py-1 text-slate-400 font-bold uppercase text-[9px]">Rate</th>
                                            <th className="text-right py-1 text-slate-400 font-bold uppercase text-[9px]">Tax Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="border-b border-dashed border-slate-100">
                                            <td className="py-1.5 text-slate-500 font-bold">Subtotal:</td>
                                            <td className="py-1.5 text-center text-slate-500">-</td>
                                            <td className="py-1.5 text-right text-slate-500 font-bold">{formatCurrency(amount)}</td>
                                        </tr>
                                        {taxSplit.components.map((comp: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-1.5 text-slate-600 font-medium">{comp.label}</td>
                                                <td className="py-1.5 text-center text-slate-500">{comp.rate}%</td>
                                                <td className="py-1.5 text-right text-slate-700 font-bold">{formatCurrency(comp.amount)}</td>
                                            </tr>
                                        ))}
                                        {Math.abs(roundOff) > 0.01 && (
                                            <tr className="border-t border-slate-100">
                                                <td className="py-1.5 text-slate-600 font-medium italic">Round Off</td>
                                                <td className="py-1.5 text-center">-</td>
                                                <td className="py-1.5 text-right text-slate-700 font-bold">{formatCurrency(roundOff)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Total Amount Band - Tightened */}
                                <div className="flex justify-between items-center bg-yellow-300 rounded-lg px-3 py-2 mt-3 shadow-none print:bg-yellow-300 print:print-color-adjust-exact">
                                    <span className="font-black text-slate-900 uppercase text-[10px]">
                                        Total Paid:
                                    </span>
                                    <span className="font-black text-slate-900 text-lg">
                                        {formatCurrency(roundedTotal)}
                                    </span>
                                </div>

                                <div className="mt-2 text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Amount in Words:</p>
                                    <p className="text-[10px] font-bold text-slate-800 leading-tight italic">{subscription.amountInWords}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Band - Compact */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-6 mt-auto print:print-color-adjust-exact"
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold uppercase text-[9px] opacity-70 mb-0.5">
                                        Terms & Conditions:
                                    </h4>
                                    <p className="text-[10px] opacity-90 leading-tight italic">
                                        This is a computer generated invoice and does not require signature.
                                    </p>
                                </div>
                                {(subscription.razorpayOrderId || subscription.razorpayPaymentId) && (
                                    <div className="text-[9px] opacity-70 space-y-0.5 border-t border-white/20 pt-1.5">
                                        {subscription.razorpayOrderId && <p>Order ID: {subscription.razorpayOrderId}</p>}
                                        {subscription.razorpayPaymentId && <p>Payment ID: {subscription.razorpayPaymentId}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                {hasBankDetails && bankDetails && (
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold uppercase text-[9px] opacity-70 mb-1 underline decoration-white/30 underline-offset-2">
                                            Bank Details:
                                        </h4>
                                        <div className="text-[11px] font-medium space-y-0 opacity-95">
                                            <p className="font-bold text-sm mb-0.5">{bankDetails.bankName}</p>
                                            <p className="leading-tight"><span className="opacity-70 text-[9px] uppercase font-bold mr-1">A/C:</span> {bankDetails.accountNumber}</p>
                                            <p className="leading-tight"><span className="opacity-70 text-[9px] uppercase font-bold mr-1">IFSC:</span> {bankDetails.ifscCode}</p>
                                            <p className="leading-tight"><span className="opacity-70 text-[9px] uppercase font-bold mr-1">Branch:</span> {bankDetails.branchName}</p>
                                            {bankDetails.upiId && (
                                                <p className="leading-tight"><span className="opacity-70 text-[9px] uppercase font-bold mr-1">UPI:</span> {bankDetails.upiId}</p>
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
