"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/common/inputField";
import { Zap, Wallet, ArrowRight, Loader2, IndianRupee } from "lucide-react";
import { useCreateCheckoutOrderMutation, useVerifyPaymentMutation } from "@/store/api/walletApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

declare global {
    interface Window {
        Razorpay: any;
    }
}

async function loadRazorpayScript(src: string) {
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
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

interface RechargeWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    creditRate?: number;
}

export function RechargeWalletModal({ isOpen, onClose, currentBalance, creditRate = 1 }: RechargeWalletModalProps) {
    const [amount, setAmount] = useState<string>("500");
    const [isProcessing, setIsProcessing] = useState(false);

    const [createOrder] = useCreateCheckoutOrderMutation();
    const [verifyPayment] = useVerifyPaymentMutation();

    const numericAmount = parseFloat(amount) || 0;
    const safeCreditRate = creditRate > 0 ? creditRate : 1;
    const creditsToReceive = Math.floor(numericAmount / safeCreditRate);

    const handleRecharge = async () => {
        if (numericAmount < 100) {
            toast.error("Minimum recharge amount is ₹100");
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Load Razorpay Script
            const loaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!loaded) {
                toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
                return;
            }

            // 2. Create Order in Backend
            const orderRes = await createOrder({ amount: numericAmount }).unwrap();
            
            // 3. Configure Razorpay Options
            const options = {
                key: orderRes.keyId,
                amount: orderRes.amount,
                currency: orderRes.currency,
                name: "SafeIn Voice Credits",
                description: `Recharge for ${creditsToReceive} credits`,
                order_id: orderRes.orderId,
                prefill: {
                    email: orderRes.userEmail,
                },
                theme: {
                    color: "#3882a5",
                },
                handler: async function (response: any) {
                    try {
                        await verifyPayment({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            amount: numericAmount
                        }).unwrap();
                        
                        toast.success("Wallet recharged successfully!");
                        onClose();
                    } catch (error: any) {
                        toast.error(error?.data?.message || "Payment verification failed");
                    }
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to initiate recharge");
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-br from-[#3882a5] to-[#2d6a88] p-5 text-white relative">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
                            <Wallet className="size-4" />
                            Recharge Voice Wallet
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-[10px]">
                            Add credits for automated voice notifications.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                        <div className="space-y-0">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-white/60">Current Balance</p>
                            <p className="text-xl font-black tabular-nums">{currentBalance.toLocaleString()}</p>
                        </div>
                        <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Zap className="size-5 fill-white" />
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-4 bg-white dark:bg-slate-950">
                    <div className="space-y-3">
                        <div className="relative">
                            <InputField
                                label="RECHARGE AMOUNT (₹)"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-9 h-10 text-sm"
                            />
                            <IndianRupee className="absolute left-3 top-[34px] size-3.5 text-slate-400" />
                        </div>

                        {/* Quick Select Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {[100, 500, 1000, 2000].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(preset.toString())}
                                    className={cn(
                                        "py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                                        numericAmount === preset 
                                            ? "bg-[#3882a5] border-[#3882a5] text-white shadow-md shadow-[#3882a5]/20" 
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#3882a5] hover:text-[#3882a5]"
                                    )}
                                >
                                    ₹{preset}
                                </button>
                            ))}
                        </div>

                        {numericAmount >= 100 && (
                            <div className="rounded-xl bg-[#3882a5]/5 dark:bg-[#3882a5]/10 border border-[#3882a5]/10 p-3 animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-[#3882a5]/60 uppercase tracking-widest">You will receive</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[#3882a5]">
                                            <Zap className="size-3.5 fill-current" />
                                            <span className="text-lg font-black">{creditsToReceive.toLocaleString()} Credits</span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-950 px-2.5 py-0.5 rounded-full border border-[#3882a5]/10 shadow-sm">
                                        <span className="text-[9px] font-bold text-[#3882a5]">Rate: ₹{safeCreditRate} / Credit</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button 
                            type="button"
                            className="w-full h-11 bg-[#3882a5] hover:bg-[#2d6a88] text-white font-bold rounded-xl shadow-lg shadow-[#3882a5]/20 group transition-all"
                            onClick={handleRecharge}
                            disabled={isProcessing || numericAmount < 100}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Confirm & Pay ₹{numericAmount.toLocaleString()}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                        <p className="text-center text-[9px] text-slate-400">
                            Secure payment via Razorpay.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
