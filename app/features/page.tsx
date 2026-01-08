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
} from "lucide-react";
import { routes } from "@/utils/routes";
import { PublicLayout } from "@/components/layout/publicLayout";
import Link from "next/link";
import { PageSEOHead } from "@/components/seo/pageSEOHead";

export default function FeaturesPage() {
    const features = [
        {
            icon: Calendar,
            title: "Appointment Management",
            description:
                "Schedule, manage, and track visitor appointments with ease. Automated email notifications keep everyone informed.",
            benefits: [
                "Online booking system",
                "Appointment scheduling",
                "Automated email reminders",
                "Appointment history tracking",
            ],
        },
        {
            icon: Users,
            title: "Visitor Registration",
            description:
                "Streamline visitor check-in process with digital registration forms and instant email notifications to hosts.",
            benefits: [
                "Digital visitor registration",
                "Visitor information management",
                "Host notifications",
                "Visitor tracking",
            ],
        },
        {
            icon: Shield,
            title: "Security & Access Control",
            description: "Enhanced security with visitor tracking, access logs, and comprehensive visitor management.",
            benefits: ["Visitor access logs", "Security monitoring", "Visitor history", "Role-based access control"],
        },
        {
            icon: Users,
            title: "Employee Management",
            description: "Manage your team with comprehensive employee directory and role-based permissions.",
            benefits: ["Employee directory", "Role management", "Team organization", "Access permissions"],
        },
        {
            icon: BarChart3,
            title: "Dashboard & Analytics",
            description: "Comprehensive dashboard with insights into visitor patterns and appointment statistics.",
            benefits: ["Real-time dashboard", "Visitor analytics", "Appointment tracking", "Activity monitoring"],
        },
        {
            icon: Smartphone,
            title: "Mobile Responsive",
            description:
                "Access your visitor management system from any device with our fully responsive web application.",
            benefits: ["Mobile optimized", "Tablet friendly", "Cross-platform access", "Responsive design"],
        },
    ];

    const additionalFeatures = [
        {
            icon: Clock,
            title: "Real-time Updates",
            description:
                "Get instant updates on visitor status, appointment changes, and system notifications via email.",
        },
        {
            icon: CheckCircle,
            title: "Easy to Use",
            description: "Intuitive interface designed for ease of use with minimal training required.",
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
            description: "Your data is protected with secure storage and authentication mechanisms.",
        },
        {
            icon: Bell,
            title: "Email Notifications",
            description: "Automated email notifications for appointments, visitor arrivals, and system updates.",
        },
    ];

    return (
        <>
            <PageSEOHead
                title="Features"
                description="Discover SafeIn's powerful features for visitor management, appointment scheduling, and security analytics."
                keywords={[
                    "features",
                    "capabilities",
                    "visitor management features",
                    "appointment system features",
                    "SafeIn features",
                    "security features",
                ]}
                url="https://safein.aynzo.com/features"
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section */}
                    <section className="bg-hero-gradient px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                        <div className="container mx-auto text-center">
                            <h1 className="mb-4 px-2 text-2xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                                Powerful Features for Modern SafeIn Management
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Discover how our comprehensive SafeIn management system can transform your business
                                operations with cutting-edge features designed for efficiency and security.
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
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">Core Features</h2>
                                <p className="text-accent text-lg">
                                    Everything you need to manage visitors professionally and efficiently
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature, index) => (
                                    <Card key={index} className="transition-shadow duration-300 hover:shadow-lg">
                                        <CardHeader>
                                            <div className="bg-brand-tint mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                                <feature.icon className="text-brand-strong h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-brand text-xl">{feature.title}</CardTitle>
                                            <CardDescription className="text-accent text-base">
                                                {feature.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {feature.benefits.map((benefit, benefitIndex) => (
                                                    <li
                                                        key={benefitIndex}
                                                        className="text-accent flex items-center text-sm"
                                                    >
                                                        <CheckCircle className="text-brand-strong mr-2 h-4 w-4" />
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
                    <section className="bg-white px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">
                                    Additional Benefits
                                </h2>
                                <p className="text-accent text-lg">
                                    Extra features that make your SafeIn management even better
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {additionalFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start space-x-4 rounded-lg bg-white p-6 shadow-sm"
                                    >
                                        <div className="bg-brand-tint flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                                            <feature.icon className="text-brand-strong h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-brand mb-2 font-semibold">{feature.title}</h3>
                                            <p className="text-accent text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-hero-gradient px-4 py-20">
                        <div className="container mx-auto text-center">
                            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
                                Ready to Transform Your SafeIn Management?
                            </h2>
                            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                                Join thousands of businesses that trust our platform for their SafeIn management needs.
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
