"use client";

import { useEffect, useState } from "react";
import { routes } from "@/utils/routes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/publicLayout";
import {
    Calendar,
    Users,
    Shield,
    Clock,
    CheckCircle,
    UserCheck,
    Building2,
    Globe,
    Award,
    Heart,
    Zap,
    Star,
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    Download,
    Play,
    ChevronRight,
    BarChart3,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { generateStructuredData } from "@/lib/seoHelpers";

export default function HomePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);

    const [isClient, setIsClient] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsClient(true);
        dispatch(initializeAuth());
        setIsInitialized(true);
    }, [dispatch]);

    const handleHeroFreeTrialClick = () => {
        // Hero free trial – send user to register page
        if (!isAuthenticated) {
            router.push(routes.publicroute.REGISTER);
        } else {
            router.push(routes.privateroute.DASHBOARD);
        }
    };

    const homeStructuredData = generateStructuredData("home");

    return (
        <>
            <PageSEOHead
                title="Best Visitor Management System in India | SafeIn by Aynzo"
                description="SafeIn is India's leading visitor management system. Features: Real-time chat, Spot Pass for walk-ins, Smart Appointment Links, Bulk Import for India & advanced security analytics. Start your free trial today!"
                keywords={[
                    "best visitor management system in india",
                    "gatekeeper app india",
                    "society visitor management software india",
                    "smart appointment system india",
                    "visitor check-in system india",
                    "digital visitor register india",
                    "SafeIn India",
                    "Aynzo",
                ]}
                url="https://safein.aynzo.com"
                structuredData={homeStructuredData}
            />
            <PublicLayout>
                {/* Hero Section */}
                <section className="bg-hero-gradient relative py-12 sm:py-16 md:py-20">
                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Left Side - Main Content */}
                            <div className="text-center lg:text-left">
                                <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-6 lg:justify-start">
                                    <Star className="h-4 w-4 fill-current text-yellow-400 sm:h-5 sm:w-5" />
                                    <span className="text-sm font-semibold text-yellow-400 sm:text-base">
                                        4.9/5 Rating
                                    </span>
                                    <span className="hidden text-gray-300 sm:inline">•</span>
                                    <span className="text-sm text-gray-300 sm:text-base">1000+ Happy Clients</span>
                                </div>
                                <h1 className="animate-hero-title mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                    Transform Your Visitor Management with SafeIn
                                </h1>
                                <p className="mb-6 px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                    Transform your visitor management with smart appointments, real-time chat, spot
                                    pass for walk-ins, and intelligent notifications. Get your complete visitor
                                    management system with our free 3-day trial.
                                </p>

                                {/* 3 Day Trial Badge */}
                                <div className="bg-brand mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white sm:h-2 sm:w-2"></span>
                                    FREE 3-Day Trial
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4 lg:justify-start">
                                    {isAuthenticated && token ? (
                                        <Button
                                            size="lg"
                                            className="bg-brand w-full px-6 py-2.5 text-sm font-semibold text-white sm:w-auto sm:px-8 sm:py-3 sm:text-base"
                                            asChild
                                        >
                                            <Link href={routes.privateroute.DASHBOARD}>My Account</Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="bg-brand w-full px-6 py-2.5 text-sm font-semibold text-white sm:w-auto sm:px-8 sm:py-3 sm:text-base"
                                            onClick={handleHeroFreeTrialClick}
                                        >
                                            Start 3 Day Trial
                                        </Button>
                                    )}
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

                            {/* Right Side - Animated Dashboard Preview (using original image) */}
                            <div className="relative order-first mt-8 lg:order-last lg:mt-0 lg:ml-auto lg:max-w-[434px]">
                                <div className="absolute -inset-4 rounded-2xl bg-white/40 opacity-30 blur-3xl sm:-inset-6"></div>
                                <Image
                                    src="/home/Tranform-your-digital-visitor-management.jpg"
                                    alt="Transform Your Digital Visitor Management"
                                    width={364}
                                    height={224}
                                    className="dash-glow animate-float-slow h-auto w-full rounded-full shadow-2xl"
                                    priority
                                />
                                <div className="absolute -bottom-3 -left-3 max-w-[200px] rounded-lg border border-white/40 bg-white/90 p-2 shadow-lg backdrop-blur-sm sm:-bottom-5 sm:-left-5 sm:max-w-none sm:p-3">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-10 sm:w-10">
                                            <CheckCircle className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                                                Live dashboard preview
                                            </p>
                                            <p className="hidden text-xs text-gray-600 sm:block">
                                                What your team will see
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Service Highlights */}
                <section className="bg-white py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-brand mb-4 text-3xl font-bold md:text-4xl">
                                Comprehensive Feature Set
                            </h2>
                            <p className="text-accent mx-auto max-w-2xl text-lg">
                                Everything you need for professional visitor management in one powerful platform
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="text-center transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="bg-brand-tint mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <Calendar className="text-brand-strong h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Smart Appointment Booking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600">
                                        Schedule appointments, create shareable booking links, and manage visitors with
                                        automated notifications
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="bg-brand-tint mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <UserCheck className="text-brand-strong h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Spot Pass System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600">
                                        Handle walk-in visitors seamlessly with instant registration and quick check-in
                                        process
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="bg-brand-tint mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <MessageCircle className="text-brand-strong h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Real-time Chat</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600">
                                        Instant team communication and 24/7 support chat for seamless collaboration
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="bg-brand-tint mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <Users className="text-brand-strong h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Employee Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600">
                                        Comprehensive staff directory with bulk import, role-based access, and team
                                        management
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="bg-brand-tint mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <Shield className="text-brand-strong h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Security & Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600">
                                        Advanced security monitoring, visitor pattern analysis, and comprehensive reports
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="bg-brand-tint mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <Bell className="text-brand-strong h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-xl">Smart Notifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600">
                                        Multi-channel alerts with email, toast notifications, and voice announcements
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Smart Solutions Section */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-brand mb-6 text-4xl font-bold md:text-5xl">
                                Smart Solutions for Modern Businesses
                            </h2>
                            <p className="text-accent mx-auto max-w-3xl text-xl">
                                Our comprehensive SafeIn management platform is designed to meet the evolving needs of
                                modern organizations, providing security, efficiency, and peace of mind.
                            </p>
                        </div>

                        {/* Process Steps with Screenshots */}
                        <div className="space-y-16">
                            {/* Step 1: Registration */}
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div className="order-2 lg:order-1">
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                                            1
                                        </div>
                                        <h3 className="text-brand text-3xl font-bold">Quick Registration</h3>
                                    </div>
                                    <p className="text-accent mb-6 text-lg">
                                        Sign up in seconds with our streamlined registration process. Just provide your
                                        basic information and you're ready to start managing visitors professionally.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-brand text-base font-medium">
                                                No complex forms or lengthy verification
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-brand text-base font-medium">
                                                Instant account activation
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-brand text-base font-medium">
                                                Free 3-day trial included
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="image-pop-group relative order-1 lg:order-2">
                                    <Image
                                        src="/home/quick-registeration.jpg"
                                        alt="Quick Registration Process"
                                        width={420}
                                        height={280}
                                        className="group-image-pop rounded-full shadow-xl"
                                    />
                                    <div className="absolute -right-4 -bottom-4 rounded-lg border border-slate-200 bg-white p-2 shadow-md">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                            <span className="text-brand text-sm font-medium">
                                                Registration Complete
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Dashboard Setup */}
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div className="image-pop-group relative">
                                    <Image
                                        src="/home/powerful-dashboard.jpg"
                                        alt="Powerful Dashboard Analytics"
                                        width={420}
                                        height={280}
                                        className="group-image-pop rounded-full shadow-xl"
                                    />
                                    <div className="absolute -top-4 -left-4 rounded-lg bg-white p-3 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="text-brand-strong h-4 w-4" />
                                            <span className="text-sm font-semibold" style={{ color: "#161718" }}>
                                                Real-time Analytics
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                                            2
                                        </div>
                                        <h3 className="text-brand text-3xl font-bold">Powerful Dashboard</h3>
                                    </div>
                                    <p className="text-accent mb-6 text-lg">
                                        Access your comprehensive dashboard with real-time visitor analytics,
                                        appointment management, and security insights all in one place.
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
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div className="order-2 lg:order-1">
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                                            3
                                        </div>
                                        <h3 className="text-brand text-3xl font-bold">Easy Appointment Booking</h3>
                                    </div>
                                    <p className="text-accent mb-6 text-lg">
                                        Create and manage SafeIn appointments with our intuitive booking system.
                                        Streamline your SafeIn management process with automated notifications and
                                        scheduling.
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
                                <div className="image-pop-group relative order-1 lg:order-2">
                                    <Image
                                        src="/home/easyappointment.jpg"
                                        alt="Easy Appointment Booking System"
                                        width={420}
                                        height={280}
                                        className="group-image-pop rounded-full shadow-xl"
                                    />
                                    <div className="absolute -right-4 -bottom-4 rounded-lg border border-slate-200 bg-white p-2 shadow-md">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-brand-strong h-4 w-4" />
                                            <span className="text-brand text-sm font-medium">
                                                Appointment Scheduled
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Staff Management */}
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div className="image-pop-group relative">
                                    <Image
                                        src="/home/complete-team-control.jpg"
                                        alt="Complete Team Control"
                                        width={420}
                                        height={280}
                                        className="group-image-pop rounded-full shadow-xl"
                                    />
                                    <div className="absolute -top-4 -left-4 rounded-lg bg-white p-3 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Users className="text-brand-strong h-4 w-4" />
                                            <span className="text-brand text-sm font-medium">Team Management</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                                            4
                                        </div>
                                        <h3 className="text-brand text-3xl font-bold">Complete Team Control</h3>
                                    </div>
                                    <p className="text-accent mb-6 text-lg">
                                        Manage your entire team with role-based access control, employee directories,
                                        and comprehensive staff management tools.
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

                {/* Why Choose Us Section */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-10 text-center">
                            <h2 className="text-brand mb-4 text-4xl font-bold md:text-5xl">Why Choose SafeIn?</h2>
                            <p className="text-accent mx-auto max-w-3xl text-lg md:text-xl">
                                We're committed to providing the best visitor management solution with unmatched
                                security and reliability.
                            </p>
                        </div>

                        <div className="mb-6 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="text-center">
                                <div className="bg-brand mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-brand mb-1 text-xl font-semibold">Fast Setup</h3>
                                <p className="text-accent text-sm md:text-base">Get started in minutes, not days</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-brand mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-brand mb-1 text-xl font-semibold">Secure</h3>
                                <p className="text-accent text-sm md:text-base">Enterprise-grade security</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-brand mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-brand mb-1 text-xl font-semibold">Expert Support</h3>
                                <p className="text-accent text-sm md:text-base">24/7 customer assistance</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-brand mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-brand mb-1 text-xl font-semibold">Always Available</h3>
                                <p className="text-accent text-sm md:text-base">99.9% uptime guarantee</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Industries Section */}
                <section className="bg-gray-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-brand mb-6 text-3xl font-bold md:text-4xl">
                                Industries Trusting SafeIn in India
                            </h2>
                            <p className="text-accent mx-auto max-w-2xl text-lg">
                                From IT Parks in Bangalore to Housing Societies in Mumbai, we secure every sector with the best visitor management system.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { title: "IT Parks & Offices", desc: "Manage corporate visitors and employee attendance in Delhi, Noida & Gurgaon IT hubs." },
                                { title: "Housing Societies", desc: "The perfect gatekeeper app for residential complexes in Mumbai, Pune & Bangalore." },
                                { title: "Educational Institutes", desc: "Secure school and college campuses with smart student and visitor tracking." },
                                { title: "Hospitals & Healthcare", desc: "Efficiently manage patient attendants and visitor flow in busy medical centers." }
                            ].map((industry, i) => (
                                <Card key={i} className="hover:border-primary transition-colors bg-white">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold">{industry.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 text-sm">{industry.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-brand mb-6 text-3xl font-bold md:text-4xl text-center">
                                What Our Clients in India Say
                            </h2>
                            <p className="text-accent text-xl text-center">
                                Join 1000+ businesses across top Indian cities securing their premises.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <Card className="bg-white border-2 hover:border-brand transition-all shadow-sm">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="mb-4 text-gray-700 italic">
                                        "The SafeIn management system has transformed our security operations in our Delhi office. Setup was
                                        incredibly easy and the support team is outstanding."
                                    </p>
                                    <div className="flex items-center gap-3 border-t pt-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
                                            AK
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Amit Kumar</p>
                                            <p className="text-xs text-gray-500">Security Manager, IT Park</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-2 hover:border-brand transition-all shadow-sm">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="mb-4 text-gray-700 italic">
                                        "Excellent platform for housing societies. The analytics help us understand
                                        visitor patterns and improve our security measures significantly in Mumbai."
                                    </p>
                                    <div className="flex items-center gap-3 border-t pt-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-semibold text-white">
                                            PS
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Priya Sharma</p>
                                            <p className="text-xs text-gray-500">Secretary, Green Valley Society</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-2 hover:border-brand transition-all shadow-sm">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="mb-4 text-gray-700 italic">
                                        "Professional service and reliable platform. Our visitors in Bangalore love the streamlined
                                        check-in process and our team appreciates the high efficiency."
                                    </p>
                                    <div className="flex items-center gap-3 border-t pt-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 font-semibold text-white">
                                            RM
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Rahul Mehta</p>
                                            <p className="text-xs text-gray-500">Operations Head, Tech Hub</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>


                {/* Contact Section */}
                <section className="bg-[#074463] pt-20 pb-8">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Get in Touch with Us</h2>
                            <p className="mx-auto max-w-3xl text-xl text-gray-300">
                                Have questions? Our expert team is here to help you choose the perfect solution for your
                                needs.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                            <div>
                                <h3 className="mb-6 text-2xl font-semibold">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Working Hours</p>
                                            <p className="text-gray-300">Mon-Fri: 9:00 AM - 6:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full">
                                            <Mail className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Email</p>
                                            <p className="text-gray-300">support@aynzo.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full">
                                            <Phone className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Phone</p>
                                            <p className="text-gray-300">+91 86999 66076</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <h3 className="mb-6 text-2xl font-semibold text-white">Get in Touch</h3>
                                    <p className="mb-6 text-white">
                                        Ready to transform your SafeIn management? Contact our team to learn more about
                                        our solutions.
                                    </p>
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <Button className="bg-brand text-white" asChild>
                                            <Link href={routes.publicroute.CONTACT}>Contact Us</Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-white text-gray-900 hover:bg-white hover:text-gray-900"
                                            asChild
                                        >
                                            <Link href={routes.publicroute.PRICING}>View Pricing</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
