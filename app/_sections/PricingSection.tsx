"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star } from "lucide-react";
import { routes } from "@/utils/routes";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { formatCurrency } from "@/utils/helpers";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { setAssistantOpen, setAssistantMessage } from "@/store/slices/uiSlice";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingSection() {
    const { data: fetchedSubscriptionPlans, isLoading, error } = useGetAllSubscriptionPlansQuery({ isActive: true });
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const allPlans = fetchedSubscriptionPlans?.data?.plans || [];
    const plans = useMemo(() => {
        return (isAuthenticated && token)
            ? allPlans.filter((plan: ISubscriptionPlan) => plan.planType !== "free")
            : allPlans;
    }, [allPlans, isAuthenticated, token]);

    const handleGoToSubscriptionPlan = (plan: ISubscriptionPlan) => {
        if (plan.name === "Enterprise") {
            dispatch(setAssistantMessage(`Hi, I am interested in the ${plan.name} plan. Please help me with the setup.`));
            dispatch(setAssistantOpen(true));
            return;
        }

        if (plan.planType === "free") {
            if (!isAuthenticated || !token) {
                router.push(routes.publicroute.REGISTER);
            } else {
                router.push(routes.privateroute.DASHBOARD);
            }
        } else {
            if (!isAuthenticated || !token) {
                toast.info("Please login to purchase a plan");
                const encodedNext = encodeURIComponent(routes.publicroute.HOME + "#pricing");
                router.push(`${routes.publicroute.LOGIN}?next=${encodedNext}`);
            } else {
                setSelectedPlanId(plan._id);
                setIsUpgradeModalOpen(true);
            }
        }
    };

    if (isLoading) {
        return (
            <section id="pricing" className="bg-white py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-10 text-center">
                        <Skeleton className="h-12 w-64 mx-auto mb-4" />
                        <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 px-1">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-[500px] w-[320px] rounded-[2.5rem]" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Don't show anything if there's an error or no plans found, 
    // but maybe show a default message in development? 
    // For now, if no plans, we return null as it's better than an empty section.
    if (error || !fetchedSubscriptionPlans || plans.length === 0) {
        return null;
    }

    return (
        <section id="pricing" className="bg-white py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="mb-4 text-3xl font-black text-slate-900 sm:text-5xl uppercase tracking-tighter">
                        Pricing <span className="text-[#3882a5]">Plans</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-slate-600 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl">
                        Choose the perfect plan for your business. All plans include real-time chat, spot
                        pass, appointment links, and advanced analytics.
                    </p>
                </div>

                <div className="overflow-x-auto pb-6 pt-6">
                    <div className="mx-auto flex w-max min-w-full flex-nowrap justify-start lg:justify-center gap-8 px-1">
                        {plans.map((plan: ISubscriptionPlan) => (
                            <Card
                                key={plan._id}
                                className={`relative flex w-[300px] min-w-[300px] flex-col rounded-[2.5rem] border-2 transition-all duration-300 sm:w-[320px] sm:min-w-[320px] ${
                                    plan.isPopular
                                        ? "border-[#3882a5] shadow-[0_20px_50px_-12px_rgba(56,130,165,0.15)] ring-4 ring-[#3882a5]/5"
                                        : "border-slate-100 shadow-sm hover:border-slate-200"
                                }`}
                            >
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
                                    <Badge className="bg-[#3882a5] px-4 py-1 text-white shadow-md rounded-full border-none font-black text-[10px] uppercase tracking-widest">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="pb-8 text-center pt-10 px-6">
                                <CardTitle className="text-slate-900 text-2xl font-black uppercase tracking-tight">
                                    {plan.name}
                                </CardTitle>
                                <div className="mt-4 flex flex-col items-center">
                                    {plan.name === 'Enterprise' ? (
                                        <span className="text-slate-900 text-3xl font-black uppercase">Contact Sales</span>
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-slate-900 text-5xl font-black">
                                                    {formatCurrency(plan.amount, plan.currency)}
                                                </span>
                                                <span className="text-slate-400 font-bold text-sm">
                                                    /{plan.planType.replace("ly", "")}
                                                </span>
                                            </div>
                                            {!!plan.discountPercentage && plan.discountPercentage > 0 && (
                                                <Badge className="mt-2 bg-green-500/10 text-green-600 text-[10px] font-bold border-none uppercase tracking-widest">
                                                    SAVE {plan.discountPercentage}%
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </div>
                                <CardDescription className="text-slate-500 mt-4 font-medium px-4 line-clamp-2 min-h-[40px]">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-1 px-8 pb-10">
                                <Button
                                    className="mb-8 w-full bg-[#074463] hover:bg-[#074463]/90 text-white h-14 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] uppercase tracking-wider"
                                    onClick={() => handleGoToSubscriptionPlan(plan)}
                                >
                                    {plan.name === "Enterprise" 
                                        ? "Contact Us" 
                                        : (plan.planType === "free" ? "Start Free Trial" : "Get Started")}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>

                                <div className="space-y-4">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-start gap-3">
                                            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3882a5]/10 text-[#3882a5]">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </div>
                                            <span className="text-slate-600 text-sm font-semibold leading-tight">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <UpgradePlanModal 
                isOpen={isUpgradeModalOpen} 
                onClose={() => {
                    setIsUpgradeModalOpen(false);
                    setSelectedPlanId(null);
                }} 
                initialPlanId={selectedPlanId}
            />
        </section>
    );
}
