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
    UserCircle,
    Scan,
    FileOutput,
    CheckSquare,
    DoorOpen,
    Smartphone,
    Laptop,
} from "lucide-react";
import Link from "next/link";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { generateStructuredData } from "@/lib/seoHelpers";
import { cn } from "@/lib/utils";

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

    const processSteps = [
        {
            id: 1,
            title: "Visitor Arrival",
            description: "Visitor enters their details at the sleek digital kiosk or pre-registers online.",
            image: "/home/solutions/smart-checkin.png",
            badge: "Secure Arrival",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 2,
            title: "Digital Registration",
            description: "Fast, paperless registration via smartphone or reception iPad.",
            image: "/home/solutions/quick-registeration.jpg",
            badge: "No Paperwork",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 3,
            title: "Instant Alerts",
            description: "Hosts receive real-time notifications on WhatsApp and Email.",
            image: "/home/solutions/smart-notifications.png",
            badge: "Instant Sync",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 4,
            title: "Admin Approval",
            description: "One-click approval from the employee's powerful dashboard.",
            image: "/home/solutions/powerful-dashboard.jpg",
            badge: "Secure Access",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 5,
            title: "Security Verification",
            description: "Gatekeeper verifies the 6-digit secure OTP for final check-in.",
            image: "/home/hero/Tranform-your-digital-visitor-management.jpg",
            badge: "Verified OTP",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 6,
            title: "Access Granted",
            description: "Visual analytics track every successful arrival and departure.",
            image: "/home/solutions/realtime-analytics.png",
            badge: "Welcome In",
            color: "from-[#074463] to-[#3882a5]"
        }
    ];

    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % processSteps.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [processSteps.length]);

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
                <section className="bg-hero-gradient relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-24 -mt-24 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-[400px] w-[400px] rounded-full bg-brand-light/10 blur-[100px]"></div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                            {/* Right Side - Premium Visual Asset (Moved up for mobile) */}
                            <div className="relative order-1 lg:order-2">

                                {/* Main Hero Visual Asset - Phone Mockup Style */}
                                <div className="relative mx-auto max-w-[280px] sm:max-w-[340px] lg:ml-auto">
                                    {/* Ambient Glow */}
                                    <div className={`absolute -inset-10 rounded-full bg-gradient-to-br ${processSteps[activeStep].color} opacity-20 blur-[100px] transition-all duration-1000`}></div>
                                    
                                    {/* Smartphone Frame Mockup */}
                                    <div className="relative z-10 mx-auto w-full overflow-hidden rounded-[3rem] sm:rounded-[3.5rem] border-[6px] sm:border-[8px] border-gray-950 bg-gray-950 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_0_2px_rgba(255,255,255,0.1)] ring-1 ring-white/10">
                                        {/* Dynamic Island / Notch */}
                                        <div className="absolute top-0 left-1/2 z-40 h-5 sm:h-7 w-20 sm:w-28 -translate-x-1/2 rounded-b-2xl bg-gray-950"></div>
                                        
                                        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[2.5rem] sm:rounded-[2.8rem] bg-gray-950">
                                            {/* Process Images - Enhanced Alignment */}
                                            {processSteps.map((step, idx) => (
                                                <div 
                                                    key={step.id}
                                                    className={cn(
                                                        "absolute inset-0 transition-opacity duration-1000",
                                                        idx === activeStep ? "opacity-100" : "opacity-0"
                                                    )}
                                                >
                                                    <Image
                                                        src={step.image}
                                                        alt={step.title}
                                                        fill
                                                        className="object-cover object-top"
                                                        priority={idx === 0}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Left Side - Main Content (Moved down for mobile) */}
                            <div className="text-center lg:text-left order-2 lg:order-1">
                                <div className="mb-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                                    <div className="badge-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all hover:bg-white/10">
                                        <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
                                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">4.9/5 Rating</span>
                                    </div>
                                    <div className="badge-glass rounded-full px-3 py-1.5 text-[11px] font-bold text-gray-200 uppercase tracking-wider">
                                        1000+ Enterprises Trusted
                                    </div>
                                </div>

                                <h1 className="animate-hero-title mb-6 px-1 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.1]">
                                    <span className="text-premium-gradient">Smart Visitor</span> <br />
                                    <span className="text-white lg:opacity-90">Intelligence for Teams</span>
                                </h1>

                                <p className="text-accent-light mb-10 max-w-xl px-2 text-base leading-relaxed text-gray-300 sm:text-xl lg:px-0 opacity-90">
                                    SafeIn empowers modern organizations with a sophisticated digital reception,
                                    streamlined appointments, and real-time security intelligence.
                                </p>

                                <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row lg:justify-start px-2 sm:px-0">
                                    {isAuthenticated && token ? (
                                        <Button
                                            size="lg"
                                            className="bg-brand relative h-12 sm:h-14 w-full overflow-hidden px-8 text-base sm:text-lg font-bold text-white shadow-[0_0_20px_rgba(56,130,165,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,130,165,0.6)] sm:w-auto rounded-xl"
                                            asChild
                                        >
                                            <Link href={routes.privateroute.DASHBOARD}>
                                                <span className="relative z-10">My Dashboard</span>
                                                <div className="animate-shimmer absolute inset-0 opacity-20"></div>
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="bg-brand relative h-12 sm:h-14 w-full overflow-hidden px-8 text-base sm:text-lg font-bold text-white shadow-[0_0_20px_rgba(56,130,165,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,130,165,0.6)] sm:w-auto rounded-xl"
                                            onClick={handleHeroFreeTrialClick}
                                        >
                                            <span className="relative z-10">Experience SafeIn</span>
                                            <div className="animate-shimmer absolute inset-0 opacity-20"></div>
                                        </Button>
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="glass-morphism h-12 sm:h-14 w-full border-white/20 px-8 text-base sm:text-lg font-semibold text-white transition-all hover:bg-white/10 hover:text-white sm:w-auto rounded-xl"
                                        asChild
                                    >
                                        <Link href={routes.publicroute.CONTACT}>View Live Demo</Link>
                                    </Button>
                                </div>

                                {/* Security Badge */}
                                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0 lg:justify-start">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-white" />
                                        <span className="text-[10px] font-bold tracking-widest text-white uppercase italic">ISO 27001 Certified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-white" />
                                        <span className="text-[10px] font-bold tracking-widest text-white uppercase italic">GDPR Compliant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Comprehensive Feature Set */}
                <section className="bg-white py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <h2 className="text-brand mb-6 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                                We offer comprehensive <br className="hidden md:block" />
                                visitor solutions.
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {/* Feature 1 */}
                            <Link href="/features#appointments" className="group flex flex-col rounded-[2.5rem] border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                                    <Image
                                        src="/images/features/smart_appointments_hero_1772358159659.png"
                                        alt="Smart Appointment Booking"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="px-4 pb-4 flex flex-col flex-1">
                                    <h3 className="text-brand mb-3 text-xl font-bold tracking-tight">Smart Appointments</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                        Automated booking engine with real-time calendar sync.
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-accent font-bold text-sm">
                                        Learn more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>

                            {/* Feature 2 */}
                            <Link href="/features#spot-pass" className="group flex flex-col rounded-[2.5rem] border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                                    <Image
                                        src="/images/features/spot_pass_hero_1772358331734.png"
                                        alt="Spot Pass System"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="px-4 pb-4 flex flex-col flex-1">
                                    <h3 className="text-brand mb-3 text-xl font-bold tracking-tight">Spot Pass System</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                        Seamless walk-in management with instant host alerts.
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-accent font-bold text-sm">
                                        Learn more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>

                            {/* Feature 3 */}
                            <Link href="/features#chat" className="group flex flex-col rounded-[2.5rem] border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                                    <Image
                                        src="/images/features/chat_hero_1772358492233.png"
                                        alt="Real-time Chat"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="px-4 pb-4 flex flex-col flex-1">
                                    <h3 className="text-brand mb-3 text-xl font-bold tracking-tight">Real-time Messaging</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                        Secure host-visitor messaging for premium hospitality.
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-accent font-bold text-sm">
                                        Learn more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>

                            {/* Feature 4 */}
                            <Link href="/features#workforce" className="group flex flex-col rounded-[2.5rem] border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                                    <Image
                                        src="/images/features/workforce_dashboard_hero_1772358658740.png"
                                        alt="Workforce Hub"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="px-4 pb-4 flex flex-col flex-1">
                                    <h4 className="text-brand mb-3 text-xl font-bold tracking-tight">Workforce Hub</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                        Enterprise directory management with granular access controls.
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-accent font-bold text-sm">
                                        Learn more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
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
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
                                                One-Click OTP Check-in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Visitors receive a secure 6-digit security code for verification, 
                                                eliminating queues and front-desk manual work.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
                                                Digital visitor logs <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Automated, searchable records of every entry and exit, replacing 
                                                traditional paper registers with secure, cloud-based data.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
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
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
                                                Real-time occupancy tracking <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Live monitoring of person counts inside your facility for safety, 
                                                emergency management, and social distancing compliance.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
                                                Visitor pattern analytics <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Visualize peak visitor times and busy days to optimize staff 
                                                coverage and security resource allocation.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
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
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
                                                WhatsApp arrival alerts <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Instant notifications sent to the host's WhatsApp for immediate 
                                                visitor arrival awareness, even without the app.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
                                                Proactive push notifications <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <p className="text-accent/80 text-sm leading-relaxed">
                                                Real-time mobile alerts for staff to approve or reject visitors 
                                                on-the-go with a single tap.
                                            </p>
                                        </li>
                                        <li>
                                            <Link href={routes.publicroute.FEATURES} className="group mb-2 flex items-center text-accent font-semibold transition-colors hover:text-brand">
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
                <section className="relative overflow-hidden bg-white py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-20 text-center">
                            <div className="bg-brand/5 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 ring-1 ring-brand/10">
                                <Building2 className="text-brand h-4 w-4" />
                                <span className="text-xs font-bold tracking-widest text-brand uppercase">
                                    Industry Solutions
                                </span>
                            </div>
                            <h2 className="text-brand mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                                Tailored for Every <span className="text-accent underline decoration-brand-light/30 decoration-8 underline-offset-4">Enterprise</span>
                            </h2>
                            <p className="text-accent mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
                                From IT Parks in Bangalore to Housing Societies in Mumbai, we secure every sector 
                                with India's most advanced visitor intelligence.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { 
                                    title: "Industrial & Manufacturing", 
                                    desc: "Secure workforce tracking for large-scale production plants.", 
                                    img: "/home/industries/industry-it.png",
                                    icon: <Zap className="h-5 w-5" />
                                },
                                { 
                                    title: "Luxury Residential", 
                                    desc: "Premium visitor lobby for modern gated communities.", 
                                    img: "/home/industries/industry-housing.png",
                                    icon: <Heart className="h-5 w-5" />
                                },
                                { 
                                    title: "Educational Hubs", 
                                    desc: "Smart campus security for schools and universities.", 
                                    img: "/home/industries/industry-education.png",
                                    icon: <Award className="h-5 w-5" />
                                },
                                { 
                                    title: "Healthcare Centers", 
                                    desc: "Efficient patient attendant flow for medical centers.", 
                                    img: "/home/hero/Tranform-your-digital-visitor-management.jpg",
                                    icon: <Activity className="h-5 w-5" />
                                }
                            ].map((industry, i) => (
                                <div key={i} className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(7,68,99,0.12)]">
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                                        <Image
                                            src={industry.img}
                                            alt={industry.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90"></div>
                                        
                                        <div className="absolute bottom-0 left-0 p-8 text-white">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                                                {industry.icon}
                                            </div>
                                            <h4 className="mb-2 text-xl font-bold leading-tight">
                                                {industry.title}
                                            </h4>
                                            <p className="line-clamp-2 text-sm text-gray-200">
                                                {industry.desc}
                                            </p>
                                        </div>
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


            </PublicLayout>
        </>
    );
}
