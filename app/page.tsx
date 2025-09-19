"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicLayout } from "@/components/layout/publicLayout"
import { Calendar, Users, Shield, Clock, CheckCircle, UserCheck, ArrowRight, Building2, Globe, Award, Heart, Zap } from "lucide-react"
import { routes } from "@/utils/routes"

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#121212' }}>
                Your visitor management, powered by SafeIn
          </h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#555879' }}>
                A comprehensive and powerful visitor appointment system to transform the way you manage visitors. 
                Designed for organizations of all sizes, built by SafeIn that values security and efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="px-8 py-3 text-lg text-white" style={{ backgroundColor: '#3882a5' }} asChild>
                  <Link href={routes.publicroute.REGISTER} prefetch={true}>Get Started Now</Link>
            </Button>
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg" style={{ borderColor: '#555879', color: '#555879' }} asChild>
                  <Link href={routes.publicroute.LOGIN} prefetch={true}>Sign In</Link>
            </Button>
              </div>
            </div>
            
            {/* Right Side - Hero Image */}
            <div className="relative">
              <Image
                src="/home/visitor-appointment-management.jpg"
                alt="Visitor Appointment Management"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: '#121212' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="p-8 rounded-lg" style={{ backgroundColor: '#121212' }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#d1d8e2' }}>
                  To build something that endures, It takes time
                </h2>
                <p className="mb-6" style={{ color: '#d1d8e2' }}>
                  SafeIn visitor management system is built with years of experience and continuous improvement. 
                  We understand that security and efficiency require careful attention to detail.
                </p>
                <Link href="#" className="underline" style={{ color: '#3882a5' }} prefetch={true}>
                  Read our story →
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/home/authentication-security.jpg"
                alt="Authentication Security"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
        <div className="w-full h-1 mt-8" style={{ backgroundColor: '#3882a5' }}></div>
      </section>

      {/* Dashboard Analytics Section */}
      <section className="py-20" style={{ backgroundColor: '#3882a5' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: '#121212' }}>
                <Shield className="h-8 w-8" style={{ color: '#3882a5' }} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#d1d8e2' }}>
                SafeIn Analytics
              </h2>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: '#d1d8e2' }}>
                The operating system for visitor management
              </h3>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: '#d1d8e2' }}>
                The powerful suite that helps you run your entire visitor management system. 
                Automate workflows, delight visitors, and empower your security team to increase organizational efficiency.
              </p>
              <Button size="lg" className="px-8 py-3 text-lg text-white" style={{ backgroundColor: '#121212' }} asChild>
                <Link href={routes.publicroute.REGISTER} prefetch={true}>Try SafeIn Analytics</Link>
              </Button>
            </div>
            <div className="relative">
              <Image
                src="/home/aashboard-analytics.jpg"
                alt="Dashboard Analytics"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Staff Management Section */}
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/home/staff-listing-role-management.jpg"
                alt="Staff Listing Role Management"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#121212' }}>
                Staff Management
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: '#555879' }}>
                Comprehensive employee directory with role-based access and management. 
                Streamline staff onboarding, manage permissions, and ensure proper access control throughout your organization.
              </p>
              <Button size="lg" className="px-8 py-3 text-lg text-white" style={{ backgroundColor: '#3882a5' }} asChild>
                <Link href={routes.publicroute.REGISTER} prefetch={true}>Learn more →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="py-20" style={{ backgroundColor: '#555879' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#d1d8e2' }}>
            SafeIn Notifications & Alerts
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#d1d8e2' }}>
            Stay informed with instant notifications and alerts. SafeIn learns from your visitor patterns, 
            offers smart recommendations, and keeps you updated on all security operations.
          </p>
          <Button size="lg" className="px-8 py-3 text-lg text-white" style={{ backgroundColor: '#3882a5' }} asChild>
            <Link href={routes.publicroute.REGISTER} prefetch={true}>Explore SafeIn Notifications →</Link>
          </Button>
          <div className="mt-12">
            <Image
              src="/home/notifications-alerts-system.jpg"
              alt="Notifications Alerts System"
              width={400}
              height={300}
              className="rounded-lg shadow-lg mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20" style={{ backgroundColor: '#3882a5' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12" style={{ color: '#d1d8e2' }}>
            Made for Security. Made for the World.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#d1d8e2' }}>10K+</div>
              <div style={{ color: '#d1d8e2' }}>organizations globally</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#d1d8e2' }}>50K+</div>
              <div style={{ color: '#d1d8e2' }}>visitors managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#d1d8e2' }}>5+</div>
              <div style={{ color: '#d1d8e2' }}>years in business</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#d1d8e2' }}>25+</div>
              <div style={{ color: '#d1d8e2' }}>countries served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#d1d8e2' }}>99.9%</div>
              <div style={{ color: '#d1d8e2' }}>uptime guarantee</div>
            </div>
          </div>
          <Button size="lg" className="px-8 py-3 text-lg" style={{ backgroundColor: '#d1d8e2', color: '#121212' }} asChild>
            <Link href={routes.publicroute.REGISTER} prefetch={true}>More about SafeIn →</Link>
          </Button>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#3882a5' }}>
            <Shield className="h-8 w-8" style={{ color: '#d1d8e2' }} />
          </div>
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#121212' }}>
            Your security is our responsibility
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#555879' }}>
            We believe that trust is earned by a relationship. SafeIn does not monetize your visitor data and has never sold it to anyone. 
            Your data is your data. We are responsible for protecting your information from surveillance and security intrusions.
          </p>
          <Link href="#" className="underline" style={{ color: '#3882a5' }} prefetch={true}>
            Read our privacy policy →
          </Link>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20" style={{ backgroundColor: '#121212' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: '#d1d8e2' }}>
              The core values and principles that drive us
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#3882a5' }}>
                <Heart className="h-8 w-8" style={{ color: '#d1d8e2' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#d1d8e2' }}>Long-term commitment</h3>
              <p style={{ color: '#d1d8e2' }}>
                Building lasting relationships with our clients and earning their trust through consistent, 
                reliable service and continuous improvement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#3882a5' }}>
                <Award className="h-8 w-8" style={{ color: '#d1d8e2' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#d1d8e2' }}>Focus on innovation</h3>
              <p style={{ color: '#d1d8e2' }}>
                Continuous investment in research and development to bring you the most advanced 
                visitor management solutions and security features.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#3882a5' }}>
                <Users className="h-8 w-8" style={{ color: '#d1d8e2' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#d1d8e2' }}>Customer-first philosophy</h3>
              <p style={{ color: '#d1d8e2' }}>
                Putting our customers at the center of everything we do, ensuring their success 
                and satisfaction drives our product development and service delivery.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="px-8 py-3 text-lg text-white" style={{ backgroundColor: '#3882a5' }} asChild>
              <Link href={routes.publicroute.REGISTER} prefetch={true}>Read our story →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#121212' }}>
            Ready to do your best work? Let's get you started.
          </h2>
          <Button size="lg" className="px-8 py-3 text-lg text-white" style={{ backgroundColor: '#3882a5' }} asChild>
            <Link href={routes.publicroute.REGISTER} prefetch={true}>Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
