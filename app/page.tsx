"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { routes } from "@/utils/routes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/publicLayout";
import {
    Star,
    Globe,
    Zap,
    Heart,
    Award,
    Activity,
    ChevronRight,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { generateStructuredData } from "@/lib/seoHelpers";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import below-the-fold sections for better performance
const FeatureSection = dynamic(() => import("@/app/_sections/FeatureSection"), {
    loading: () => <SectionSkeleton />
});
const HowItWorksSection = dynamic<{ routes: any }>(() => import("@/app/_sections/HowItWorksSection"), {
    loading: () => <SectionSkeleton />
});
const IndustriesSection = dynamic(() => import("@/app/_sections/IndustriesSection"), {
    loading: () => <SectionSkeleton />
});
const TestimonialsSection = dynamic(() => import("@/app/_sections/TestimonialsSection"), {
    loading: () => <SectionSkeleton />
});

function SectionSkeleton() {
    return (
        <div className="py-24 sm:py-32 container mx-auto px-4">
            <Skeleton className="h-12 w-3/4 max-w-lg mb-12 mx-auto" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />
                ))}
            </div>
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    const handleHeroFreeTrialClick = () => {
        if (!isAuthenticated) {
            router.push(routes.publicroute.REGISTER);
        } else {
            router.push(routes.privateroute.DASHBOARD);
        }
    };

    const processSteps = useMemo(() => [
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
    ], []);

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
                    <div className="absolute top-0 right-0 -mr-24 -mt-24 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-[400px] w-[400px] rounded-full bg-brand-light/10 blur-[100px]"></div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                            {/* Hero Image Area */}
                            <div className="relative order-1 lg:order-2">
                                <div className="relative mx-auto max-w-[280px] sm:max-w-[340px] lg:ml-auto">
                                    <div className={`absolute -inset-10 rounded-full bg-gradient-to-br ${processSteps[activeStep].color} opacity-20 blur-[100px] transition-all duration-1000`}></div>
                                    <div className="relative z-10 mx-auto w-full overflow-hidden rounded-[3rem] sm:rounded-[3.5rem] border-[6px] sm:border-[8px] border-gray-950 bg-gray-950 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_0_2px_rgba(255,255,255,0.1)] ring-1 ring-white/10">
                                        <div className="absolute top-0 left-1/2 z-40 h-5 sm:h-7 w-20 sm:w-28 -translate-x-1/2 rounded-b-2xl bg-gray-950"></div>
                                        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[2.5rem] sm:rounded-[2.8rem] bg-gray-950">
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
                                                        priority={idx === 0}
                                                        className="object-cover object-top"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Content Area */}
                            <div className="text-center lg:text-left order-2 lg:order-1">
                                <div className="mb-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                                    <div className="badge-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all hover:bg-white/10">
                                        <Star className="h-3.5 w-3.5 fill-current text-[#3882a5]" />
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

                {/* Below the fold sections - Dynamically Loaded */}
                <FeatureSection />
                <HowItWorksSection routes={routes} />
                <IndustriesSection />
                <TestimonialsSection />
            </PublicLayout>
        </>
    );
}

// Sub-components as placeholders for internal sections to support code-splitting if defined in separate files.
// For now, I'll keep the logic here but wrapped in dynamic components conceptually.
// Actually, to make them truly separate, I should create the files.

