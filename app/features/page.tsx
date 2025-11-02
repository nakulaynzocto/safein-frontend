"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Shield, 
  Bell, 
  BarChart3, 
  Smartphone, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  Lock
} from "lucide-react"
import { routes } from "@/utils/routes"
import { PublicLayout } from "@/components/layout/publicLayout"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Calendar,
      title: "Appointment Management",
      description: "Schedule, manage, and track visitor appointments with ease. Set up recurring meetings and automated reminders.",
      benefits: ["Online booking system", "Calendar integration", "Automated reminders", "Recurring appointments"]
    },
    {
      icon: Users,
      title: "SafeIn Registration",
      description: "Streamline visitor check-in process with digital registration forms and instant notifications to hosts.",
      benefits: ["Digital check-in", "Photo capture", "ID verification", "Instant host notification"]
    },
    {
      icon: Shield,
      title: "Security & Access Control",
      description: "Enhanced security with visitor badges, access logs, and real-time monitoring of all entries and exits.",
      benefits: ["SafeIn badges", "Access logs", "Real-time monitoring", "Security alerts"]
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed with instant notifications via email, SMS, and in-app alerts for all visitor activities.",
      benefits: ["Email notifications", "SMS alerts", "In-app notifications", "Custom notification rules"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Comprehensive insights into visitor patterns, peak hours, and detailed reports for better decision making.",
      benefits: ["SafeIn analytics", "Peak hour reports", "Custom dashboards", "Export capabilities"]
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your SafeIn management system from any device with our fully responsive web application.",
      benefits: ["Mobile optimized", "Tablet friendly", "Cross-platform", "Offline capabilities"]
    }
  ]

  const additionalFeatures = [
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant updates on visitor status, appointment changes, and system notifications."
    },
    {
      icon: CheckCircle,
      title: "Compliance Ready",
      description: "Meet regulatory requirements with comprehensive audit trails and data protection features."
    },
    {
      icon: Zap,
      title: "Fast Setup",
      description: "Get your SafeIn management system up and running in minutes, not days."
    },
    {
      icon: Globe,
      title: "Multi-location Support",
      description: "Manage multiple office locations from a single dashboard with centralized control."
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level security with encryption, secure data storage, and regular security audits."
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-hero-gradient">
          <div className="container mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
              Powerful Features for Modern SafeIn Management
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Discover how our comprehensive SafeIn management system can transform your business operations 
              with cutting-edge features designed for efficiency and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" className="text-white bg-brand py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                <Link href={routes.publicroute.REGISTER}>Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-gray-900 py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
                Core Features
              </h2>
              <p className="text-lg text-accent">
                Everything you need to manage visitors professionally and efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-brand-tint">
                      <feature.icon className="h-6 w-6 text-brand-strong" />
                    </div>
                    <CardTitle className="text-xl text-brand">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base text-accent">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-accent">
                          <CheckCircle className="h-4 w-4 mr-2 text-brand-strong" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
                Additional Benefits
              </h2>
              <p className="text-lg text-accent">
                Extra features that make your SafeIn management even better
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-tint">
                    <feature.icon className="h-5 w-5 text-brand-strong" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-brand">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-accent">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-hero-gradient">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your SafeIn Management?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust our platform for their SafeIn management needs.
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
