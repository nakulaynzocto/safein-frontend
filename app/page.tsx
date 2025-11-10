"use client"

import React, { useEffect, useState } from "react"
import { routes } from "@/utils/routes"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicLayout } from "@/components/layout/publicLayout"
import { Calendar, Users, Shield, Clock, CheckCircle, UserCheck, ArrowRight, Building2, Globe, Award, Heart, Zap, Star, Phone, Mail, MapPin, MessageCircle, Download, Play, ChevronRight, Check, BarChart3, X } from "lucide-react"
import Link from "next/link"
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi"

const formatCurrency = (amountInCents: number, currency: string) => {
  const amountInRupees = amountInCents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInRupees);
};

export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch pricing plans dynamically
  const { data: fetchedSubscriptionPlans, isLoading: isLoadingPlans, error: plansError } = useGetAllSubscriptionPlansQuery({ isActive: true })

  // Initialize authentication
  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  // Transform API plans to match display format
  const plans = React.useMemo(() => {
    if (!fetchedSubscriptionPlans) return []
    
    // Handle different possible response structures (same as pricing page)
    const apiPlans = fetchedSubscriptionPlans?.data?.plans || 
                     (Array.isArray(fetchedSubscriptionPlans) ? fetchedSubscriptionPlans : [])

    return apiPlans.map((plan: ISubscriptionPlan) => {
      const originalPrice = plan.discountPercentage && plan.discountPercentage > 0
        ? formatCurrency(plan.amount / (1 - plan.discountPercentage / 100), plan.currency)
        : null
      
      const price = plan.planType === 'free' 
        ? '₹0' 
        : formatCurrency(plan.amount, plan.currency)
      
      const period = plan.planType === 'free' 
        ? '3 Days Only'
        : plan.planType === 'monthly'
        ? 'per month'
        : plan.planType === 'quarterly'
        ? 'for 3 months'
        : 'billed annually'
      
      const pricePerMonth = plan.monthlyEquivalent && plan.planType !== 'free'
        ? formatCurrency(plan.monthlyEquivalent, plan.currency)
        : null

      return {
        _id: plan._id,
        name: plan.name,
        price,
        period,
        description: plan.description || '',
        popular: plan.isPopular || false,
        features: plan.features || [],
        limitations: plan.planType === 'free' && plan.trialDays 
          ? [`Limited to ${plan.trialDays} days`]
          : [],
        originalPrice,
        discountNote: plan.discountPercentage && plan.discountPercentage > 0
          ? `${plan.discountPercentage}% OFF`
          : null,
        pricePerMonth,
        planType: plan.planType
      }
    })
  }, [fetchedSubscriptionPlans])

  // Redirect authenticated users to dashboard (handled in PublicLayout)

  // Always render - PublicLayout handles loading states to prevent white screen
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-hero-gradient">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Main Content */}
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4 sm:mb-6">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                <span className="text-sm sm:text-base text-yellow-400 font-semibold">4.9/5 Rating</span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="text-gray-300 text-sm sm:text-base">1000+ Happy Clients</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white animate-hero-title px-2 sm:px-0">
                Transform Your Visitor Management with SafeIn
          </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed text-gray-300 px-2 sm:px-0">
                Get your SafeIn management system set up online with our expert assistance. 
                Start with our free 3-day trial and experience the power of our comprehensive visitor appointment platform.
              </p>
              
              {/* Free Trial Badge */}
              <div className="inline-flex items-center gap-2 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 bg-brand">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                FREE 3-Day Trial
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <Button size="lg" className="text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base bg-brand w-full sm:w-auto" asChild>
                  <Link href={routes.publicroute.REGISTER}>Start Free Trial</Link>
            </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-gray-900 py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                  <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
            </Button>
              </div>
            </div>
            
            {/* Right Side - Animated Dashboard Preview (using original image) */}
            <div className="relative mt-8 lg:mt-0 lg:max-w-[434px] lg:ml-auto order-first lg:order-last">
              <div className="absolute -inset-4 sm:-inset-6 blur-3xl opacity-30 bg-white/40 rounded-2xl"></div>
              <Image
                src="/home/Tranform-your-digital-visitor-management.jpg"
                alt="Transform Your Digital Visitor Management"
                width={364}
                height={224}
                className="rounded-full shadow-2xl dash-glow animate-float-slow w-full h-auto"
                priority
              />
              <div className="absolute -bottom-3 sm:-bottom-5 -left-3 sm:-left-5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 border border-white/40 max-w-[200px] sm:max-w-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Live dashboard preview</p>
                    <p className="text-xs text-gray-600 hidden sm:block">What your team will see</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-tint">
                  <Calendar className="h-8 w-8 text-brand-strong" />
              </div>
                <CardTitle className="text-xl">SafeIn Appointment Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Streamline visitor appointments with our advanced booking system
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-tint">
                  <Users className="h-8 w-8 text-brand-strong" />
            </div>
                <CardTitle className="text-xl">Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Comprehensive staff directory with role-based access control
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-tint">
                  <Shield className="h-8 w-8 text-brand-strong" />
            </div>
                <CardTitle className="text-xl">Security Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Advanced security monitoring and visitor pattern analysis
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Smart Solutions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand">
              Smart Solutions for Modern Businesses
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-accent">
              Our comprehensive SafeIn management platform is designed to meet the evolving needs 
              of modern organizations, providing security, efficiency, and peace of mind.
            </p>
          </div>
          
          {/* Process Steps with Screenshots */}
          <div className="space-y-16">
            {/* Step 1: Registration */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg bg-brand">1</div>
                  <h3 className="text-3xl font-bold text-brand">Quick Registration</h3>
                </div>
                <p className="text-lg mb-6 text-accent">
                  Sign up in seconds with our streamlined registration process. Just provide your basic information and you're ready to start managing visitors professionally.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-base font-medium text-brand">No complex forms or lengthy verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-base font-medium text-brand">Instant account activation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-base font-medium text-brand">Free 3-day trial included</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative image-pop-group">
                <Image
                  src="/home/quick-registeration.jpg"
                  alt="Quick Registration Process"
                  width={420}
                  height={280}
                  className="rounded-full shadow-xl group-image-pop"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-md p-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-brand">Registration Complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Dashboard Setup */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative image-pop-group">
              <Image
                src="/home/powerful-dashboard.jpg"
                alt="Powerful Dashboard Analytics"
                width={420}
                height={280}
                  className="rounded-full shadow-xl group-image-pop"
                />
                <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand-strong" />
                    <span className="text-sm font-semibold" style={{ color: '#161718' }}>Real-time Analytics</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg bg-brand">2</div>
                  <h3 className="text-3xl font-bold text-brand">Powerful Dashboard</h3>
                </div>
                <p className="text-lg mb-6 text-accent">
                  Access your comprehensive dashboard with real-time visitor analytics, appointment management, and security insights all in one place.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Real-time visitor tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Advanced analytics and reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Customizable dashboard widgets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Appointment Management */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg bg-brand">3</div>
                  <h3 className="text-3xl font-bold text-brand">Easy Appointment Booking</h3>
                </div>
                <p className="text-lg mb-6 text-accent">
                  Create and manage SafeIn appointments with our intuitive booking system. Streamline your SafeIn management process with automated notifications and scheduling.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">One-click appointment creation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Automated email notifications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Calendar integration</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative image-pop-group">
                <Image
                  src="/home/easyappointment.jpg"
                  alt="Easy Appointment Booking System"
                  width={420}
                  height={280}
                  className="rounded-full shadow-xl group-image-pop"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-md p-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-strong" />
                    <span className="text-sm font-medium text-brand">Appointment Scheduled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Staff Management */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative image-pop-group">
                <Image
                  src="/home/complete-team-control.jpg"
                  alt="Complete Team Control"
                  width={420}
                  height={280}
                  className="rounded-full shadow-xl group-image-pop"
                />
                <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-strong" />
                    <span className="text-sm font-medium text-brand">Team Management</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg bg-brand">4</div>
                  <h3 className="text-3xl font-bold text-brand">Complete Team Control</h3>
                </div>
                <p className="text-lg mb-6 text-accent">
                  Manage your entire team with role-based access control, employee directories, and comprehensive staff management tools.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Role-based permissions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Employee directory management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-accent">Access control and security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 heading-main">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-accent">
              Choose the perfect plan for your business. All plans include our core SafeIn management features 
              with a 3-day free trial and no setup fees.
            </p>
          </div>
          
          {isLoadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xl text-gray-700">Loading pricing plans...</p>
            </div>
          ) : plansError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xl text-red-500">Error loading pricing plans. Please try again later.</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xl text-gray-700">No pricing plans available at the moment.</p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <Card key={plan._id || plan.name} className={`relative ${plan.popular ? 'border-2 border-brand shadow-lg scale-105' : ''}`}>
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
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand">Why Choose SafeIn?</h2>
            <p className="text-lg md:text-xl text-accent max-w-3xl mx-auto">
              We're committed to providing the best visitor management solution with unmatched security and reliability.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-brand">Fast Setup</h3>
              <p className="text-sm md:text-base text-accent">Get started in minutes, not days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-brand">Secure</h3>
              <p className="text-sm md:text-base text-accent">Enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-brand">Expert Support</h3>
              <p className="text-sm md:text-base text-accent">24/7 customer assistance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-brand">Always Available</h3>
              <p className="text-sm md:text-base text-accent">99.9% uptime guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-main">
              Testimonials That Speak for Us
            </h2>
            <p className="text-xl text-accent">
              See what our clients have to say about their experience with our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The SafeIn management system has transformed our security operations. 
                  Setup was incredibly easy and the support team is outstanding."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    SK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Kumar</p>
                    <p className="text-sm text-gray-600">Security Manager, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Excellent platform with great features. The analytics help us understand 
                  visitor patterns and improve our security measures significantly."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    MR
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Rodriguez</p>
                    <p className="text-sm text-gray-600">Facilities Director, MedCenter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Professional service and reliable platform. Our visitors love the 
                  streamlined check-in process and our team appreciates the efficiency."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    AJ
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Amanda Johnson</p>
                    <p className="text-sm text-gray-600">Office Manager, EduTech</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Get in Touch with Us</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions? Our expert team is here to help you choose the perfect solution for your needs.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-brand">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Working Hours</p>
                    <p className="text-gray-300">Mon-Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-brand">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-gray-300">support@aynzo.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-brand">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <p className="text-gray-300">+91 86999 66076</p>
                  </div>
              </div>
              </div>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-6 text-white">Get in Touch</h3>
                <p className="text-white mb-6">
                  Ready to transform your SafeIn management? Contact our team to learn more about our solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="text-white bg-brand" asChild>
                    <Link href={routes.publicroute.CONTACT}>Contact Us</Link>
                  </Button>
                  <Button variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-gray-900" asChild>
                    <Link href={routes.publicroute.PRICING}>View Pricing</Link>
                  </Button>
          </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
