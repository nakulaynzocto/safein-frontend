"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetAvailableAddonsQuery, useCreateAddonRazorpayCheckoutMutation, useVerifyAddonPaymentMutation } from "@/store/api/userSubscriptionApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { Loader2, Plus, Users, Calendar, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

interface AddonPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: 'employee' | 'appointment' | 'spotPass';
    addonType?: 'employee' | 'appointment' | 'spotPass';
    message?: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function AddonPurchaseModal({ isOpen, onClose, type, addonType, message }: AddonPurchaseModalProps) {
    const activeType = type || addonType;
    const { data: addonsData, isLoading: addonsLoading } = useGetAvailableAddonsQuery();
    const [createCheckout] = useCreateAddonRazorpayCheckoutMutation();
    const [verifyPayment] = useVerifyAddonPaymentMutation();
    const [isProcessing, setIsProcessing] = useState(false);

    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);

    const filteredAddons = addonsData?.data?.filter(addon => !activeType || addon.type === activeType) || [];

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async (addonId: string) => {
        try {
            setIsProcessing(true);
            const res = await loadRazorpayScript();

            if (!res) {
                showErrorToast("Razorpay SDK failed to load. Are you online?");
                setIsProcessing(false);
                return;
            }

            const orderResponse = await createCheckout({ addonId }).unwrap();

            if (orderResponse.success) {
                const { orderId, amount, currency, keyId, userEmail } = orderResponse.data;

                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency,
                    name: "Aynzo Visitor System",
                    description: "Subscription Add-on Purchase",
                    order_id: orderId,
                    handler: async function (response: any) {
                        try {
                            const verifyResult = await verifyPayment({
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                addonId,
                            }).unwrap();

                            if (verifyResult.success) {
                                showSuccessToast("Add-on purchase successful! Your limits have been updated.");
                                onClose();
                            }
                        } catch (err) {
                            showErrorToast("Payment verification failed.");
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                    prefill: {
                        email: userEmail,
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false);
                        },
                    },
                    theme: {
                        color: "#0f172a",
                    },
                };

                // Close Dialog before opening Razorpay to prevent overlay conflicts
                onClose();

                // Small delay to ensure Dialog is fully closed
                setTimeout(() => {
                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();
                }, 100);
            }
        } catch (error: any) {
            showErrorToast(error.data?.message || "Failed to initiate purchase");
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Purchase Extra Limits</DialogTitle>
                    {message && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-2 border border-red-100 flex items-start gap-2">
                            <ShieldAlert className="h-5 w-5 shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}
                    <DialogDescription className={message ? "mt-2" : ""}>
                        Buy add-on packages to increase your {activeType || 'resource'} limits instantly.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isEmployee ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900 text-lg">Admin Access Required</p>
                                <p className="text-sm text-gray-500 max-w-[300px]">
                                    Only administrators can purchase extra limits or upgrade the plan. Please contact your manager.
                                </p>
                            </div>
                            <Button variant="outline" onClick={onClose} className="mt-4">
                                Close
                            </Button>
                        </div>
                    ) : addonsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredAddons.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredAddons.map((addon) => (
                                <div
                                    key={addon._id}
                                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                            {addon.type === 'employee' ? <Users className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{addon.name}</p>
                                            <p className="text-xs text-gray-500">{addon.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">₹{addon.amount}</p>
                                        <Button
                                            size="sm"
                                            onClick={() => handlePurchase(addon._id)}
                                            disabled={isProcessing}
                                            className="mt-1"
                                        >
                                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-gray-500 underline">No add-ons available for this category.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
