"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, X } from "lucide-react"
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan, useCreateCheckoutSessionMutation, useVerifyRazorpayPaymentMutation } from "@/store/api/subscriptionApi"
import { useAppSelector } from "@/store/hooks"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { routes } from "@/utils/routes"
import { formatCurrency } from "@/utils/helpers"

declare global {
  interface Window {
    Razorpay: any
  }
}

async function loadRazorpayScript(src: string) {
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRegistrationFlow?: boolean; // Flag to indicate if this is during registration
}

export function PricingModal({ open, onOpenChange, isRegistrationFlow = false }: PricingModalProps) {
  const { data: fetchedSubscriptionPlans, isLoading } = useGetAllSubscriptionPlansQuery({ isActive: true });
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to subscribe');
      router.push(routes.publicroute.LOGIN);
      return;
    }

    try {
      const successUrl = `${window.location.origin}${routes.publicroute.SUBSCRIPTION_SUCCESS}`;
      const cancelUrl = `${window.location.origin}${routes.publicroute.SUBSCRIPTION_CANCEL}`;

      const response = await createCheckoutSession({
        planId,
        successUrl,
        cancelUrl,
      }).unwrap();

      const loaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) {
        toast.error('Failed to load Razorpay. Please try again.');
        return;
      }

      const options = {
        key: response.keyId,
        amount: response.amount,
        currency: response.currency || "INR",
        name: "Subscription Payment",
        description: "Plan purchase",
        order_id: response.orderId,
        prefill: {
          email: response.userEmail,
        },
        handler: async function (rpResponse: any) {
          try {
            await verifyRazorpayPayment({
              planId,
              orderId: rpResponse.razorpay_order_id,
              paymentId: rpResponse.razorpay_payment_id,
              signature: rpResponse.razorpay_signature,
            }).unwrap();
            window.location.href = successUrl;
          } catch (verificationError: any) {
            toast.error(verificationError?.data?.message || 'Payment verification failed.');
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

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to initiate checkout. Please try again.');
    }
  };

  const plans = fetchedSubscriptionPlans?.data?.plans?.filter(
    (plan: ISubscriptionPlan) => plan.planType !== 'free'
  ) || [];

  const displayPlans = plans.slice(0, 3);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        if (isRegistrationFlow && !open) {
          return;
        }
        onOpenChange(open);
      }}
    >
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
        showCloseButton={!isRegistrationFlow}
        onInteractOutside={(e) => {
          if (isRegistrationFlow) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isRegistrationFlow) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">Choose Your Subscription Plan</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Select a plan to get started. After payment, you'll be redirected to your dashboard.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">Loading plans...</p>
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">No plans available</p>
          </div>
        ) : (
          <div className={`grid gap-6 mt-6 ${displayPlans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : displayPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
            {displayPlans.map((plan: ISubscriptionPlan) => (
              <Card
                key={plan._id}
                className={`relative ${plan.isPopular ? 'border-2 border-brand shadow-lg scale-105' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 text-white bg-brand">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-brand">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    {plan.discountPercentage && plan.discountPercentage > 0 ? (
                      <div className="mb-2">
                        <span className="text-lg line-through text-gray-400">
                          {formatCurrency(plan.amount / (1 - plan.discountPercentage / 100), plan.currency)}
                        </span>
                        <Badge className="ml-2 bg-green-500 text-white">
                          {plan.discountPercentage}% OFF
                        </Badge>
                      </div>
                    ) : null}
                    <span className="text-4xl font-bold text-brand-strong">
                      {formatCurrency(plan.amount, plan.currency)}
                    </span>
                    <div className="mt-2">
                      <span className="text-gray-500">
                        per {plan.planType.replace('ly', '')}
                      </span>
                    </div>
                    {plan.monthlyEquivalent && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="text-gray-400">Effective: </span>
                        <span className="font-semibold text-brand-strong">
                          {formatCurrency(plan.monthlyEquivalent, plan.currency)}/month
                        </span>
                      </div>
                    )}
                  </div>
                  {plan.description && (
                    <CardDescription className="text-base mt-4 text-accent">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 mr-3 text-brand-strong flex-shrink-0" />
                        <span className="text-sm text-accent">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full ${plan.isPopular ? 'text-white bg-brand' : ''}`}
                    variant={plan.isPopular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={isCreatingSession}
                  >
                    {isCreatingSession ? 'Processing...' : 'Subscribe Now'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Remove cancel button - user must select a plan */}
      </DialogContent>
    </Dialog>
  );
}

