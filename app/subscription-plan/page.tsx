"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PublicLayout } from "@/components/layout/publicLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ISubscriptionPlan,
  useCreateCheckoutSessionMutation,
  useGetAllSubscriptionPlansQuery,
  useVerifyRazorpayPaymentMutation,
} from "@/store/api/subscriptionApi"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"
import { routes } from "@/utils/routes"
import { toast } from "sonner"
import { formatCurrency } from "@/utils/helpers"
import {
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Users,
  CreditCard,
  Lock,
  TrendingUp,
  Star,
  X,
} from "lucide-react"

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

export default function SubscriptionPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Use centralized hook for auth and subscription checks
  const {
    user,
    isAuthenticated,
    token,
    hasActiveSubscription,
    isSubscriptionLoading,
  } = useAuthSubscription()

  useEffect(() => {
    // If user has active subscription (payment succeeded and is active), redirect to dashboard
    if (!isSubscriptionLoading && hasActiveSubscription) {
      router.replace(routes.privateroute.DASHBOARD)
    }
  }, [isSubscriptionLoading, hasActiveSubscription, router])

  const {
    data: fetchedPlans,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useGetAllSubscriptionPlansQuery({ isActive: true })

  // Use single checkout route for both free and paid plans
const [createCheckoutSession, { isLoading: isCreating }] =
  useCreateCheckoutSessionMutation()
const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation()

  const plans: ISubscriptionPlan[] = fetchedPlans?.data?.plans || []

  const initialPlanIdFromQuery = searchParams.get("planId")
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize selected plan based on query or first available plan (only once)
  useEffect(() => {
    if (isLoadingPlans) return // Wait for plans to load
    
    if (plans.length === 0) return // No plans available yet

    if (isInitialized) return // Already initialized

    // Initialize plan selection
    if (initialPlanIdFromQuery && plans.some((p) => p._id === initialPlanIdFromQuery)) {
      setSelectedPlanId(initialPlanIdFromQuery)
    } else if (plans.length > 0) {
      setSelectedPlanId(plans[0]._id)
    }
    setIsInitialized(true)
  }, [isLoadingPlans, plans, initialPlanIdFromQuery, isInitialized])

  // Ensure selectedPlan is always available when plans are loaded
  const selectedPlan = useMemo(() => {
    if (!plans.length) return null
    if (selectedPlanId) {
      const found = plans.find((p) => p._id === selectedPlanId)
      if (found) return found
    }
    return plans[0] // Fallback to first plan
  }, [plans, selectedPlanId])

  const handleProceedToPayment = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan to continue.")
      return
    }

    try {
      const successUrl = `${window.location.origin}${routes.publicroute.SUBSCRIPTION_SUCCESS}`
      const cancelUrl = `${window.location.origin}${routes.publicroute.SUBSCRIPTION_CANCEL}`

      const response = await createCheckoutSession({
        planId: selectedPlan._id,
        successUrl,
        cancelUrl,
      }).unwrap()

      const razorpayLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js")
      if (!razorpayLoaded) {
        toast.error("Failed to load Razorpay. Please try again.")
        return
      }

      const options = {
        key: response.keyId,
        amount: response.amount,
        currency: response.currency || "INR",
        name: "Subscription Payment",
        description: selectedPlan.name,
        order_id: response.orderId,
        prefill: {
          email: response.userEmail,
        },
        handler: async function (rpResponse: any) {
          try {
            await verifyRazorpayPayment({
              planId: selectedPlan._id,
              orderId: rpResponse.razorpay_order_id,
              paymentId: rpResponse.razorpay_payment_id,
              signature: rpResponse.razorpay_signature,
            }).unwrap()
            router.replace(successUrl)
          } catch (verificationError: any) {
            toast.error(verificationError?.data?.message || "Payment verification failed.")
            router.replace(cancelUrl)
          }
        },
        modal: {
          ondismiss: function () {
            router.replace(cancelUrl)
          },
        },
        theme: {
          color: "#3882a5",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || "Failed to start checkout."
      toast.error(message)
    }
  }

  const isProcessing = isCreating

  // Redirect to login if not authenticated (useAuthSubscription hook handles this)
  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      router.replace(routes.publicroute.LOGIN)
    }
  }, [isAuthenticated, token, user, router])

  // Show loader while checking subscription status or loading plans
  // Also show loader if user has active subscription (will redirect to dashboard)
  if (isSubscriptionLoading || hasActiveSubscription) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto h-10 w-10 border-4 border-[#3882a5] border-t-transparent rounded-full"></div>
                <p className="text-muted-foreground text-sm">
                  {hasActiveSubscription 
                    ? 'Redirecting to dashboard...' 
                    : 'Checking subscription status...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Loading State - Only show if plans are loading and not during initial navigation */}
          {isLoadingPlans && plans.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto h-10 w-10 border-4 border-[#3882a5] border-t-transparent rounded-full"></div>
                <p className="text-muted-foreground text-sm">Loading subscription plans...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {plansError && !isLoadingPlans && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-6 text-center">
                <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-1 text-sm">Failed to load plans</p>
                <p className="text-xs text-red-500">Please try again later or contact support.</p>
              </CardContent>
            </Card>
          )}

          {/* Main Content - Compact Layout */}
          {!isLoadingPlans && !plansError && plans.length > 0 && selectedPlan && (
            <div className="space-y-3">
              {/* Page Header - Compact */}
    

              {/* Selected Plan Details - Responsive Layout */}
              <div className="grid gap-3 grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
                {/* Main Plan Details Card - Responsive */}
                <Card className="lg:col-span-2 shadow-md border border-[#3882a5]/20 order-1 lg:order-1 py-0">
                  <CardHeader className="bg-gradient-to-r from-[#3882a5]/10 to-[#4a9bc4]/10 pb-2 px-4 sm:px-6 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {selectedPlan.name}
                        </CardTitle>
                        {selectedPlan.description && (
                          <CardDescription className="text-xs sm:text-sm">
                            {selectedPlan.description}
                          </CardDescription>
                        )}
                      </div>
                      {selectedPlan.isPopular && (
                        <Badge className="bg-gradient-to-r from-[#3882a5] to-[#4a9bc4] text-white text-xs w-fit">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-3 px-4 sm:px-6 pb-3 space-y-3">
                    {/* Price Section - Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 pb-2 border-b">
                      <div className="text-3xl sm:text-4xl font-bold text-[#3882a5]">
                        {formatCurrency(selectedPlan.amount, selectedPlan.currency)}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {selectedPlan.planType === "free"
                          ? "Card verification - 3 Days Trial"
                          : `Billed ${selectedPlan.planType.replace("ly", "")}`}
                      </div>
                    </div>

                    {/* Features List - Responsive Grid */}
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#3882a5]" />
                        What&apos;s Included
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedPlan.features?.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="h-5 w-5 rounded-full bg-[#3882a5]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-[#3882a5]" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Card - Responsive */}
                <Card className="lg:col-span-1 shadow-lg border-2 border-[#3882a5]/30 bg-gradient-to-br from-white to-slate-50 order-2 lg:order-2 py-0">
                  <CardHeader className="bg-gradient-to-r from-[#3882a5] to-[#4a9bc4] text-white rounded-t-lg px-4 sm:px-6 py-2.5">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Complete Payment
                    </CardTitle>
                    <CardDescription className="text-blue-100 text-xs mt-1">
                      Secure checkout powered by Stripe
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-3 px-4 sm:px-6 pb-3 space-y-3">
                    {/* Plan Selector - Radio Buttons (Like Upgrade Modal) */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#3882a5]" />
                        Select Plan
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md px-3 py-2 bg-slate-50">
                        {plans.map((plan) => {
                          const isSelected = selectedPlanId === plan._id
                          const isFree = plan.planType === "free"
                          return (
                            <button
                              key={plan._id}
                              type="button"
                              onClick={() => setSelectedPlanId(plan._id)}
                              className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm py-2 px-2 rounded-md text-left transition ${
                                isSelected
                                  ? "bg-[#3882a5]/10 border border-[#3882a5] text-slate-900"
                                  : "hover:bg-slate-100 border border-transparent text-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-3 w-3 rounded-full border flex-shrink-0 ${
                                    isSelected
                                      ? "border-[#3882a5] bg-[#3882a5]"
                                      : "border-slate-400 bg-white"
                                  }`}
                                />
                                <div className="font-medium">
                                  {plan.name}
                                  {plan.isPopular && (
                                    <span className="ml-2 rounded-full bg-[#3882a5]/10 text-[#3882a5] px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                      Popular
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-slate-700 sm:text-right pl-5 sm:pl-0">
                                {formatCurrency(plan.amount, plan.currency)}{" "}
                                <span className="text-[11px] text-slate-500">
                                  {isFree
                                    ? "(Card verification)"
                                    : `/ ${plan.planType.replace("ly", "")}`}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You can switch to a different plan before proceeding to payment.
                      </p>
                    </div>

                    {/* Order Summary - Compact */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium text-sm">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-base text-[#3882a5]">
                          {formatCurrency(selectedPlan.amount, selectedPlan.currency)}
                        </span>
                      </div>
                      {selectedPlan.planType === "free" && (
                        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>3 Days Trial Period</span>
                          <span className="font-medium">Non-refundable</span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button - Compact */}
                    <Button
                      className="w-full bg-gradient-to-r from-[#3882a5] to-[#4a9bc4] hover:from-[#2d6a87] hover:to-[#3882a5] text-white font-semibold py-4 text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleProceedToPayment}
                      disabled={isProcessing || !selectedPlanId}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Continue to Payment
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    {/* Security Badge - Compact */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <Lock className="h-3.5 w-3.5" />
                      <span>256-bit SSL encryption</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
