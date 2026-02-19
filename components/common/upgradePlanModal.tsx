"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan, useCreateCheckoutSessionMutation, useVerifyRazorpayPaymentMutation } from "@/store/api/subscriptionApi";
import { useGetSafeinProfileQuery } from "@/store/api/safeinProfileApi";
import { toast } from "sonner";
import { formatCurrency, isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useAppSelector } from "@/store/hooks";
import { ShieldAlert } from "lucide-react";
import { getTaxSplit } from "@/utils/invoiceHelpers";

declare global {
    interface Window {
        Razorpay: any;
    }
}

async function loadRazorpayScript(src: string) {
    return new Promise<boolean>((resolve) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    // Check if user is an employee - employees cannot purchase subscriptions
    const isEmployee = checkIsEmployee(user);
    const { data, isLoading } = useGetAllSubscriptionPlansQuery({ isActive: true });
    const { data: safeinProfile } = useGetSafeinProfileQuery();
    const [createCheckoutSession, { isLoading: isCreating }] = useCreateCheckoutSessionMutation();
    const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();

    const companyDetails = safeinProfile?.data?.companyDetails;

    const plans: ISubscriptionPlan[] = data?.data?.plans || [];
    const paidPlans = plans.filter((plan) => plan.planType !== "free");

    // Selected plan in the modal. Start with no selection, then auto-select first paid plan when data loads.
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    useEffect(() => {
        // If we have paid plans and nothing selected yet, auto-select the first plan
        if (!isLoading && paidPlans.length > 0 && !selectedPlanId) {
            setSelectedPlanId(paidPlans[0]._id);
        }
    }, [isLoading, paidPlans, selectedPlanId]);

    const startingPriceText =
        paidPlans.length > 0
            ? formatCurrency(Math.min(...paidPlans.map((p) => p.totalAmount || p.amount)), paidPlans[0].currency || "INR")
            : null;

    const handleUpgradeClick = async () => {
        // Block employees from purchasing subscriptions
        if (isEmployee) {
            toast.error("Employees cannot purchase subscriptions. Your access is managed by your administrator.");
            return;
        }

        try {
            if (!selectedPlanId) {
                toast.error("Please select a plan to continue.");
                return;
            }

            const successUrl = `${window.location.origin}${routes.publicroute.SUBSCRIPTION_SUCCESS}`;
            const cancelUrl = `${window.location.origin}${routes.publicroute.SUBSCRIPTION_CANCEL}`;

            const response = await createCheckoutSession({
                planId: selectedPlanId,
                successUrl,
                cancelUrl,
            }).unwrap();

            const loaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!loaded) {
                toast.error("Failed to load Razorpay. Please try again.");
                return;
            }

            const options = {
                key: response.keyId,
                amount: response.amount,
                currency: response.currency || "INR",
                name: "Subscription Payment",
                description: "Plan upgrade",
                order_id: response.orderId,
                prefill: {
                    email: response.userEmail,
                },
                handler: async function (rpResponse: any) {
                    try {
                        await verifyRazorpayPayment({
                            planId: selectedPlanId,
                            orderId: rpResponse.razorpay_order_id,
                            paymentId: rpResponse.razorpay_payment_id,
                            signature: rpResponse.razorpay_signature,
                        }).unwrap();
                        window.location.href = successUrl;
                    } catch (verificationError: any) {
                        toast.error(verificationError?.data?.message || "Payment verification failed.");
                        window.location.href = cancelUrl;
                    }
                },
                modal: {
                    ondismiss: function () {
                        window.location.href = cancelUrl;
                    },
                },
                theme: {
                    color: "#3882a5",
                },
            };

            // Close Dialog before opening Razorpay to prevent overlay conflicts
            onClose();

            // Small delay to ensure Dialog is fully closed
            setTimeout(() => {
                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }, 100);
        } catch (error: any) {
            const message = error?.data?.message || error?.message || "Failed to start checkout.";
            toast.error(message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Upgrade Your Plan</DialogTitle>
                    <DialogDescription className="text-sm">
                        You&apos;ve reached your trial limit. Please upgrade to a paid plan to continue using full
                        features.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {isEmployee ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900 text-lg">Admin Access Required</p>
                                <p className="text-sm text-gray-500 max-w-[300px]">
                                    Only administrators can purchase subscriptions or upgrade plans. Please contact your manager.
                                </p>
                            </div>
                            <Button variant="outline" onClick={onClose} className="mt-4 h-11 px-8 rounded-xl">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!isLoading && startingPriceText && (
                                <div className="rounded-md border border-[#3882a5]/20 bg-[#3882a5]/5 px-4 py-3 text-sm text-[#074463]">
                                    Paid plans start from <span className="font-semibold">{startingPriceText}</span>.
                                </div>
                            )}

                            {!isLoading && paidPlans.length > 0 && (
                                <div className="space-y-4">
                                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border bg-slate-50 px-3 py-2">
                                        {paidPlans.map((plan) => {
                                            const isSelected = selectedPlanId === plan._id;
                                            return (
                                                <button
                                                    key={plan._id}
                                                    type="button"
                                                    onClick={() => setSelectedPlanId(plan._id)}
                                                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs transition sm:text-sm ${isSelected
                                                        ? "bg-[#3882a5]/10 border-[#3882a5] border text-slate-900"
                                                        : "border border-transparent text-slate-800 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`h-3 w-3 rounded-full border ${isSelected ? "border-[#3882a5] bg-[#3882a5]" : "border-slate-400 bg-white"
                                                                }`}
                                                        />
                                                        <div className="font-medium">
                                                            {plan.name}
                                                            {plan.isPopular && (
                                                                <span className="bg-[#3882a5]/10 text-[#3882a5] ml-2 rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase">
                                                                    Popular
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-700">
                                                        {formatCurrency(plan.totalAmount || plan.amount, plan.currency)}{" "}
                                                        <span className="text-[11px] text-slate-500">
                                                            / {plan.planType.replace("ly", "")}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* GST Breakdown for selected plan */}
                                    {selectedPlanId && (() => {
                                        const selectedPlan = paidPlans.find(p => p._id === selectedPlanId);
                                        if (!selectedPlan) return null;

                                        const baseAmount = selectedPlan.amount;
                                        const totalAmount = selectedPlan.totalAmount || selectedPlan.amount;
                                        const gstAmount = totalAmount - baseAmount;
                                        const taxSplit = getTaxSplit(
                                            gstAmount,
                                            selectedPlan.taxPercentage || 0,
                                            user?.address,
                                            companyDetails?.state,
                                            companyDetails?.country
                                        );

                                        return (
                                            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex justify-between text-[11px] text-slate-600">
                                                    <span>Base Price:</span>
                                                    <span>{formatCurrency(baseAmount, selectedPlan.currency)}</span>
                                                </div>
                                                {taxSplit.components.map((comp, idx) => (
                                                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                                                        <span>{comp.label} ({comp.rate}%):</span>
                                                        <span>+ {formatCurrency(comp.amount, selectedPlan.currency)}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1 font-bold text-slate-900 text-xs uppercase tracking-tight">
                                                    <span>Total Payable:</span>
                                                    <span>{formatCurrency(totalAmount, selectedPlan.currency)}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {isLoading && <div className="text-muted-foreground text-xs">Loading plans...</div>}

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button variant="outline" onClick={onClose} disabled={isCreating} className="h-12 rounded-xl px-6">
                                    Cancel
                                </Button>
                                <Button onClick={handleUpgradeClick} variant="primary" disabled={isCreating || !selectedPlanId} className="h-12 rounded-xl px-8">
                                    {isCreating ? "Processing..." : "Upgrade Now"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
