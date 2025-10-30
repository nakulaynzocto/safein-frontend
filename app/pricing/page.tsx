"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, ArrowRight, Star } from "lucide-react"
import { routes } from "@/utils/routes"
import { PublicLayout } from "@/components/layout/publicLayout"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Free Trial",
      price: "₹0",
      period: "3 Days Only",
      description: "Experience full SafeIn features for 3 days",
      popular: false,
      features: [
        "Full SafeIn features access",
        "Test visitor tracking",
        "Photo capture & ID verification",
        "Real-time notifications",
        "No credit card required"
      ],
      limitations: [
        "Limited to 3 days",
        "No priority support"
      ]
    },
    {
      name: "Premium - 1 Month",
      originalPricePerMonth: "₹8,499",
      price: "₹8,499",
      period: "per month",
      description: "Monthly billing at ₹8,499/month",
      popular: false,
      features: [
        "Unlimited visitor tracking",
        "Aadhaar & ID verification",
        "Real-time email & SMS alerts",
        "Photo capture & smart logs",
        "Secure cloud storage",
        "24/7 priority support",
        "Advanced analytics & reporting",
        "Custom branding options",
        "API access",
        "Multi-location support"
      ],
      limitations: []
    },
    {
      name: "Premium - 3 Months",
      originalPrice: "₹25,497",
      originalPricePerMonth: "₹8,499",
      price: "₹24,222",
      pricePerMonth: "₹8,074",
      period: "for 3 months",
      discountNote: "5% OFF",
      description: "Save 5% with 3-month billing",
      popular: true,
      features: [
        "Unlimited visitor tracking",
        "Aadhaar & ID verification",
        "Real-time email & SMS alerts",
        "Photo capture & smart logs",
        "Secure cloud storage",
        "24/7 priority support",
        "Advanced analytics & reporting",
        "Custom branding options",
        "API access",
        "Multi-location support"
      ],
      limitations: []
    },
    {
      name: "Premium - 12 Months",
      originalPrice: "₹101,988",
      originalPricePerMonth: "₹8,499",
      price: "₹91,790",
      pricePerMonth: "₹7,649",
      period: "billed annually",
      discountNote: "10% OFF",
      description: "Save 10% with annual billing - Best value!",
      popular: false,
      features: [
        "Unlimited visitor tracking",
        "Aadhaar & ID verification",
        "Real-time email & SMS alerts",
        "Photo capture & smart logs",
        "Secure cloud storage",
        "24/7 priority support",
        "Advanced analytics & reporting",
        "Custom branding options",
        "API access",
        "Multi-location support"
      ],
      limitations: []
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-hero-gradient">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include our core SafeIn management features 
            with a 3-day free trial and no setup fees.
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-lg font-semibold">4.9/5 Rating</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">1000+ Happy Clients</span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-brand shadow-lg scale-105' : ''}`}>
                {plan.popular && (
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
                    {plan.originalPrice && (
                      <div className="mb-2">
                        <span className="text-lg line-through text-gray-400">{plan.originalPrice}</span>
                        {plan.discountNote && (
                          <Badge className="ml-2 bg-green-500 text-white">{plan.discountNote}</Badge>
                        )}
                      </div>
                    )}
                    <span className="text-4xl font-bold text-brand-strong">
                      {plan.price}
                    </span>
                    <div className="mt-2">
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                    {plan.pricePerMonth && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="text-gray-400">Effective: </span>
                        <span className="font-semibold text-brand-strong">{plan.pricePerMonth}/month</span>
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
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-center opacity-60">
                        <X className="h-5 w-5 mr-3 text-gray-400" />
                        <span className="text-sm text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${plan.popular ? 'text-white bg-brand' : ''}`} 
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={routes.publicroute.REGISTER}>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
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
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold mb-2 text-brand-strong">1 Month</div>
                <div className="text-3xl font-bold mb-2">₹8,499</div>
                <div className="text-sm text-accent">per month</div>
                <div className="text-lg mt-3 font-semibold text-brand-strong">Total: ₹8,499</div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-brand">
                <div className="text-2xl font-bold mb-2 text-brand-strong">3 Months</div>
                <div className="text-lg line-through text-gray-400 mb-1">₹25,497</div>
                <div className="text-3xl font-bold mb-2">₹24,222</div>
                <div className="text-sm text-accent">₹8,074/month effective</div>
                <Badge className="mt-2 bg-green-500 text-white">Save ₹1,275 (5% OFF)</Badge>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border-2 border-brand">
                <div className="text-2xl font-bold mb-2 text-brand-strong">12 Months</div>
                <div className="text-lg line-through text-gray-400 mb-1">₹101,988</div>
                <div className="text-3xl font-bold mb-2">₹91,790</div>
                <div className="text-sm text-accent">₹7,649/month effective</div>
                <Badge className="mt-2 bg-green-500 text-white">Save ₹10,198 (10% OFF)</Badge>
              </div>
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
                <p className="text-gray-700">“The notifications via Whats App has revolutionized our operation. The staff no longer neglect meetings and our visitors feel welcomed with immediate confirmations.”</p>
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
                Start Free Trial
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
  )
}
