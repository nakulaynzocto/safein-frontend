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
    Clock,
    User,
    Bell,
    Shield,
    MessageSquare,
    BarChart3,
    Printer,
    QrCode,
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
const PricingSection = dynamic(() => import("@/app/_sections/PricingSection"), {
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
        <div className="py-12 sm:py-16 container mx-auto px-4">
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
            title: "Premium Visitor Experience",
            description: "A centralized, intelligent dashboard that commands your entire organization's visitor flow.",
            image: "/images/hero/premium_showcase.png",
            badge: "SaaS Ecosystem",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 2,
            title: "Touchless QR Scan",
            description: "Visitors scan a secure gate-side QR code to initiate their own check-in seamlessly.",
            image: "/images/features/qr_checkin_feature_1776194813535.png",
            badge: "Safe & Fast",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 3,
            title: "Instant Smart Alerts",
            description: "Hosts receive real-time notifications on WhatsApp and Email for every arriving guest.",
            image: "/home/solutions/smart-notifications.png",
            badge: "Real-time Sync",
            color: "from-[#074463] to-[#3882a5]"
        },
        {
            id: 4,
            title: "Verified Gate Check-in",
            description: "Gatekeepers verify identity with secure OTPs, ensuring only authorized entry.",
            image: "/home/custom/gatekeeper.png",
            badge: "High Security",
            color: "from-[#074463] to-[#3882a5]"
        }
    ], []);

    const coreFeatureSteps = useMemo(() => [
        {
            id: 1,
            title: "Priority Booking",
            description: "Pre-book VIP guests with priority slots and automated QR code invites for a seamless, executive-level arrival experience.",
            image: "/home/custom/booking.png",
            color: "from-[#3882a5]/20 to-[#3882a5]/10",
            icon: <User className="h-7 w-7" />,
            hasQrBadge: true
        },
        {
            id: 2,
            title: "Smart Invite Link",
            description: "Send personalized invitation links that generate secure QR entry passes instantly, removing friction from the visitor journey.",
            image: "/images/features/qr_checkin_feature_1776194813535.png",
            color: "from-[#3882a5]/20 to-[#3882a5]/10",
            icon: <QrCode className="h-7 w-7" />,
            hasQrBadge: true
        },
        {
            id: 3,
            title: "Instant QR Spot Pass",
            description: "Generate digital spot passes with QR codes for walk-in visitors, enabling instant host alerts and automated security logging.",
            image: "/home/custom/kiosk.png",
            color: "from-[#3882a5]/20 to-[#3882a5]/10",
            icon: <QrCode className="h-7 w-7" />,
            hasQrBadge: true
        },
        {
            id: 4,
            title: "Secured OTP Verification",
            description: "Double-check safety with secure 6-digit OTP codes alongside QR verification for high-security environments.",
            image: "/home/custom/gatekeeper.png",
            color: "from-[#3882a5]/20 to-[#3882a5]/10",
            icon: <Shield className="h-7 w-7" />
        },
        {
            id: 5,
            title: "Real-time Messaging",
            description: "Host-visitor communication hub with instant status updates and gate-side arrival confirmations via chat.",
            image: "/home/custom/dashboard.png",
            color: "from-[#3882a5]/20 to-[#3882a5]/10",
            icon: <MessageSquare className="h-7 w-7" />
        },
        {
            id: 6,
            title: "Insightful Analytics",
            description: "Monitor visitor peaks, security bottlenecks, and compliance logs with our data-driven executive dashboard.",
            image: "/home/custom/dashboard.png",
            color: "from-[#3882a5]/20 to-[#3882a5]/10",
            icon: <BarChart3 className="h-7 w-7" />
        }
    ], []);


    const [heroActiveStep, setHeroActiveStep] = useState(0);
    const [featuresActiveStep, setFeaturesActiveStep] = useState(0);

    useEffect(() => {
        const heroTimer = setInterval(() => {
            setHeroActiveStep((prev) => (prev + 1) % processSteps.length);
        }, 2000);
        return () => clearInterval(heroTimer);
    }, [processSteps.length]);

    useEffect(() => {
        const featuresTimer = setInterval(() => {
            setFeaturesActiveStep((prev) => (prev + 1) % coreFeatureSteps.length);
        }, 4000); // Slower cycle for reading steps
        return () => clearInterval(featuresTimer);
    }, [coreFeatureSteps.length]);



    const faqs = [
        {
            question: "What is the best visitor management system for offices in India?",
            answer: "SafeIn by Aynzo is widely considered the best visitor management system in India. It offers end-to-end security features like OTP verification, touchless QR check-ins, and automated host notifications via WhatsApp—all tailored for the Indian business environment."
        },
        {
            question: "How does the QR-based visitor check-in work?",
            answer: "Visitors simply scan a unique QR code printed at your reception or gate using their smartphone. This opens a secure registration form where they enter their details. Once submitted, the host is instantly notified, and the visitor receives a secure entry pass."
        },
        {
            question: "Can I manage multiple office locations with SafeIn?",
            answer: "Yes, SafeIn is designed for multi-tenant and multi-location management. Admins can monitor visitor logs across different branches from a single centralized dashboard, ensuring consistent security compliance nationwide."
        },
        {
            question: "Is SafeIn compliant with data privacy laws like GDPR?",
            answer: "Absolutely. SafeIn is built with a 'Security-First' philosophy. We follow ISO 27001 standards and are GDPR compliant, ensuring that all visitor and employee data is encrypted and handled with the highest level of privacy."
        },
        {
            question: "Does SafeIn support WhatsApp and SMS notifications?",
            answer: "Yes, SafeIn integrates with premier communication gateways to send instant arrival alerts via WhatsApp, SMS, and Email. This ensures that hosts are notified immediately, even if they aren't at their desks."
        }
    ];

    const homeStructuredData = useMemo(() => {
        const base = generateStructuredData("home");
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
        return { ...base, ...faqSchema };
    }, [faqs]);

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
                    
                    {/* ... (rest of hero content) ... */}
                    {/* (I'll keep the existing content but wrap it in the new structure) */}
                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                            {/* Hero Image Area - Dual Device Showcase */}
                            <div className="relative order-1 lg:order-2 perspective-[2000px] mb-12 sm:mb-0">
                                <div className="relative mx-auto max-w-[450px] sm:max-w-[600px] lg:ml-auto select-none py-10 sm:py-20 animate-float-slow">
                                    <div className={`absolute -inset-20 rounded-full bg-gradient-to-br from-[#3882a5]/30 to-[#074463]/20 opacity-30 blur-[140px] transition-all duration-1000`}></div>
                                    <div className={`absolute -inset-10 rounded-full bg-gradient-to-br from-brand/20 to-brand/10 opacity-20 blur-[120px] transition-all duration-1000`}></div>
                                    
                                    {/* 1. Landscape Kiosk (Background) */}
                                    <div className="absolute -left-12 sm:-left-20 top-[45%] -translate-y-1/2 w-[320px] sm:w-[440px] opacity-100 transition-all duration-700"
                                         style={{ transform: 'rotateY(30deg) rotateX(10deg) translateZ(-50px)', transformStyle: 'preserve-3d' }}>
                                        
                                        <div className="absolute -bottom-20 left-1/2 z-0 h-40 w-12 -translate-x-1/2 rounded-xl bg-gradient-to-b from-gray-900 to-black border-x border-white/5 opacity-80 shadow-2xl"></div>
                                        <div className="absolute -bottom-24 left-1/2 z-0 h-8 w-40 -translate-x-1/2 rounded-[50%] bg-black/40 blur-[4px]"></div>

                                        <div className="relative z-10 w-full aspect-[16/10] overflow-hidden rounded-[2.5rem] border-[12px] border-gray-950 bg-gray-950 shadow-2xl ring-1 ring-white/10">
                                            <div className="relative w-full h-full bg-gray-950 overflow-hidden">
                                                {processSteps.map((step, idx) => (
                                                    <div 
                                                        key={`bg-${step.id}`}
                                                        className={cn(
                                                            "absolute inset-0 transition-opacity duration-1000",
                                                            idx === heroActiveStep ? "opacity-100 scale-100" : "opacity-0 scale-105"
                                                        )}
                                                    >
                                                        <Image
                                                            src={step.image}
                                                            alt={step.title}
                                                            fill
                                                            sizes="(max-width: 768px) 320px, 440px"
                                                            className="object-cover transition-transform duration-[2000ms] ease-linear"
                                                            style={{ transform: idx === heroActiveStep ? 'scale(1.1)' : 'scale(1)' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Modern Smartphone (Main Foreground) */}
                                    <div className="relative z-20 ml-auto w-[220px] sm:w-[280px] transition-all duration-500 hover:scale-[1.05]"
                                         style={{ transform: 'rotateY(-30deg) rotateX(8deg) translateZ(80px)', transformStyle: 'preserve-3d' }}>
                                        
                                        <div className="relative w-full overflow-hidden rounded-[2.8rem] border-[10px] border-gray-950 bg-gray-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-[3px] ring-[#3882a5]/30">
                                            <div className="absolute top-0 left-1/2 z-40 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-950 shadow-inner">
                                                <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-800"></div>
                                            </div>

                                            <div className="relative aspect-[9/18] w-full overflow-hidden rounded-[2.2rem] bg-gray-950 shadow-inner ring-1 ring-white/10">
                                                <div className="absolute inset-0 z-0">
                                                    {processSteps.map((step, idx) => (
                                                        <div 
                                                            key={`fg-${step.id}`}
                                                            className={cn(
                                                                "absolute inset-0 transition-opacity duration-1000",
                                                                idx === heroActiveStep ? "opacity-100 scale-100" : "opacity-0 scale-110"
                                                            )}
                                                        >
                                                            <Image
                                                                src={step.image}
                                                                alt={step.title}
                                                                fill
                                                                priority={idx === heroActiveStep}
                                                                sizes="(max-width: 768px) 220px, 280px"
                                                                className="object-cover transition-transform duration-[2000ms] ease-linear"
                                                                style={{ transform: idx === heroActiveStep ? 'scale(1.15)' : 'scale(1)' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 z-30 pointer-events-none rounded-[2.8rem] bg-gradient-to-tr from-transparent via-white/5 to-white/15 opacity-70"></div>
                                    </div>
                                </div>
                            </div>

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
                                    <span className="text-white lg:opacity-90">Management for Offices</span>
                                </h1>

                                <p className="text-accent-light mb-10 max-w-xl px-2 text-base leading-relaxed text-gray-300 sm:text-xl lg:px-0 opacity-90">
                                    Make your reception digital. Easy check-ins, 
                                    fast visitor alerts, and better office security.
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
                                            <span className="relative z-10">Start Free Trial</span>
                                            <div className="animate-shimmer absolute inset-0 opacity-20"></div>
                                        </Button>
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="glass-morphism h-12 sm:h-14 w-full border-white/20 px-8 text-base sm:text-lg font-semibold text-white transition-all hover:bg-white/10 hover:text-white sm:w-auto rounded-xl"
                                        asChild
                                    >
                                        <Link href={routes.publicroute.CONTACT}>See How It Works</Link>
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

                <FeatureSection />

                {/* Features Section */}
                <section id="core-features" className="relative overflow-hidden bg-white py-12 sm:py-16">
                    <div className="container relative z-10 mx-auto px-4 sm:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-black text-slate-900 sm:text-5xl">
                                Powerful <span className="text-[#3882a5]">Core Features</span>
                            </h2>
                            <p className="mx-auto max-w-2xl text-slate-600 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl">
                                Discover the advanced capabilities that make SafeIn the most 
                                trusted digital visitor management solution for modern offices.
                            </p>
                        </div>

                        <div className="grid items-center gap-12 lg:grid-cols-3 xl:gap-20">
                            {/* Left Side Features */}
                            <div className="order-2 space-y-12 lg:order-1">
                                {coreFeatureSteps.slice(0, 3).map((step, idx) => (
                                    <div 
                                        key={step.id}
                                        onMouseEnter={() => setFeaturesActiveStep(idx)}
                                        className={cn(
                                            "group flex items-start gap-6 transition-all duration-500 cursor-pointer p-4 rounded-3xl",
                                            featuresActiveStep === idx ? "bg-slate-50 shadow-sm" : "hover:bg-slate-50/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 relative",
                                            featuresActiveStep === idx ? "bg-[#3882a5] text-white shadow-lg" : "bg-slate-100 text-[#3882a5]"
                                        )}>
                                            {step.icon}
                                            {/* QR Badge for Mobile focus */}
                                            {step.hasQrBadge && (
                                                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-md lg:hidden z-10">
                                                    <QrCode className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className={cn(
                                                "mb-2 text-2xl font-black tracking-tight transition-colors duration-300",
                                                featuresActiveStep === idx ? "text-slate-900" : "text-slate-700"
                                            )}>
                                                {step.title}
                                            </h3>
                                            <p className="text-base font-medium leading-relaxed text-slate-500 max-w-[280px]">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Center Feature Smartphone */}
                            <div className="order-1 flex justify-center lg:order-2">
                                <div className="relative w-full max-w-[300px] perspective-[1500px]">
                                    <div className="absolute -inset-10 rounded-full transition-all duration-1000 blur-[80px] opacity-10 bg-[#3882a5]"></div>
                                    <div className="relative z-10 w-full overflow-hidden rounded-[2.8rem] border-[12px] border-slate-900 bg-slate-900 shadow-[0_60px_100px_-20px_rgba(7,68,99,0.3)] ring-[4px] ring-[#3882a5]/30 transition-all duration-700 hover:scale-[1.05]">
                                        <div className="relative aspect-[9/18] w-full overflow-hidden rounded-[2.2rem] bg-slate-950 shadow-inner ring-1 ring-white/10">
                                            {coreFeatureSteps.map((step, idx) => (
                                                <div 
                                                    key={`feature-img-${step.id}`}
                                                    className={cn(
                                                        "absolute inset-0 transition-opacity duration-700 ease-in-out",
                                                        idx === featuresActiveStep ? "opacity-100 scale-100" : "opacity-0 scale-105"
                                                    )}
                                                >
                                                    <Image
                                                        src={step.image}
                                                        alt={step.title}
                                                        fill
                                                        priority={idx === 0}
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                                </div>
                                            ))}
                                            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-40"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Features */}
                            <div className="order-3 space-y-12">
                                {coreFeatureSteps.slice(3, 6).map((step, idx) => {
                                    const actualIdx = idx + 3;
                                    return (
                                        <div 
                                            key={step.id}
                                            onMouseEnter={() => setFeaturesActiveStep(actualIdx)}
                                            className={cn(
                                                "group flex items-start gap-6 transition-all duration-500 cursor-pointer p-4 rounded-3xl",
                                                featuresActiveStep === actualIdx ? "bg-slate-50 shadow-sm" : "hover:bg-slate-50/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 relative",
                                                featuresActiveStep === actualIdx ? "bg-[#3882a5] text-white shadow-lg" : "bg-slate-100 text-[#3882a5]"
                                            )}>
                                                {step.icon}
                                                {/* QR Badge for Mobile focus */}
                                                {step.hasQrBadge && (
                                                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-md lg:hidden z-10">
                                                        <QrCode className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className={cn(
                                                    "mb-2 text-2xl font-black tracking-tight transition-colors duration-300",
                                                    featuresActiveStep === actualIdx ? "text-slate-900" : "text-slate-700"
                                                )}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-base font-medium leading-relaxed text-slate-500 max-w-[280px]">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <HowItWorksSection routes={routes} />

                {/* FAQ Section with Premium Styling */}
                <section id="faq" className="bg-slate-50/50 py-12 sm:py-24">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-black text-slate-900 sm:text-5xl uppercase tracking-tight">
                                Frequently Asked <span className="text-[#3882a5]">Questions</span>
                            </h2>
                            <p className="mx-auto max-w-2xl text-slate-600 text-lg font-medium">
                                Everything you need to know about India's most advanced visitor management system.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-4">
                            {faqs.map((faq, idx) => (
                                <details key={idx} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-xl">
                                    <summary className="flex items-center justify-between p-6 sm:p-8 cursor-pointer list-none">
                                        <h3 className="text-lg sm:text-xl font-black text-[#074463] pr-4 uppercase tracking-tighter transition-colors group-hover:text-[#3882a5]">
                                            {faq.question}
                                        </h3>
                                        <div className="bg-slate-50 rounded-full p-2 transition-transform duration-500 group-open:rotate-180">
                                            <ChevronRight className="w-6 h-6 text-[#3882a5]" />
                                        </div>
                                    </summary>
                                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 text-slate-600 font-medium leading-relaxed border-t border-slate-50 pt-6">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <PricingSection />
                <IndustriesSection />
            </PublicLayout>
        </>
    );
}

// Sub-components as placeholders for internal sections to support code-splitting if defined in separate files.
// For now, I'll keep the logic here but wrapped in dynamic components conceptually.
// Actually, to make them truly separate, I should create the files.

