import { useRef, forwardRef } from "react";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/utils/helpers";

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

        const profile =
            subscription?.billingDetails; // REMOVED fallback to businessProfile as per user request

        // Fallback to default/dummy data if neither exists (though one should)
        const companyDetails = profile?.companyDetails || {};
        const bankDetails = profile?.bankDetails || {};
        const name = companyDetails.name || "SafeIn Security";
        const address = companyDetails.address || "";
        const email = companyDetails.email || "";
        const phone = companyDetails.phone || "";
        const website = companyDetails.website || "";
        const logoUrl = companyDetails.logo || "/images/logo.png";

        const bankName = bankDetails.bankName || "";
        const accountName = bankDetails.accountName || "";
        const accountNumber = bankDetails.accountNumber || "";
        const ifscCode = bankDetails.ifsc || "";

        const amount = subscription.amount || 0;

        // Logic: Show Bank Details only if Admin Assigned, otherwise just Company Details
        const showBankDetails = subscription.source === 'admin' && bankDetails.bankName;

        return (
            <div className="flex justify-center">
                <div
                    ref={ref}
                    className="bg-white min-h-[1000px] w-[800px] flex flex-col relative overflow-hidden font-sans border shadow-sm"
                >
                    {/* Header Band */}
                    <div
                        style={{ backgroundColor: primaryColor }}
                        className="text-white p-8 flex justify-between items-start h-48 print:h-48"
                    >
                        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center p-2 shadow-lg -mt-2">
                            {companyDetails.logo ? (
                                <img
                                    src={companyDetails.logo}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span
                                    style={{ color: primaryColor }}
                                    className="font-black text-xs text-center leading-tight"
                                >
                                    YOUR
                                    <br />
                                    LOGO
                                </span>
                            )}
                        </div>
                        <div className="text-right space-y-2">
                            <h1 className="text-3xl font-bold uppercase tracking-wide">
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
                            <div className="p-4 text-slate-700 text-sm space-y-1">
                                <p className="font-bold text-base text-slate-900">
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

                        {/* Billed From (Conditionally Pay To) */}
                        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                            <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-4 py-2 text-white font-bold text-sm uppercase tracking-wide"
                            >
                                {showBankDetails ? "Pay To / Billed From:" : "Billed From:"}
                            </div>
                            <div className="p-4 text-slate-700 text-sm space-y-1">
                                {/* Always show Company Details First */}
                                <p className="font-bold text-base text-slate-900">
                                    {companyDetails.name || "Company Name"}
                                </p>
                                <p>{companyDetails.address || "Company Address"}</p>
                                <p>{companyDetails.email}</p>
                                <p>{companyDetails.phone}</p>

                                {/* Conditionally Append Bank Details separator if Admin Assigned */}
                                {showBankDetails && (
                                    <>
                                        <div className="my-3 border-t border-dashed border-slate-300"></div>
                                        <p className="font-semibold text-slate-900 mb-1">Bank Details:</p>
                                        <p>
                                            <span className="font-bold">Bank:</span> {bankDetails.bankName}
                                        </p>
                                        <p>
                                            <span className="font-bold">A/C:</span> {bankDetails.accountNumber}
                                        </p>
                                        <p>
                                            <span className="font-bold">IFSC:</span> {bankDetails.ifscCode}
                                        </p>
                                        <p>
                                            <span className="font-bold">Holder:</span> {bankDetails.accountHolderName}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-8 mt-4 flex-grow">
                        <table className="w-full text-sm">
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
                                    <td className="py-3 pr-2 text-slate-800 font-medium">
                                        <p className="font-bold">
                                            {typeof subscription.planId === 'object' ? subscription.planId?.name : subscription.planType} Subscription
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Valid from {formatDate(subscription.startDate)} to {formatDate(subscription.endDate)}
                                        </p>
                                    </td>
                                    <td className="py-3 text-center text-slate-600">1</td>
                                    <td className="py-3 text-right text-slate-600">
                                        {subscription.taxPercentage ? `${subscription.taxPercentage}%` : "0%"}
                                        <br />
                                        <span className="text-xs">
                                            ({subscription.taxAmount ? formatCurrency(subscription.taxAmount) : formatCurrency(0)})
                                        </span>
                                    </td>
                                    <td className="py-3 text-right font-bold text-slate-800">
                                        {formatCurrency(amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="flex justify-end mt-8">
                            <div className="w-1/2 space-y-2">
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
                        className="text-white p-8 mt-auto print:print-color-adjust-exact"
                    >
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold uppercase text-xs opacity-70 mb-2">
                                    Terms & Conditions:
                                </h4>
                                <p className="text-xs opacity-90 leading-relaxed">
                                    This is a computer generated invoice and does not require signature.
                                </p>
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold uppercase text-xs opacity-70 mb-2 underline decoration-white/30 underline-offset-4">
                                    Invoice From:
                                </h4>
                                <div className="text-sm font-medium space-y-0.5 opacity-95">
                                    <p className="font-black text-lg">{companyDetails.name}</p>
                                    <p>{companyDetails.email}</p>
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
