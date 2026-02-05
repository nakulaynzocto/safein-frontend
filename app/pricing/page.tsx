"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Star } from "lucide-react";
import { routes } from "@/utils/routes";
import { PublicLayout } from "@/components/layout/publicLayout";
import Link from "next/link";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/utils/helpers";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { generateStructuredData } from "@/lib/seoHelpers";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useState } from "react";

export default function PricingPage() {
    const pricingStructuredData = generateStructuredData("pricing");
    const { data: fetchedSubscriptionPlans, isLoading, error } = useGetAllSubscriptionPlansQuery({ isActive: true });
    const router = useRouter();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleGoToSubscriptionPlan = (plan: ISubscriptionPlan) => {
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

    const allPlans = fetchedSubscriptionPlans?.data?.plans || [];
    // Hide free trial for logged-in users - they already have it from registration
    const plans = (isAuthenticated && token)
        ? allPlans.filter((plan: ISubscriptionPlan) => plan.planType !== "free")
        : allPlans;

    return (
        <>
            <PageSEOHead
                title="Pricing Plans"
                description="Choose the perfect SafeIn plan for your business. Flexible pricing options for visitor management and appointment scheduling."
                keywords={[
                    "pricing",
                    "plans",
                    "subscription",
                    "visitor management pricing",
                    "appointment system cost",
                    "SafeIn pricing",
                    "business plans",
                ]}
                url="https://safein.aynzo.com/pricing"
                structuredData={pricingStructuredData}
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section */}
                    <section className="bg-hero-gradient px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                        <div className="container mx-auto text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                Simple, Transparent Pricing
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Choose the perfect plan for your business. All plans include our core SafeIn management
                                features with a 3-day free trial and no setup fees.
                            </p>
                            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 px-2 text-yellow-400 sm:gap-2 sm:px-0">
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
                            <div className="scrollbar-thin scrollbar-thumb-brand scrollbar-track-transparent flex snap-x snap-mandatory gap-6 overflow-x-auto pb-12">
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
                                                <div className="mt-2">
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
                                                            {plan.planType === "free"
                                                                ? "Free - 3 Days Trial"
                                                                : `per ${plan.planType.replace("ly", "")}`}
                                                        </span>
                                                    </div>
                                                    {!!plan.monthlyEquivalent && plan.planType !== "free" && (
                                                        <div className="mt-1.5 text-xs text-gray-600">
                                                            <span className="text-gray-400">Effective: </span>
                                                            <span className="text-brand-strong font-semibold">
                                                                {formatCurrency(plan.monthlyEquivalent, plan.currency)}
                                                                /month
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardDescription className="text-accent mt-2 line-clamp-2 h-10 text-xs">
                                                    {plan.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex h-[calc(100%-160px)] flex-col pt-0">
                                                <div className="scrollbar-hide mb-6 max-h-[300px] flex-grow space-y-3 overflow-y-auto pr-2">
                                                    {plan.features.map((feature, featureIndex) => (
                                                        <div key={featureIndex} className="flex items-start">
                                                            <Check className="text-brand-strong mt-0.5 mr-3 h-5 w-5 shrink-0" />
                                                            <span className="text-accent text-sm leading-tight">
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {plan.trialDays !== undefined &&
                                                        plan.trialDays > 0 &&
                                                        plan.planType === "free" && (
                                                            <div className="flex items-center opacity-60">
                                                                <X className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
                                                                <span className="text-sm text-gray-400">
                                                                    Limited to {plan.trialDays} days
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                                <Button
                                                    className={`mt-auto w-full ${plan.planType === "free" || plan.isPopular ? "bg-brand hover:bg-brand-strong text-white" : ""}`}
                                                    variant={
                                                        plan.planType === "free" || plan.isPopular
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    onClick={() => handleGoToSubscriptionPlan(plan)}
                                                >
                                                    {plan.planType === "free" ? "Start 3 Day Trial" : "Subscribe Now"}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
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
                            <div className="mx-auto max-w-4xl">
                                <h2 className="text-brand mb-4 text-3xl font-bold">Pricing Summary</h2>
                                <p className="text-accent mb-8 text-lg">Premium plan total cost comparison</p>
                                <div className="scrollbar-thin scrollbar-thumb-brand scrollbar-track-transparent flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">
                                    {plans
                                        .filter((p) => p.planType !== "free")
                                        .map((plan, index) => {
                                            const originalAmount =
                                                plan.amount / (1 - (plan.discountPercentage || 0) / 100);
                                            const savedAmount = originalAmount - plan.amount;
                                            return (
                                                <div
                                                    key={plan._id}
                                                    className="w-[200px] flex-none snap-center py-2 sm:w-[260px]"
                                                >
                                                    <div
                                                        className={`h-full rounded-xl bg-white p-4 transition-all duration-300 ${plan.isPopular ? "border-brand border-2 shadow-lg" : "border-border border shadow-sm hover:shadow-md"}`}
                                                    >
                                                        <div className="text-brand-strong mb-1 text-lg font-bold">
                                                            {plan.planType === "monthly"
                                                                ? "1 Month"
                                                                : plan.planType === "quarterly"
                                                                    ? "3 Months"
                                                                    : "12 Months"}
                                                        </div>
                                                        {plan.discountPercentage && plan.discountPercentage > 0 && (
                                                            <div className="mb-0.5 text-[10px] text-gray-400 line-through">
                                                                {formatCurrency(originalAmount, plan.currency)}
                                                            </div>
                                                        )}
                                                        <div className="mb-1 text-xl font-bold">
                                                            {formatCurrency(plan.amount, plan.currency)}
                                                        </div>
                                                        {plan.monthlyEquivalent && (
                                                            <div className="text-accent text-[10px]">
                                                                {formatCurrency(plan.monthlyEquivalent, plan.currency)}
                                                                /month effective
                                                            </div>
                                                        )}
                                                        {plan.discountPercentage && plan.discountPercentage > 0 && (
                                                            <Badge className="mt-1 h-4 bg-green-500 px-2 py-0 text-[9px] text-white">
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
                                <p className="text-accent mx-auto max-w-3xl text-lg">
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

                    {/* CTA Section */}
                    <section className="bg-hero-gradient px-4 py-20">
                        <div className="container mx-auto text-center">
                            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Ready to Get Started?</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                                Join thousands of businesses that trust our platform. Start your free trial today.
                            </p>
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Button size="lg" className="bg-brand text-white" asChild>
                                    <Link href={routes.publicroute.REGISTER}>
                                        Start 3 Day Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-gray-900 hover:bg-white hover:text-gray-900"
                                >
                                    <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </PublicLayout>

            {/* Upgrade Plan Modal - Opens when logged-in user clicks a paid plan */}
            <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </>
    );
}
