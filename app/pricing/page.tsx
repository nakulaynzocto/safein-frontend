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
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for small businesses getting started with SafeIn management",
      popular: false,
      features: [
        "Up to 100 visitors per month",
        "Basic appointment scheduling",
        "SafeIn registration",
        "Email notifications",
        "Basic reporting",
        "Mobile responsive",
        "Email support"
      ],
      limitations: [
        "No SMS notifications",
        "No advanced analytics",
        "No custom branding"
      ]
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month",
      description: "Ideal for growing businesses with advanced SafeIn management needs",
      popular: true,
      features: [
        "Up to 500 visitors per month",
        "Advanced appointment scheduling",
        "SafeIn registration with photos",
        "Email & SMS notifications",
        "Advanced analytics & reporting",
        "Custom SafeIn badges",
        "Integration with calendar systems",
        "Priority email support",
        "Custom branding options"
      ],
      limitations: [
        "No API access",
        "No white-label solution"
      ]
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "per month",
      description: "Complete solution for large organizations with complex requirements",
      popular: false,
      features: [
        "Unlimited visitors",
        "All Professional features",
        "Multi-location support",
        "Advanced security features",
        "API access & integrations",
        "White-label solution",
        "Custom workflows",
        "Dedicated account manager",
        "24/7 phone support",
        "SLA guarantee",
        "Custom training sessions"
      ],
      limitations: []
    }
  ]

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees. You only pay the monthly subscription fee for your chosen plan."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for your convenience."
    },
    {
      question: "Do you offer discounts for annual plans?",
      answer: "Yes, we offer a 20% discount when you choose annual billing instead of monthly billing."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 3-day free trial with full access to all features. No credit card required to start."
    },
    {
      question: "What happens if I exceed my visitor limit?",
      answer: "We'll notify you when you're approaching your limit. You can upgrade your plan or purchase additional visitor credits."
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4" style={{ backgroundColor: '#555879' }}>
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 shadow-lg scale-105' : ''}`} style={plan.popular ? { borderColor: '#3882a5' } : {}}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 text-white" style={{ backgroundColor: '#3882a5' }}>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold" style={{ color: '#161718' }}>
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold" style={{ color: '#3882a5' }}>
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base mt-4" style={{ color: '#555879' }}>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 mr-3" style={{ color: '#3882a5' }} />
                        <span className="text-sm" style={{ color: '#555879' }}>{feature}</span>
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
                    className={`w-full ${plan.popular ? 'text-white' : ''}`} 
                    variant={plan.popular ? 'default' : 'outline'}
                    style={plan.popular ? { backgroundColor: '#3882a5' } : {}}
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

      {/* Annual Discount */}
      <section className="py-16 px-4" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#161718' }}>
              Save 20% with Annual Billing
            </h2>
            <p className="text-lg mb-8" style={{ color: '#555879' }}>
              Choose annual billing and save 20% on all plans. Plus, get priority support and exclusive features.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-white rounded-lg">
                <div className="text-2xl font-bold" style={{ color: '#3882a5' }}>20%</div>
                <div className="text-sm" style={{ color: '#555879' }}>Annual Discount</div>
              </div>
              <div className="p-6 bg-white rounded-lg">
                <div className="text-2xl font-bold" style={{ color: '#3882a5' }}>Priority</div>
                <div className="text-sm" style={{ color: '#555879' }}>Support Access</div>
              </div>
              <div className="p-6 bg-white rounded-lg">
                <div className="text-2xl font-bold" style={{ color: '#3882a5' }}>Free</div>
                <div className="text-sm" style={{ color: '#555879' }}>Setup & Migration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg" style={{ color: '#555879' }}>
              Get answers to common questions about our pricing and plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3" style={{ color: '#161718' }}>
                  {faq.question}
                </h3>
                <p className="text-sm" style={{ color: '#555879' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ backgroundColor: '#555879' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust our platform. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-white" style={{ backgroundColor: '#3882a5' }} asChild>
              <Link href={routes.publicroute.REGISTER}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </PublicLayout>
  )
}
