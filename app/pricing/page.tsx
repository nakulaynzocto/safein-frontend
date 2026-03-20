"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star } from "lucide-react";
import { routes } from "@/utils/routes";
import { PublicLayout } from "@/components/layout/publicLayout";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { formatCurrency } from "@/utils/helpers";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { generateStructuredData } from "@/lib/seoHelpers";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { setAssistantOpen, setAssistantMessage } from "@/store/slices/uiSlice";
import { useState, useMemo } from "react";

export default function PricingPage() {
    const pricingStructuredData = generateStructuredData("pricing");
    const { data: fetchedSubscriptionPlans, isLoading, error } = useGetAllSubscriptionPlansQuery({ isActive: true });
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    // Hide free trial for logged-in users - they already have it from registration
    // NOTE: useMemo must be called before any early returns to comply with Rules of Hooks
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
            // For free trial, send to register if not logged in, or dashboard if logged in
            if (!isAuthenticated || !token) {
                router.push(routes.publicroute.REGISTER);
            } else {
                // Already has free trial from registration, go to dashboard
                router.push(routes.privateroute.DASHBOARD);
            }
        } else {
            // For paid plans
            if (!isAuthenticated || !token) {
                // Not logged in - redirect to login first, then come back to pricing
                toast.info("Please login to purchase a plan");
                const encodedNext = encodeURIComponent(routes.publicroute.PRICING);
                router.push(`${routes.publicroute.LOGIN}?next=${encodedNext}`);
            } else {
                // User is logged in - open the upgrade modal directly
                setSelectedPlanId(plan._id);
                setIsUpgradeModalOpen(true);
            }
        }
    };

    if (isLoading) {
        return (
            <PublicLayout>
                <div className="flex min-h-screen items-center justify-center bg-white">
                    <p className="text-xl text-gray-700">Loading pricing plans...</p>
                </div>
            </PublicLayout>
        );
    }

    if (error || !fetchedSubscriptionPlans) {
        return (
            <PublicLayout>
                <div className="flex min-h-screen items-center justify-center bg-white">
                    <p className="text-xl text-red-500">Error loading pricing plans. Please try again later.</p>
                </div>
            </PublicLayout>
        );
    }

    return (
        <>
            <PageSEOHead
                title="SafeIn Pricing - Best Visitor Management System Costs India"
                description="Affordable pricing for the best visitor management system in India. Choose the right plan for your office or housing society. Start your free 3-day trial and experience professional gatekeeping today!"
                keywords={[
                    "visitor management pricing india",
                    "gatekeeper app cost india",
                    "society security management cost",
                    "safein plan prices",
                    "affordable visitor system india",
                    "subscription plans india",
                    "free trial visitor management",
                ]}
                url="https://safein.aynzo.com/pricing"
                structuredData={pricingStructuredData}
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section */}
                    <section className="bg-hero-gradient relative flex min-h-[400px] items-center pt-20 pb-12 sm:min-h-[450px] sm:px-6 sm:pt-28 md:min-h-[500px] md:pt-32">
                        <div className="container mx-auto px-4 sm:px-6 text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                Simple, Transparent Pricing
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Choose the perfect plan for your business. All plans include real-time chat, spot
                                pass, appointment links, smart notifications, bulk import, and advanced analytics with
                                a 3-day free trial.
                            </p>
                            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 px-2 text-[#3882a5] sm:gap-2 sm:px-0">
                                <Star className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                                <span className="text-sm font-semibold sm:text-base md:text-lg">4.9/5 Rating</span>
                                <span className="hidden text-gray-300 sm:inline">•</span>
                                <span className="text-sm text-gray-300 sm:text-base md:text-lg">
                                    1000+ Happy Clients
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Pricing Plans */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="scrollbar-thin scrollbar-thumb-brand scrollbar-track-transparent flex snap-x snap-mandatory gap-6 overflow-x-auto pb-12 md:justify-center">
                                {plans.map((plan: ISubscriptionPlan, index: number) => (
                                    <div key={plan._id} className="w-[300px] flex-none snap-center py-4 sm:w-[320px]">
                                        <Card
                                            className={`relative h-full transition-all duration-300 ${plan.isPopular ? "border-brand border-2 shadow-xl" : "hover:shadow-md"}`}
                                        >
                                            {plan.isPopular && (
                                                <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
                                                    <Badge className="bg-brand px-4 py-1 text-white shadow-md">
                                                        Most Popular
                                                    </Badge>
                                                </div>
                                            )}
                                            <CardHeader className="pb-4 text-center">
                                                <CardTitle className="text-brand text-2xl font-bold">
                                                    {plan.name}
                                                </CardTitle>
                                                <div className="mt-2 h-24 flex flex-col justify-center items-center">
                                                    {plan.name === 'Enterprise' ? (
                                                        <div>
                                                            <span className="text-brand-strong text-2xl font-bold">Contact Team</span>
                                                            <div className="mt-1 text-xs text-gray-500">For Custom Requirements</div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full text-center">
                                                            {!!plan.discountPercentage && plan.discountPercentage > 0 ? (
                                                                <div className="mb-1">
                                                                    <span className="text-base text-gray-400 line-through">
                                                                        {formatCurrency(
                                                                            plan.amount / (1 - plan.discountPercentage / 100),
                                                                            plan.currency,
                                                                        )}
                                                                    </span>
                                                                    <Badge className="ml-2 bg-green-500 text-[10px] text-white">
                                                                        {plan.discountPercentage}% OFF
                                                                    </Badge>
                                                                </div>
                                                            ) : null}
                                                            <span className="text-brand-strong text-3xl font-bold">
                                                                {formatCurrency(plan.amount, plan.currency)}
                                                            </span>
                                                            <div className="mt-1 text-xs">
                                                                <span className="font-medium text-gray-500">
                                                                    {plan.name === "Free" || plan.planType === "free"
                                                                        ? "Free Trial"
                                                                        : `per ${plan.planType.replace("ly", "")}`}
                                                                </span>
                                                            </div>
                                                            {!!plan.monthlyEquivalent && plan.planType !== "free" && plan.name !== "Enterprise" && (
                                                                <div className="mt-1 text-xs text-gray-600">
                                                                    <span className="text-gray-400">Effective: </span>
                                                                    <span className="text-accent font-semibold">
                                                                        {formatCurrency(plan.monthlyEquivalent, plan.currency)}
                                                                        /month
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <CardDescription className="text-muted-foreground mt-2 line-clamp-2 h-10 text-xs">
                                                    {plan.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex h-[calc(100%-160px)] flex-col pt-0">
                                                <Button
                                                    className="mb-6 w-full bg-brand hover:bg-brand-strong text-white"
                                                    variant="default"
                                                    onClick={() => handleGoToSubscriptionPlan(plan)}
                                                >
                                                    {plan.name === "Enterprise" 
                                                        ? "Contact Sales Team" 
                                                        : (plan.planType === "free" ? "Start 3 Day Trial" : "Subscribe Now")}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>

                                                <div className="scrollbar-hide flex-grow space-y-3 overflow-y-auto pr-2 max-h-[300px]">
                                                    {plan.features.map((feature, featureIndex) => (
                                                        <div key={featureIndex} className="flex items-start">
                                                            <Check className="text-brand-strong mt-0.5 mr-3 h-5 w-5 shrink-0" />
                                                            <span className="text-muted-foreground text-sm leading-tight">
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Pricing Summary */}
                    <section className="bg-white px-4 py-16">
                        <div className="container mx-auto text-center">
                            <div className="mx-auto max-w-6xl">
                                <h2 className="text-brand mb-4 text-3xl font-bold">Pricing Summary</h2>
                                <p className="text-muted-foreground mb-8 text-lg">Premium plan total cost comparison</p>
                                <div className="scrollbar-thin scrollbar-thumb-brand scrollbar-track-transparent flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 px-4 md:justify-center">
                                    {plans
                                        .filter((p) => p.planType !== "free" && p.name !== "Enterprise")
                                        .map((plan, index) => {
                                            const originalAmount =
                                                plan.amount / (1 - (plan.discountPercentage || 0) / 100);
                                            const savedAmount = originalAmount - plan.amount;
                                            return (
                                                <div
                                                    key={plan._id}
                                                    className="w-[240px] flex-none snap-center py-2 sm:w-[280px]"
                                                >
                                                    <div
                                                        className={`h-full rounded-2xl bg-white p-6 transition-all duration-300 ${plan.isPopular ? "border-brand border-2 shadow-lg" : "border-border border shadow-sm hover:shadow-md"}`}
                                                    >
                                                        <div className="text-brand-strong mb-2 text-xl font-bold">
                                                            {plan.planType === "monthly"
                                                                ? "1 Month"
                                                                : plan.planType === "quarterly"
                                                                    ? "3 Months"
                                                                    : "12 Months"}
                                                        </div>
                                                        {plan.discountPercentage && plan.discountPercentage > 0 && (
                                                            <div className="mb-1 text-sm text-gray-400 line-through">
                                                                {formatCurrency(originalAmount, plan.currency)}
                                                            </div>
                                                        )}
                                                        <div className="mb-2 text-2xl font-bold text-gray-900">
                                                            {formatCurrency(plan.amount, plan.currency)}
                                                        </div>
                                                        {plan.monthlyEquivalent && (
                                                            <div className="text-muted-foreground text-xs">
                                                                {formatCurrency(plan.monthlyEquivalent, plan.currency)}
                                                                /month effective
                                                            </div>
                                                        )}
                                                        {plan.discountPercentage && plan.discountPercentage > 0 && (
                                                            <Badge className="mt-2 bg-green-500 px-3 py-1 text-[10px] text-white">
                                                                Save {formatCurrency(savedAmount, plan.currency)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section className="bg-white px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-12 text-center">
                                <h2 className="heading-main mb-4 text-4xl font-bold md:text-5xl">
                                    What Our Clients Say
                                </h2>
                                <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
                                    Real feedback from teams using SafeIn daily
                                </p>
                            </div>

                            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
                                <Card className="bg-white">
                                    <CardContent className="space-y-4 p-6">
                                        <p className="text-gray-700">
                                            "The email notification system has revolutionized our operation. The staff
                                            no longer neglect meetings and our visitors feel welcomed with immediate
                                            confirmations."
                                        </p>
                                        <p className="text-brand font-semibold">— Rohit Bansal, Operations Head</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white">
                                    <CardContent className="space-y-4 p-6">
                                        <p className="text-gray-700">
                                            “We have a much easier time managing compliance checks with SafeIn. When we
                                            are audited, if we need to, we can pull visitor reports any way we want; no
                                            manual tracking!”
                                        </p>
                                        <p className="text-brand font-semibold">— Sonal Verma, Security Lead</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white">
                                    <CardContent className="space-y-4 p-6">
                                        <p className="text-gray-700">
                                            “SafeIn has revolutionized visitor management in relation to traffic in our
                                            hospital. We can track visitor as soon as they arrive, and entry point
                                            security is more secure.”
                                        </p>
                                        <p className="text-brand font-semibold">— Dr. Kavita Nair, Administrator</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white">
                                    <CardContent className="space-y-4 p-6">
                                        <p className="text-gray-700">
                                            “Visitor entry was always a bottleneck for us. SafeIn made it easy, fast,
                                            professional and secure.”
                                        </p>
                                        <p className="text-brand font-semibold">— Michael Roberts, Security Manager</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white">
                                    <CardContent className="space-y-4 p-6">
                                        <p className="text-gray-700">
                                            “Finally, a verified visitor management system, that actually works! Our
                                            reception is quicker and our guests happier.”
                                        </p>
                                        <p className="text-brand font-semibold">— Emily Carter, Operations Director</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white">
                                    <CardContent className="space-y-4 p-6">
                                        <p className="text-gray-700">
                                            “What I like is how simple it is. Visitors book in minutes, I approve in
                                            seconds and we maintain 100% control. SafeIn is the future for gatekeeping.”
                                        </p>
                                        <p className="text-brand font-semibold">— Amit Desai, Admin Officer</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>


                </div>
            </PublicLayout>

            {/* Upgrade Plan Modal - Opens when logged-in user clicks a paid plan */}
            <UpgradePlanModal 
                isOpen={isUpgradeModalOpen} 
                onClose={() => {
                    setIsUpgradeModalOpen(false);
                    setSelectedPlanId(null);
                }} 
                initialPlanId={selectedPlanId}
            />
        </>
    );
}
