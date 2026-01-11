"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi";
import { useCreateCheckoutSessionMutation, useVerifyRazorpayPaymentMutation } from "@/store/api/subscriptionApi";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/helpers";

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
    const { data, isLoading } = useGetAllSubscriptionPlansQuery({ isActive: true });
    const [createCheckoutSession, { isLoading: isCreating }] = useCreateCheckoutSessionMutation();
    const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();

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
            ? formatCurrency(Math.min(...paidPlans.map((p) => p.amount)), paidPlans[0].currency || "INR")
            : null;

    const handleUpgradeClick = async () => {
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
                        onClose();
                        window.location.href = successUrl;
                    } catch (verificationError: any) {
                        toast.error(verificationError?.data?.message || "Payment verification failed.");
                        onClose();
                        window.location.href = cancelUrl;
                    }
                },
                modal: {
                    ondismiss: function () {
                        onClose();
                        window.location.href = cancelUrl;
                    },
                },
                theme: {
                    color: "#3882a5",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
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
                    {!isLoading && startingPriceText && (
                        <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                            Paid plans start from <span className="font-semibold">{startingPriceText}</span>.
                        </div>
                    )}

                    {!isLoading && paidPlans.length > 0 && (
                        <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border bg-slate-50 px-3 py-2">
                            {paidPlans.map((plan) => {
                                const isSelected = selectedPlanId === plan._id;
                                return (
                                    <button
                                        key={plan._id}
                                        type="button"
                                        onClick={() => setSelectedPlanId(plan._id)}
                                        className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs transition sm:text-sm ${isSelected
                                                ? "bg-brand/10 border-brand border text-slate-900"
                                                : "border border-transparent text-slate-800 hover:bg-slate-100"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-3 w-3 rounded-full border ${isSelected ? "border-brand bg-brand" : "border-slate-400 bg-white"
                                                    }`}
                                            />
                                            <div className="font-medium">
                                                {plan.name}
                                                {plan.isPopular && (
                                                    <span className="bg-brand/10 text-brand ml-2 rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase">
                                                        Popular
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-slate-700">
                                            {formatCurrency(plan.amount, plan.currency)}{" "}
                                            <span className="text-[11px] text-slate-500">
                                                / {plan.planType.replace("ly", "")}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {isLoading && <div className="text-muted-foreground text-xs">Loading plans...</div>}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={isCreating} className="h-12 rounded-xl px-6">
                            Cancel
                        </Button>
                        <Button onClick={handleUpgradeClick} disabled={isCreating || !selectedPlanId} className="h-12 rounded-xl px-8">
                            {isCreating ? "Processing..." : "Upgrade Now"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
