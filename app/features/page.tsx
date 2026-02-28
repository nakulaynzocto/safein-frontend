"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    Lock,
    MessageCircle,
    Link2,
    Upload,
    UserCheck,
    Volume2,
    FileSpreadsheet,
} from "lucide-react";
import { routes } from "@/utils/routes";
import { PublicLayout } from "@/components/layout/publicLayout";
import Link from "next/link";
import { PageSEOHead } from "@/components/seo/pageSEOHead";

export default function FeaturesPage() {
    const features = [
        {
            icon: Calendar,
            title: "Smart Appointment Management",
            description:
                "Schedule, manage, and track visitor appointments with ease. Create shareable booking links and automated email notifications.",
            benefits: [
                "Online booking system",
                "Shareable appointment links",
                "Automated email reminders",
                "Appointment history tracking",
            ],
        },
        {
            icon: UserCheck,
            title: "Spot Pass - Walk-in Management",
            description:
                "Handle unexpected visitors seamlessly with our Spot Pass system. Quick registration for walk-in visitors without prior appointments.",
            benefits: [
                "Instant visitor registration",
                "Quick check-in process",
                "Real-time host notifications",
                "Walk-in visitor tracking",
            ],
        },
        {
            icon: MessageCircle,
            title: "Real-time Chat System",
            description:
                "Connect instantly with team members and get 24/7 support. Internal messaging for employees and dedicated support chat for assistance.",
            benefits: [
                "Employee-to-employee chat",
                "24/7 support chat",
                "Real-time messaging",
                "File sharing support",
            ],
        },
        {
            icon: Link2,
            title: "Appointment Links",
            description:
                "Create and share personalized booking links. Let visitors schedule appointments directly without needing system access.",
            benefits: [
                "Generate shareable links",
                "Custom link URLs",
                "Track link performance",
                "Quick visitor bookings",
            ],
        },
        {
            icon: Upload,
            title: "Bulk Import & Export",
            description:
                "Save time with CSV bulk operations for employee onboarding and comprehensive data export capabilities for reporting.",
            benefits: [
                "CSV import for employees",
                "Data export for reports",
                "Visitor data export",
                "Template downloads",
            ],
        },
        {
            icon: Volume2,
            title: "Smart Notifications",
            description:
                "Never miss important updates with our multi-channel notification system. Visual toasts, voice alerts, and email notifications.",
            benefits: [
                "Voice alerts for critical events",
                "Toast notifications",
                "Email notifications",
                "Real-time updates",
            ],
        },
        {
            icon: Users,
            title: "Advanced Employee Management",
            description:
                "Comprehensive team management with role-based permissions, bulk operations, and detailed employee profiles.",
            benefits: [
                "Role-based access control",
                "Bulk employee import",
                "Employee directory",
                "Access permissions",
            ],
        },
        {
            icon: Shield,
            title: "Security & Access Control",
            description:
                "Enterprise-grade security with visitor tracking, access logs, and comprehensive visitor management.",
            benefits: [
                "Visitor access logs",
                "Security monitoring",
                "Visitor history",
                "Spot pass verification",
            ],
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics Dashboard",
            description:
                "Comprehensive dashboard with real-time insights, visitor patterns, appointment statistics, and detailed reports.",
            benefits: [
                "Real-time dashboard",
                "Visitor pattern analysis",
                "Appointment statistics",
                "Custom reports",
            ],
        },
        {
            icon: Bell,
            title: "Multi-Channel Notifications",
            description:
                "Stay informed with email, in-app, and voice notifications for appointments, visitor arrivals, and system updates.",
            benefits: [
                "Email notifications",
                "In-app alerts",
                "Voice announcements",
                "Custom notification rules",
            ],
        },
        {
            icon: FileSpreadsheet,
            title: "Reports & Export",
            description:
                "Generate detailed reports and export data in multiple formats. Track visitor trends and appointment analytics.",
            benefits: [
                "Attendance reports",
                "Visitor analytics",
                "CSV/Excel export",
                "Custom date ranges",
            ],
        },
        {
            icon: Smartphone,
            title: "Mobile Responsive",
            description:
                "Access your visitor management system from any device with our fully responsive design optimized for mobile.",
            benefits: [
                "Mobile optimized",
                "Tablet friendly",
                "Cross-platform access",
                "Responsive design",
            ],
        },
    ];

    const additionalFeatures = [
        {
            icon: Clock,
            title: "Real-time Updates",
            description:
                "Get instant updates on visitor status, appointment changes, and system notifications via multiple channels.",
        },
        {
            icon: CheckCircle,
            title: "Easy to Use",
            description:
                "Intuitive interface designed for ease of use with minimal training required. Built for efficiency.",
        },
        {
            icon: Zap,
            title: "Fast Setup",
            description:
                "Get your visitor management system up and running in minutes with our streamlined setup process.",
        },
        {
            icon: Lock,
            title: "Secure Data Storage",
            description:
                "Your data is protected with enterprise-grade security, encrypted storage, and secure authentication.",
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description:
                "Built-in chat system enables seamless communication between team members for better coordination.",
        },
        {
            icon: BarChart3,
            title: "Powerful Analytics",
            description:
                "Track visitor patterns, appointment trends, and generate insights to improve your operations.",
        },
    ];

    return (
        <>
            <PageSEOHead
                title="SafeIn Features - Smart Visitor Management & Security India"
                description="Explore powerful features of SafeIn for Indian businesses: Real-time chat, Spot Pass for societies, Smart Notifications, and Advanced Analytics. The best visitor management system features in India."
                keywords={[
                    "safein features india",
                    "visitor management capabilities",
                    "spot pass system india",
                    "gatekeeper app features",
                    "visitor analytics india",
                    "smart security notifications",
                    "bulk import employees india",
                ]}
                url="https://safein.aynzo.com/features"
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section */}
                    <section className="bg-hero-gradient relative pt-20 pb-8 sm:pt-24 sm:pb-10 md:pt-32 md:pb-12">
                        <div className="container mx-auto px-4 sm:px-6 text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                Powerful Features for Modern Visitor Management
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Transform your business operations with our comprehensive visitor management system.
                                Real-time chat, smart notifications, bulk operations, and advanced analytics - all in
                                one platform.
                            </p>
                            <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row sm:gap-4 sm:px-0">
                                <Button
                                    size="lg"
                                    className="bg-brand w-full px-6 py-2.5 text-sm text-white sm:w-auto sm:px-8 sm:py-3 sm:text-base"
                                    asChild
                                >
                                    <Link href={routes.publicroute.REGISTER}>Start 3 Day Trial</Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full border-white px-6 py-2.5 text-sm text-gray-900 hover:bg-white hover:text-gray-900 sm:w-auto sm:px-8 sm:py-3 sm:text-base"
                                    asChild
                                >
                                    <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Main Features */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">
                                    Complete Feature Set
                                </h2>
                                <p className="text-accent text-lg">
                                    Everything you need to manage visitors professionally and efficiently
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature, index) => (
                                    <Card
                                        key={index}
                                        className="relative transition-shadow duration-300 hover:shadow-lg border-gray-100"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-brand text-2xl mb-2">{feature.title}</CardTitle>
                                            <CardDescription className="text-accent text-base leading-relaxed">
                                                {feature.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {feature.benefits.map((benefit, benefitIndex) => (
                                                    <li
                                                        key={benefitIndex}
                                                        className="text-accent flex items-start text-sm"
                                                    >
                                                        <span className="bg-brand-strong mt-1.5 mr-3 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
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
                    <section className="bg-slate-50/50 px-4 py-20 font-sans">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">
                                    Additional Benefits
                                </h2>
                                <p className="text-accent text-lg">
                                    Extra features that make your visitor management even better
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {additionalFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-gray-100"
                                    >
                                        <div>
                                            <h3 className="text-brand mb-3 text-lg font-bold">{feature.title}</h3>
                                            <p className="text-accent text-sm leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Feature Highlights */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">
                                    What Makes Us Different
                                </h2>
                            </div>

                            <div className="grid gap-12 lg:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-semibold">
                                            1
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 text-xl font-semibold">
                                                Real-time Communication
                                            </h3>
                                            <p className="text-accent">
                                                Built-in chat system for instant team collaboration and 24/7 support
                                                access. Stay connected with your team and get help when you need it.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-semibold">
                                            2
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 text-xl font-semibold">
                                                Flexible Visitor Management
                                            </h3>
                                            <p className="text-accent">
                                                Handle both pre-scheduled appointments and unexpected walk-ins with Spot
                                                Pass. Share booking links for hassle-free scheduling.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-semibold">
                                            3
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 text-xl font-semibold">
                                                Smart Automation
                                            </h3>
                                            <p className="text-accent">
                                                Bulk import employees and visitors, automated email notifications, voice
                                                alerts for critical events, and intelligent scheduling.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-semibold">
                                            4
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 text-xl font-semibold">
                                                Advanced Analytics
                                            </h3>
                                            <p className="text-accent">
                                                Comprehensive dashboards with visitor patterns, appointment trends, and
                                                detailed reports to optimize your operations.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-semibold">
                                            5
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 text-xl font-semibold">
                                                Multi-Level Notifications
                                            </h3>
                                            <p className="text-accent">
                                                Never miss important updates with email, toast notifications, and voice
                                                alerts. Customizable notification preferences for each user.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-semibold">
                                            6
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 text-xl font-semibold">
                                                Enterprise Security
                                            </h3>
                                            <p className="text-accent">
                                                Role-based access control, encrypted data storage, comprehensive audit
                                                logs, and secure authentication mechanisms.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-[#074463] px-4 pt-20 pb-8">
                        <div className="container mx-auto text-center">
                            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
                                Ready to Transform Your Visitor Management?
                            </h2>
                            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                                Join thousands of businesses that trust our platform for their visitor management
                                needs. Start your 3-day free trial today!
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
        </>
    );
}
