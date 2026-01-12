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
    source?: string; // Added to distinguish between admin and user subscriptions
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
    ({ subscription, user, businessProfile }, ref) => {
        if (!subscription) return null;

        const currencySymbol =
            subscription?.billingDetails?.localization?.currencySymbol ||
            businessProfile?.localization?.currencySymbol ||
            "₹";
        const primaryColor = "#3882a5"; // Brand Color (Consistent with Invoicing)

        const profile = subscription?.billingDetails;
        const companyDetails = profile?.companyDetails || {};
        const amount = subscription.amount || 0;

        return (
            <div className="flex justify-center px-2 sm:px-4">
                <div
                    ref={ref}
                    className="bg-white min-h-[1000px] w-full max-w-[800px] flex flex-col relative overflow-hidden font-sans border shadow-sm"
                >
                    {/* Header Band */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 min-h-[120px] sm:h-48 print:h-48"
                    >
                        <div className="bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center p-2 shadow-lg -mt-2">
                            {companyDetails.logo ? (
                                <img
                                    src={companyDetails.logo}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span
                                    style={{ color: primaryColor }}
                                    className="font-black text-[8px] sm:text-xs text-center leading-tight"
                                >
                                    YOUR
                                    <br />
                                    LOGO
                                </span>
                            )}
                        </div>
                        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide">
                                Invoice
                            </h1>
                            <div className="text-sm opacity-90 font-medium">
                                <p>Invoice No: INV-{subscription._id.substring(0, 8).toUpperCase()}</p>
                                <p>Date: {formatDate(subscription.startDate)}</p>
                                <p>Status: {subscription.paymentStatus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Boxes */}
                    <div className="px-8 -mt-8 grid grid-cols-2 gap-8">
                        {/* Invoice To */}
                        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-4 py-2 text-white font-bold text-sm uppercase tracking-wide"
                            >
                                Invoice To:
                            </div>
                            <div className="p-3 sm:p-4 text-slate-700 text-xs sm:text-sm space-y-1">
                                <p className="font-bold text-sm sm:text-base text-slate-900">
                                    {user?.companyName || "Client"}
                                </p>
                                <p>{user?.address?.street}</p>
                                <p>
                                    {user?.address?.city} {user?.address?.state && `, ${user?.address?.state}`} {user?.address?.pincode}
                                </p>
                                <p>{user?.email}</p>
                                <p>{user?.mobileNumber}</p>
                            </div>
                        </div>

                        {/* Billed From - Always shown for all invoices */}
                        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-4 py-2 text-white font-bold text-sm uppercase tracking-wide"
                            >
                                BILLED FROM:
                            </div>
                            <div className="p-3 sm:p-4 text-slate-700 text-xs sm:text-sm space-y-1">
                                <p className="font-bold text-sm sm:text-base text-slate-900">
                                    {companyDetails.name || "Aynzo Global Private Limited"}
                                </p>
                                {companyDetails.cin && (
                                    <p className="text-xs font-semibold text-slate-600 mb-1">
                                        CIN: {companyDetails.cin}
                                    </p>
                                )}
                                {companyDetails.gstin && (
                                    <p className="text-xs font-semibold text-slate-600 mb-1">
                                        GSTIN: {companyDetails.gstin}
                                    </p>
                                )}
                                <p>{formatAddress(companyDetails)}</p>
                                <p>{companyDetails.email}</p>
                                <p>{companyDetails.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-3 sm:p-6 md:p-8 mt-4 flex-grow">
                        <table className="w-full text-xs sm:text-sm">
                            <thead>
                                <tr
                                    className="border-b-2 text-left"
                                    style={{ borderColor: primaryColor }}
                                >
                                    <th className="py-2 font-bold text-slate-700 w-[50%]">
                                        ITEM DESCRIPTION
                                    </th>
                                    <th className="py-2 font-bold text-slate-700 text-center">
                                        QTY
                                    </th>
                                    <th className="py-2 font-bold text-slate-700 text-right">
                                        TAX
                                    </th>
                                    <th className="py-2 font-bold text-slate-700 text-right">
                                        AMOUNT
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-2 py-3 sm:px-4 sm:py-4 border-b border-slate-100 text-xs sm:text-sm">1</td>
                                    <td className="px-2 py-3 sm:px-4 sm:py-4 border-b border-slate-100">
                                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                            {typeof subscription.planId === 'object' ? subscription.planId?.name : subscription.planType} Subscription
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                            Valid from {formatDate(subscription.startDate)} to {formatDate(subscription.endDate)}
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 sm:px-4 sm:py-4 border-b border-slate-100 text-center text-slate-600 text-xs sm:text-sm">1</td>
                                    <td className="px-2 py-3 sm:px-4 sm:py-4 border-b border-slate-100 text-right text-slate-600 text-xs sm:text-sm">
                                        {subscription.taxPercentage ? `${subscription.taxPercentage}%` : "0%"}
                                        <br />
                                        <span className="text-[10px] sm:text-xs">
                                            ({subscription.taxAmount ? formatCurrency(subscription.taxAmount) : formatCurrency(0)})
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 sm:px-4 sm:py-4 border-b border-slate-100 text-right font-bold text-slate-800 text-xs sm:text-sm">
                                        {formatCurrency(amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden max-w-4xl mx-auto my-4 sm:my-8">
                            <div className="p-4 sm:p-6 md:p-8 lg:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="font-bold text-slate-600">Subtotal:</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="font-bold text-slate-600">Tax:</span>
                                    <span className="font-bold text-slate-800">{subscription.taxAmount ? formatCurrency(subscription.taxAmount) : formatCurrency(0)}</span>
                                </div>

                                <div className="flex justify-between items-center bg-yellow-300 rounded-full px-4 py-2 mt-4 shadow-sm print:bg-yellow-300 print:print-color-adjust-exact">
                                    <span className="font-black text-slate-900 uppercase text-sm">
                                        Total Paid:
                                    </span>
                                    <span className="font-black text-slate-900 text-xl">
                                        {formatCurrency(amount + (subscription.taxAmount || 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-4 sm:p-6 md:p-8 mt-auto print:print-color-adjust-exact"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                            <div>
                                <h4 className="font-bold uppercase text-xs opacity-70 mb-2">
                                    Terms & Conditions:
                                </h4>
                                <p className="text-xs opacity-90 leading-relaxed">
                                    This is a computer generated invoice and does not require signature.
                                </p>
                                {subscription.razorpayOrderId && (
                                    <p className="text-xs opacity-70 mt-4">
                                        Order ID: {subscription.razorpayOrderId}
                                    </p>
                                )}
                                {subscription.razorpayPaymentId && (
                                    <p className="text-xs opacity-70">
                                        Payment ID: {subscription.razorpayPaymentId}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold uppercase text-xs opacity-70 mb-2 underline decoration-white/30 underline-offset-4">
                                    Invoice From:
                                </h4>
                                <div className="text-sm font-medium space-y-0.5 opacity-95">
                                    <p className="font-black text-lg">{companyDetails.name || "Aynzo Global Private Limited"}</p>
                                    {companyDetails.cin && (
                                        <p className="text-xs font-semibold opacity-90">CIN: {companyDetails.cin}</p>
                                    )}
                                    {companyDetails.gstin && (
                                        <p className="text-xs font-semibold opacity-90">GSTIN: {companyDetails.gstin}</p>
                                    )}
                                    <p>{formatRegisteredAddress(companyDetails)}</p>
                                    <p>{companyDetails.email}</p>
                                    <p>{companyDetails.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

SubscriptionInvoiceTemplate.displayName = "SubscriptionInvoiceTemplate";
