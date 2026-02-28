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
    ArrowRight,
    ShieldCheck,
    MessageSquare,
    Activity,
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
                <section className="bg-hero-gradient relative pt-20 pb-8 sm:pt-24 sm:pb-10 md:pt-32 md:pb-12">
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
                                    Revolutionize Your Workspace with Smart Visitor Intelligence
                                </h1>
                                <p className="mb-6 px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                    Secure your premises and enhance your corporate image with a sophisticated digital reception. SafeIn streamlines smart appointments, seamless walk-in registrations, and real-time security alerts for modern, productive office environments.
                                </p>

                                {/* 3 Day Trial Badge */}
                                <div className="bg-brand mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white sm:h-2 sm:w-2"></span>
                                    Enterprise-Grade Security
                                </div>
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
                                            Get Started Now
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
                                    src="/home/hero/Tranform-your-digital-visitor-management.jpg"
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


                {/* Comprehensive Feature Set */}
                <section className="bg-slate-50/50 py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <span className="mb-4 inline-block text-sm font-bold tracking-[0.2em] text-brand-strong uppercase">
                                Features
                            </span>
                            <h2 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Engineering the Digital Reception
                            </h2>
                            <p className="text-accent mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
                                Everything you need for professional visitor management in one powerful, 
                                enterprise-grade platform.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
                                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-50">
                                    <Image
                                        src="/home/features/feature-booking.png"
                                        alt="Smart Appointment Booking"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-brand mb-4 text-xl font-bold sm:text-2xl">Smart Appointment Booking</h3>
                                <p className="text-accent leading-relaxed">
                                    Schedule appointments, create shareable booking links, and manage visitors with
                                    automated notifications and calendar sync.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
                                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-50">
                                    <Image
                                        src="/home/features/feature-spotpass.png"
                                        alt="Spot Pass System"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-brand mb-4 text-xl font-bold sm:text-2xl">Spot Pass System</h3>
                                <p className="text-accent leading-relaxed">
                                    Handle walk-in visitors seamlessly with instant registration, QR scan entry, 
                                    and a streamlined check-in process.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
                                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-50">
                                    <Image
                                        src="/home/features/feature-chat.png"
                                        alt="Real-time Chat"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-brand mb-4 text-xl font-bold sm:text-2xl">Real-time Chat</h3>
                                <p className="text-accent leading-relaxed">
                                    Instant team communication and automated host-visitor bots for a 
                                    seamlessly connected office experience.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
                                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-50">
                                    <Image
                                        src="/home/features/feature-employees.png"
                                        alt="Employee Management"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-brand mb-4 text-xl font-bold sm:text-2xl">Employee Management</h3>
                                <p className="text-accent leading-relaxed">
                                    Comprehensive staff directory with bulk import, role-based access control, 
                                    and automated team onboarding.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
                                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-50">
                                    <Image
                                        src="/home/features/feature-security.png"
                                        alt="Security & Analytics"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-brand mb-4 text-xl font-bold sm:text-2xl">Security & Analytics</h3>
                                <p className="text-accent leading-relaxed">
                                    Advanced security monitoring, visitor pattern analysis, and deep-dive reports 
                                    for safety and compliance.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
                                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl bg-slate-50">
                                    <Image
                                        src="/home/features/feature-notifications.png"
                                        alt="Smart Notifications"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-brand mb-4 text-xl font-bold sm:text-2xl">Smart Notifications</h3>
                                <p className="text-accent leading-relaxed">
                                    Multi-channel alerts via WhatsApp, SMS, and push notifications to keep 
                                    hosts and visitors instantly informed.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works? Section */}
                <section className="bg-white py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <h2 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                How it works?
                            </h2>
                            <p className="text-accent mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
                                Our comprehensive SafeIn management platform is designed to meet the evolving needs of
                                modern organizations, providing security, efficiency, and peace of mind.
                            </p>
                        </div>

                        <div className="space-y-32">
                            {/* Solution 1: Seamless Entrance */}
                            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
                                <div className="relative">
                                    {/* Offset Background Blob */}
                                    <div className="absolute -left-6 -top-6 -z-10 h-full w-full rounded-3xl bg-blue-50/80 sm:-left-10 sm:-top-10"></div>
                                    <Image
                                        src="/home/solutions/smart-checkin.png"
                                        alt="Smart Digital Check-in"
                                        width={600}
                                        height={450}
                                        className="rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                                    />
                                </div>
                                <div className="lg:pr-8">
                                    <h3 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Empowering Workplace Efficiency
                                    </h3>
                                    <p className="text-accent mb-8 text-lg leading-relaxed">
                                        By automating the entrance process with smart check-ins and digital registration, 
                                        businesses gain valuable time and reduce front-desk friction. SafeIn allows 
                                        for seamless visitor transitions, ensuring every guest feels welcomed and secure.
                                    </p>
                                    <ul className="space-y-8">
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Smart check-in flow <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Visitors scan a unique QR code to register via their own smartphones, 
                                                eliminating queues and front-desk manual work.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Digital visitor logs <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Automated, searchable records of every entry and exit, replacing 
                                                traditional paper registers with secure, cloud-based data.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Entrance verification <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                OTP and host-approval based authentication to ensure only verified 
                                                individuals access your sensitive premises.
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Solution 2: Insightful Intelligence */}
                            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
                                <div className="order-2 lg:order-1 lg:pl-8">
                                    <h3 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Advanced Security Framework
                                    </h3>
                                    <p className="text-accent mb-8 text-lg leading-relaxed">
                                        Leverage powerful analytics to track footfall, peak hours, and security patterns. 
                                        Our real-time dashboard provides actionable insights into your workplace traffic, 
                                        enabling informed security decisions to optimize operations and drive safety.
                                    </p>
                                    <ul className="space-y-8">
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Real-time occupancy tracking <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Live monitoring of person counts inside your facility for safety, 
                                                emergency management, and social distancing compliance.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Visitor pattern analytics <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Visualize peak visitor times and busy days to optimize staff 
                                                coverage and security resource allocation.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Automated safety reports <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Detailed, scheduled audit trails for security managers to ensure 
                                                regulatory compliance with zero manual effort.
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                                <div className="relative order-1 lg:order-2">
                                    {/* Offset Background Blob */}
                                    <div className="absolute -right-6 -bottom-6 -z-10 h-full w-full rounded-3xl bg-orange-50/80 sm:-right-10 sm:-bottom-10"></div>
                                    <Image
                                        src="/home/solutions/realtime-analytics.png"
                                        alt="Advanced Workspace Analytics"
                                        width={600}
                                        height={450}
                                        className="rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                                    />
                                </div>
                            </div>

                            {/* Solution 3: Instant Connectivity */}
                            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
                                <div className="relative">
                                    {/* Offset Background Blob */}
                                    <div className="absolute -left-6 -bottom-6 -z-10 h-full w-full rounded-3xl bg-green-50/80 sm:-left-10 sm:-bottom-10"></div>
                                    <Image
                                        src="/home/solutions/smart-notifications.png"
                                        alt="Smart Notification System"
                                        width={600}
                                        height={450}
                                        className="rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                                    />
                                </div>
                                <div className="lg:pr-8">
                                    <h3 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Connected Digital Reception
                                    </h3>
                                    <p className="text-accent mb-8 text-lg leading-relaxed">
                                        Stay informed with intelligent alerts and real-time connectivity. SafeIn 
                                        bridges the gap between your visitors and staff with instant WhatsApp and 
                                        in-app notifications, ensuring a professional and timely reception for every guest.
                                    </p>
                                    <ul className="space-y-8">
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                WhatsApp arrival alerts <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Instant notifications sent to the host's WhatsApp for immediate 
                                                visitor arrival awareness, even without the app.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Proactive push notifications <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Real-time mobile alerts for staff to approve or reject visitors 
                                                on-the-go with a single tap.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-brand-strong font-semibold transition-colors hover:text-brand">
                                                Host-visitor internal messaging <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Secure direct messaging between staff and guests to coordinate arrival 
                                                details, delays, or emergency instructions.
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Industries Section */}
                <section className="bg-white py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <span className="mb-4 inline-block text-sm font-bold tracking-[0.2em] text-brand-strong uppercase">
                                Sectors
                            </span>
                            <h2 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Industries Trusting SafeIn
                            </h2>
                            <p className="text-accent mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
                                From IT Parks in Bangalore to Housing Societies in Mumbai, we secure every sector 
                                with India's most advanced visitor intelligence.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { 
                                    title: "Factories & Industrial", 
                                    desc: "Streamline workforce check-ins and visitor safety in large-scale manufacturing and industrial plants across India.", 
                                    img: "/home/industries/industry-it.png" // Using the previous IT image as a placeholder for now
                                },
                                { 
                                    title: "Housing Societies", 
                                    desc: "The ultimate digital gatekeeper for modern residential apartment complexes.", 
                                    img: "/home/industries/industry-housing.png" 
                                },
                                { 
                                    title: "Educational Institutes", 
                                    desc: "Secure school and university campuses with smart student and faculty tracking.", 
                                    img: "/home/industries/industry-education.png" 
                                },
                                { 
                                    title: "Healthcare Centers", 
                                    desc: "Efficiently manage patient attendants and visitor flow in world-class medical centers.", 
                                    img: "/home/hero/Tranform-your-digital-visitor-management.jpg" // Using existing dashboard img for now as it looks professional
                                }
                            ].map((industry, i) => (
                                <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                                    <div className="relative h-56 w-full overflow-hidden">
                                        <Image
                                            src={industry.img}
                                            alt={industry.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-brand mb-3 text-xl font-bold sm:text-2xl">{industry.title}</h3>
                                        <p className="text-accent text-sm leading-relaxed md:text-base">{industry.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="bg-white py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <span className="mb-4 inline-block text-sm font-bold tracking-[0.2em] text-brand uppercase">
                                Testimonials
                            </span>
                            <h2 className="text-brand mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Trusted by Industry Leaders
                            </h2>
                            <p className="text-accent mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
                                Join 1000+ businesses across top Indian cities securing their premises 
                                with our sophisticated management suite.
                            </p>
                        </div>

                        <div className="grid gap-10 md:grid-cols-3">
                            {/* Testimonial 1 */}
                            <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10">
                                <div className="mb-6 flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                                    ))}
                                </div>
                                <p className="mb-8 flex-grow text-lg leading-relaxed text-gray-700 italic">
                                    "The SafeIn management system has transformed our security operations in our Delhi office. 
                                    Setup was incredibly easy and the support team is outstanding."
                                </p>
                                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                    <Image
                                        src="/home/hero/avatar-1.png"
                                        alt="Amit Kumar"
                                        width={48}
                                        height={48}
                                        className="rounded-full shadow-md"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">Amit Kumar</p>
                                        <p className="text-sm text-gray-500">Security Manager, IT Park</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 2 */}
                            <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10">
                                <div className="mb-6 flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                                    ))}
                                </div>
                                <p className="mb-8 flex-grow text-lg leading-relaxed text-gray-700 italic">
                                    "Excellent platform for housing societies. The analytics help us understand
                                    visitor patterns and improve our security measures significantly in Mumbai."
                                </p>
                                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                    <Image
                                        src="/home/hero/avatar-2.png"
                                        alt="Priya Sharma"
                                        width={48}
                                        height={48}
                                        className="rounded-full shadow-md"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">Priya Sharma</p>
                                        <p className="text-sm text-gray-500">Secretary, Green Valley</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 3 */}
                            <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10">
                                <div className="mb-6 flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                                    ))}
                                </div>
                                <p className="mb-8 flex-grow text-lg leading-relaxed text-gray-700 italic">
                                    "Professional service and reliable platform. Our visitors in Bangalore love the 
                                    streamlined check-in process and our team appreciates the high efficiency."
                                </p>
                                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                    <Image
                                        src="/home/hero/avatar-3.png"
                                        alt="Rahul Mehta"
                                        width={48}
                                        height={48}
                                        className="rounded-full shadow-md"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">Rahul Mehta</p>
                                        <p className="text-sm text-gray-500">Operations Head, Tech Hub</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Contact Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#074463] via-[#0a5a82] to-[#074463] pt-24 pb-12 sm:pt-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
                                Let's Secure Your Workspace
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-200 sm:text-xl">
                                Ready to transform your digital reception? Our experts are standing by to 
                                help you choose the perfect solution for your organization.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
                            <div className="relative">
                                <h3 className="mb-10 text-2xl font-bold text-white sm:text-3xl">Contact Information</h3>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
                                            <Clock className="text-brand h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white">Working Hours</p>
                                            <p className="text-gray-300">Mon-Fri: 9:00 AM - 6:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
                                            <Mail className="text-brand h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white">Email Support</p>
                                            <p className="text-gray-300">support@aynzo.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
                                            <Phone className="text-brand h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white">Direct Line</p>
                                            <p className="text-gray-300">+91 86999 66076</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/15 sm:p-12">
                                <h3 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Get in Touch</h3>
                                <p className="mb-10 text-lg leading-relaxed text-gray-200">
                                    Start your journey toward a smarter, safer workspace today. Contact 
                                    our specialist team for a personalized walkthrough.
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Button size="lg" className="bg-brand w-full text-white shadow-lg sm:w-auto sm:px-10" asChild>
                                        <Link href={routes.publicroute.CONTACT}>Contact Us Now</Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="bg-transparent w-full border-white text-white hover:bg-white hover:text-brand sm:w-auto sm:px-10"
                                        asChild
                                    >
                                        <Link href={routes.publicroute.PRICING}>View Pricing</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Subtle Background Accent */}
                    <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl"></div>
                </section>
            </PublicLayout>
        </>
    );
}
