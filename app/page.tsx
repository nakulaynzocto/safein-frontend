"use client"

import { useEffect, useState } from "react"
import { routes } from "@/utils/routes"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicLayout } from "@/components/layout/publicLayout"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { Calendar, Users, Shield, Clock, CheckCircle, UserCheck, ArrowRight, Building2, Globe, Award, Heart, Zap, Star, Phone, Mail, MapPin, MessageCircle, Download, Play, ChevronRight, Check, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize authentication
  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated && token) {
      router.push(routes.privateroute.DASHBOARD)
    }
  }, [isInitialized, isAuthenticated, token, router])

  // Show loading during hydration and auth initialization
  if (!isClient || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show loading if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null // Don't show loading, just redirect
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20" style={{ background: 'linear-gradient(to right, rgba(7, 68, 99, 0.95), rgba(56, 130, 165, 0.95))' }}>
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Content */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-semibold">4.9/5 Rating</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">1000+ Happy Clients</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Transform Your Visitor Management with SafeIn
          </h1>
              <p className="text-xl mb-8 leading-relaxed text-gray-300">
                Get your SafeIn management system set up online with our expert assistance. 
                Start with our free 3-day trial and experience the power of our comprehensive visitor appointment platform.
              </p>
              
              {/* Free Trial Badge */}
              <div className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: '#3882a5' }}>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                FREE 3-Day Trial - No Credit Card Required
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-white font-semibold py-3" style={{ backgroundColor: '#3882a5' }} asChild>
                  <Link href={routes.publicroute.REGISTER}>Start Free Trial</Link>
            </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                  <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
            </Button>
              </div>
            </div>
            
            {/* Right Side - Hero Image */}
            <div className="relative">
              <Image
                src="/home/visitor-appointment-management.jpg"
                alt="SafeIn Appointment Management"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
                priority
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Secure & Reliable</p>
                    <p className="text-sm text-gray-600">24/7 Protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-16" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#98c7dd' }}>
                  <Calendar className="h-8 w-8" style={{ color: '#3882a5' }} />
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#98c7dd' }}>
                  <Users className="h-8 w-8" style={{ color: '#3882a5' }} />
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#98c7dd' }}>
                  <Shield className="h-8 w-8" style={{ color: '#3882a5' }} />
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
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#161718' }}>
              Smart Solutions for Modern Businesses
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#2c5aa0' }}>
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
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#3882a5' }}>1</div>
                  <h3 className="text-3xl font-bold" style={{ color: '#161718' }}>Quick Registration</h3>
                </div>
                <p className="text-lg mb-6" style={{ color: '#2c5aa0' }}>
                  Sign up in seconds with our streamlined registration process. Just provide your basic information and you're ready to start managing visitors professionally.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>No complex forms or lengthy verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Instant account activation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Free 3-day trial included</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <Image
                  src="/home/authentication-security.jpg"
                  alt="Registration Process"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold" style={{ color: '#161718' }}>Registration Complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Dashboard Setup */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/home/aashboard-analytics.jpg"
                alt="Dashboard Analytics"
                width={600}
                height={400}
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" style={{ color: '#3882a5' }} />
                    <span className="text-sm font-semibold" style={{ color: '#161718' }}>Real-time Analytics</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#3882a5' }}>2</div>
                  <h3 className="text-3xl font-bold" style={{ color: '#161718' }}>Powerful Dashboard</h3>
                </div>
                <p className="text-lg mb-6" style={{ color: '#2c5aa0' }}>
                  Access your comprehensive dashboard with real-time visitor analytics, appointment management, and security insights all in one place.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Real-time visitor tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Advanced analytics and reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Customizable dashboard widgets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Appointment Management */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#3882a5' }}>3</div>
                  <h3 className="text-3xl font-bold" style={{ color: '#161718' }}>Easy Appointment Booking</h3>
                </div>
                <p className="text-lg mb-6" style={{ color: '#2c5aa0' }}>
                  Create and manage SafeIn appointments with our intuitive booking system. Streamline your SafeIn management process with automated notifications and scheduling.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>One-click appointment creation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Automated email notifications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Calendar integration</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <Image
                  src="/home/visitor-appointment-management.jpg"
                  alt="Appointment Management"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#3882a5' }} />
                    <span className="text-sm font-semibold" style={{ color: '#161718' }}>Appointment Scheduled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Staff Management */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <Image
                  src="/home/staff-listing-role-management.jpg"
                  alt="Staff Management"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: '#3882a5' }} />
                    <span className="text-sm font-semibold" style={{ color: '#161718' }}>Team Management</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#3882a5' }}>4</div>
                  <h3 className="text-3xl font-bold" style={{ color: '#161718' }}>Complete Team Control</h3>
                </div>
                <p className="text-lg mb-6" style={{ color: '#2c5aa0' }}>
                  Manage your entire team with role-based access control, employee directories, and comprehensive staff management tools.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Role-based permissions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Employee directory management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span style={{ color: '#2c5aa0' }}>Access control and security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#161718' }}>
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#2c5aa0' }}>
              Premium features at ₹8,499/month. Save 5% with 3-month billing or 10% with annual billing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Trial */}
            <Card className="relative border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Free Trial</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">₹0</span>
                  <div className="text-sm text-gray-600 mt-2">3 Days Only</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Experience full features</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Full feature access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Test visitor tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Photo capture & ID verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Real-time notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">No credit card required</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href={routes.publicroute.REGISTER}>Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium 1 Month */}
            <Card className="relative border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">1 Month</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold" style={{ color: '#3882a5' }}>₹8,499</span>
                  <span className="text-gray-600 text-sm">/month</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">Month-to-month billing</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Unlimited visitor tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Aadhaar & ID verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Email & SMS alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Photo capture & smart logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Secure cloud storage</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href={routes.publicroute.REGISTER}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium 3 Months */}
            <Card className="relative border-2 hover:shadow-lg transition-shadow" style={{ borderColor: '#3882a5' }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="text-white px-3 py-0.5 text-xs" style={{ backgroundColor: '#3882a5' }}>Popular</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">3 Months</CardTitle>
                <div className="mt-4">
                  <div className="text-lg line-through text-gray-400 mb-1">₹25,497</div>
                  <div className="flex items-center justify-center gap-1">
                    <Badge className="bg-green-500 text-white text-xs">5% OFF</Badge>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: '#3882a5' }}>₹24,222</span>
                  <div className="text-xs text-gray-600 mt-1">₹8,074/month</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Save ₹1,275</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Unlimited visitor tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Aadhaar & ID verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Email & SMS alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Photo capture & smart logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Secure cloud storage</span>
                  </div>
                </div>
                <Button className="w-full mt-4 text-white" style={{ backgroundColor: '#3882a5' }} asChild>
                  <Link href={routes.publicroute.REGISTER}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium 12 Months */}
            <Card className="relative border-2 hover:shadow-lg transition-shadow border-yellow-400">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white px-3 py-0.5 text-xs animate-pulse">Best Value</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">12 Months</CardTitle>
                <div className="mt-4">
                  <div className="text-lg line-through text-gray-400 mb-1">₹101,988</div>
                  <div className="flex items-center justify-center gap-1">
                    <Badge className="bg-green-500 text-white text-xs">10% OFF</Badge>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: '#3882a5' }}>₹91,790</span>
                  <div className="text-xs text-gray-600 mt-1">₹7,649/month</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Save ₹10,198</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Unlimited visitors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Aadhaar & ID verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Email & SMS alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Photo capture & smart logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Secure cloud storage</span>
                  </div>
                </div>
                <Button className="w-full mt-4 text-white" style={{ backgroundColor: '#3882a5' }} asChild>
                  <Link href={routes.publicroute.REGISTER}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* All Plans Features */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#161718' }}>All Premium Plans Include</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">24/7 Priority Support</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">Custom Branding</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">API Access</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">Multi-location Support</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">Secure Cloud Storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20" style={{ background: 'linear-gradient(to right, rgba(7, 68, 99, 0.95), rgba(56, 130, 165, 0.95))' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose SafeIn?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're committed to providing the best visitor management solution with unmatched security and reliability.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#3882a5' }}>
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Fast Setup</h3>
              <p className="text-gray-300">Get started in minutes, not days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#3882a5' }}>
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Secure</h3>
              <p className="text-gray-300">Enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#3882a5' }}>
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Expert Support</h3>
              <p className="text-gray-300">24/7 customer assistance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#3882a5' }}>
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Always Available</h3>
              <p className="text-gray-300">99.9% uptime guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#161718' }}>
              Testimonials That Speak for Us
            </h2>
            <p className="text-xl" style={{ color: '#2c5aa0' }}>
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
      <section className="py-20" style={{ background: 'linear-gradient(to right, rgba(7, 68, 99, 0.95), rgba(56, 130, 165, 0.95))' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch with Us</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions? Our expert team is here to help you choose the perfect solution for your needs.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3882a5' }}>
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Working Hours</p>
                    <p className="text-gray-300">Mon-Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3882a5' }}>
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-gray-300">support@aynzo.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3882a5' }}>
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
                  <Button className="text-white" style={{ backgroundColor: '#3882a5' }} asChild>
                    <Link href={routes.publicroute.CONTACT}>Contact Us</Link>
                  </Button>
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900" asChild>
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
