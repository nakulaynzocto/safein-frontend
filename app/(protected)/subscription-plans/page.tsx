"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi";
import { useGetSafeinProfileQuery } from "@/store/api/safeinProfileApi";
import { Skeleton } from "@/components/ui/skeleton";
import { getTaxSplit } from "@/utils/invoiceHelpers";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/utils/helpers";

export default function SubscriptionPlansPage() {
    const { data, isLoading, error } = useGetAllSubscriptionPlansQuery({ isActive: true });
    const { data: safeinProfile } = useGetSafeinProfileQuery();
    const { user } = useAppSelector((state) => state.auth);

    const plans: ISubscriptionPlan[] = data?.data?.plans || [];
    const companyDetails = safeinProfile?.data?.companyDetails;

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Subscription Plans</h1>
                        <p className="text-muted-foreground text-sm">
                            View and compare all available plans for this account.
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex gap-4 overflow-x-auto pb-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="w-[280px] flex-none space-y-4 p-4 sm:w-[320px]">
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-10 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && error && (
                    <Card>
                        <CardContent className="py-6">
                            <p className="text-sm text-red-500">
                                Failed to load subscription plans. Please try again later.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && (
                    <div className="scrollbar-thin scrollbar-thumb-brand scrollbar-track-transparent flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">
                        {plans.map((plan) => (
                            <div key={plan._id} className="w-[280px] flex-none snap-center py-2 sm:w-[320px]">
                                <Card
                                    className={`relative h-full transition-all duration-300 ${plan.isPopular ? "border-brand border-2 shadow-lg" : "hover:shadow-md"}`}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                                            <Badge className="bg-brand px-3 py-1 text-xs text-white shadow-sm">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-brand text-lg font-semibold">{plan.name}</CardTitle>
                                        {plan.description && (
                                            <CardDescription className="mt-1 line-clamp-2 h-8 text-xs">
                                                {plan.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <div className="space-y-0.5 text-center">
                                            <div className="text-2xl font-bold">₹{Math.round(plan.totalAmount || plan.amount)}</div>
                                            {(plan.totalAmount || 0) > plan.amount && (() => {
                                                const gstAmount = (plan.totalAmount || 0) - plan.amount;
                                                const taxSplit = getTaxSplit(
                                                    gstAmount,
                                                    plan.taxPercentage || 0,
                                                    user?.address,
                                                    companyDetails?.state,
                                                    companyDetails?.country
                                                );

                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">(Incl. GST)</div>
                                                        <div className="flex flex-col items-center text-[9px] text-gray-400 border-t border-gray-100 pt-1 w-24">
                                                            <div className="flex justify-between w-full">
                                                                <span>Base:</span>
                                                                <span>{formatCurrency(plan.amount, plan.currency)}</span>
                                                            </div>
                                                            {taxSplit.components.map((comp, idx) => (
                                                                <div key={idx} className="flex justify-between w-full">
                                                                    <span>{comp.label}:</span>
                                                                    <span>{formatCurrency(comp.amount, plan.currency)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <div className="text-muted-foreground text-[10px]">
                                                {plan.planType === "free"
                                                    ? "Card verification - 3 Days Trial"
                                                    : `per ${plan.planType.replace("ly", "")}`}
                                            </div>
                                            {plan.trialDays && plan.trialDays > 0 && (
                                                <div className="text-[10px] text-green-600">
                                                    {plan.trialDays} days trial
                                                </div>
                                            )}
                                        </div>

                                        <div className="scrollbar-hide min-h-[80px] space-y-1.5 overflow-y-auto pr-1">
                                            {plan.features?.slice(0, 10).map((feature, index) => (
                                                <div
                                                    key={index}
                                                    className="text-muted-foreground flex items-start text-[10px]"
                                                >
                                                    <span className="text-brand mr-2">•</span>
                                                    <span className="leading-tight">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            disabled
                                            size="sm"
                                            className={`mt-1 h-8 w-full text-xs ${plan.isPopular ? "bg-brand hover:bg-brand-strong text-white" : ""}`}
                                        >
                                            Current UI View Only
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
