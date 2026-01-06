"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, ArrowRight, Star } from "lucide-react"
import { routes } from "@/utils/routes"
import { PublicLayout } from "@/components/layout/publicLayout"
import Link from "next/link"
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { formatCurrency } from "@/utils/helpers"
import { PageSEOHead } from "@/components/seo/pageSEOHead"
import { generateStructuredData } from "@/lib/seoHelpers"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useState } from "react"

export default function PricingPage() {
  const pricingStructuredData = generateStructuredData("pricing")
  const { data: fetchedSubscriptionPlans, isLoading, error } = useGetAllSubscriptionPlansQuery({ isActive: true });
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleGoToSubscriptionPlan = (plan: ISubscriptionPlan) => {
    if (plan.planType === 'free') {
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-xl text-gray-700">Loading pricing plans...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !fetchedSubscriptionPlans) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-xl text-red-500">Error loading pricing plans. Please try again later.</p>
        </div>
      </PublicLayout>
    );
  }

  const plans = fetchedSubscriptionPlans?.data?.plans || [];

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
          "business plans"
        ]}
        url="https://safein.aynzo.com/pricing"
        structuredData={pricingStructuredData}
      />
      <PublicLayout>
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-hero-gradient">
            <div className="container mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
                Simple, Transparent Pricing
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                Choose the perfect plan for your business. All plans include our core SafeIn management features
                with a 3-day free trial and no setup fees.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-yellow-400 mb-4 px-2 sm:px-0">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                <span className="text-sm sm:text-base md:text-lg font-semibold">4.9/5 Rating</span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="text-gray-300 text-sm sm:text-base md:text-lg">1000+ Happy Clients</span>
              </div>
            </div>
          </section>

          {/* Pricing Plans */}
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {plans.map((plan: ISubscriptionPlan, index: number) => (
                  <Card key={plan._id} className={`relative ${plan.isPopular ? 'border-2 border-brand shadow-lg scale-105' : ''}`}>
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="px-4 py-1 text-white bg-brand">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-2xl font-bold text-brand">
                        {plan.name}
                      </CardTitle>
                      <div className="mt-4">
                        {!!plan.discountPercentage && plan.discountPercentage > 0 ? (
                          <div className="mb-2">
                            <span className="text-lg line-through text-gray-400">
                              {formatCurrency(plan.amount / (1 - plan.discountPercentage / 100), plan.currency)}
                            </span>
                            <Badge className="ml-2 bg-green-500 text-white">{plan.discountPercentage}% OFF</Badge>
                          </div>
                        ) : null}
                        <span className="text-4xl font-bold text-brand-strong">
                          {formatCurrency(plan.amount, plan.currency)}
                        </span>
                        <div className="mt-2">
                          <span className="text-gray-500">
                            {plan.planType === 'free' ? 'Free - 3 Days Trial' : `per ${plan.planType.replace('ly', '')}`}
                          </span>
                        </div>
                        {!!plan.monthlyEquivalent && plan.planType !== 'free' && (
                          <div className="text-sm text-gray-600 mt-2">
                            <span className="text-gray-400">Effective: </span>
                            <span className="font-semibold text-brand-strong">
                              {formatCurrency(plan.monthlyEquivalent, plan.currency)}/month
                            </span>
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-base mt-4 text-accent">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <Check className="h-5 w-5 mr-3 text-brand-strong" />
                            <span className="text-sm text-accent">{feature}</span>
                          </div>
                        ))}
                        {plan.trialDays !== undefined && plan.trialDays > 0 && plan.planType === 'free' && (
                          <div className="flex items-center opacity-60">
                            <X className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="text-sm text-gray-400">Limited to {plan.trialDays} days</span>
                          </div>
                        )}
                      </div>
                      <Button
                        className={`w-full ${plan.planType === 'free' || plan.isPopular ? 'text-white bg-brand' : ''}`}
                        variant={plan.planType === 'free' || plan.isPopular ? 'default' : 'outline'}
                        onClick={() => handleGoToSubscriptionPlan(plan)}
                      >
                        {plan.planType === 'free' ? 'Start 3 Day Trial' : 'Subscribe Now'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Summary */}
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-brand">
                  Pricing Summary
                </h2>
                <p className="text-lg mb-8 text-accent">
                  Premium plan total cost comparison
                </p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  {plans.filter(p => p.planType !== 'free').map((plan, index) => {
                    const originalAmount = plan.amount / (1 - (plan.discountPercentage || 0) / 100);
                    const savedAmount = originalAmount - plan.amount;
                    return (
                      <div key={plan._id} className={`p-6 bg-white rounded-lg ${plan.isPopular ? 'shadow-lg border-2 border-brand' : 'shadow-sm'}`}>
                        <div className="text-2xl font-bold mb-2 text-brand-strong">
                          {plan.planType === 'monthly' ? '1 Month' : plan.planType === 'quarterly' ? '3 Months' : '12 Months'}
                        </div>
                        {plan.discountPercentage && plan.discountPercentage > 0 && (
                          <div className="text-lg line-through text-gray-400 mb-1">
                            {formatCurrency(originalAmount, plan.currency)}
                          </div>
                        )}
                        <div className="text-3xl font-bold mb-2">{formatCurrency(plan.amount, plan.currency)}</div>
                        {plan.monthlyEquivalent && (
                          <div className="text-sm text-accent">
                            {formatCurrency(plan.monthlyEquivalent, plan.currency)}/month effective
                          </div>
                        )}
                        {plan.discountPercentage && plan.discountPercentage > 0 && (
                          <Badge className="mt-2 bg-green-500 text-white">
                            Save {formatCurrency(savedAmount, plan.currency)} ({plan.discountPercentage}% OFF)
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 px-4 bg-white">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold heading-main mb-4">What Our Clients Say</h2>
                <p className="text-accent text-lg max-w-3xl mx-auto">Real feedback from teams using SafeIn daily</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">"The email notification system has revolutionized our operation. The staff no longer neglect meetings and our visitors feel welcomed with immediate confirmations."</p>
                    <p className="text-brand font-semibold">— Rohit Bansal, Operations Head</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">“We have a much easier time managing compliance checks with SafeIn. When we are audited, if we need to, we can pull visitor reports any way we want; no manual tracking!”</p>
                    <p className="text-brand font-semibold">— Sonal Verma, Security Lead</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">“SafeIn has revolutionized visitor management in relation to traffic in our hospital. We can track visitor as soon as they arrive, and entry point security is more secure.”</p>
                    <p className="text-brand font-semibold">— Dr. Kavita Nair, Administrator</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">“Visitor entry was always a bottleneck for us. SafeIn made it easy, fast, professional and secure.”</p>
                    <p className="text-brand font-semibold">— Michael Roberts, Security Manager</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">“Finally, a verified visitor management system, that actually works! Our reception is quicker and our guests happier.”</p>
                    <p className="text-brand font-semibold">— Emily Carter, Operations Director</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">“What I like is how simple it is. Visitors book in minutes, I approve in seconds and we maintain 100% control. SafeIn is the future for gatekeeping.”</p>
                    <p className="text-brand font-semibold">— Amit Desai, Admin Officer</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-hero-gradient">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses that trust our platform. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-white bg-brand" asChild>
                  <Link href={routes.publicroute.REGISTER}>
                    Start 3 Day Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-gray-900">
                  <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PublicLayout>

      {/* Upgrade Plan Modal - Opens when logged-in user clicks a paid plan */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </>
  )
}
