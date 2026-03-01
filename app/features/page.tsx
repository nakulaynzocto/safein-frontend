"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    CalendarCheck,
    Share2,
    BellRing,
    MousePointerClick,
    Smartphone,
    LayoutDashboard,
    MessagesSquare,
    Lock,
    Calendar, 
    Users, 
    BarChart3, 
    Clock, 
    CheckCircle, 
    ArrowRight, 
    Zap, 
    MessageCircle, 
    Upload, 
    Database, 
    Scan, 
    CheckCircle2, 
    Users2, 
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/utils/routes";
import { PublicLayout } from "@/components/layout/publicLayout";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { cn } from "@/lib/utils";

export default function FeaturesPage() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const [currentSlide, setCurrentSlide] = React.useState(0);
    const slides = [
        { image: "/images/features/smart_appointments_hero_1772358159659.png", alt: "Smart Appointments" },
        { image: "/images/features/otp_verification_mobile_1772358411976.png", alt: "OTP Verification" },
        { image: "/images/features/chat_hero_1772358492233.png", alt: "Real-time Chat" },
        { image: "/images/features/workforce_dashboard_hero_1772358658740.png", alt: "Workforce Hub" }
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <PublicLayout>
            <PageSEOHead
                title="SafeIn Features - All-in-One Workplace Management Platform"
                description="Explore the complete SafeIn feature set: Smart Appointments, Spot Pass System, Workforce Hub, and Real-time Chat. Consolidating security and identity on a single platform."
            />
            
            <div className="font-sans">
                {/* Hero Section - Dual Image Panoramic Slider with Brand Background */}
                <section className="relative w-full h-[500px] lg:h-[800px] overflow-hidden bg-hero-gradient py-20 lg:py-0">
                    {/* Background Visual Enhancements */}
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-accent/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[50%] bg-brand/10 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <div className="container mx-auto px-4 h-full relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
                            {/* Left Pane Slider */}
                            <div className="relative h-[250px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                                {slides.map((slide, index) => (
                                    <div 
                                        key={index}
                                        className={cn(
                                            "absolute inset-0 transition-opacity duration-1000 ease-in-out p-4 lg:p-8",
                                            currentSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        )}
                                    >
                                        <Image
                                            src={slide.image}
                                            alt={slide.alt}
                                            fill
                                            className="object-contain p-2 lg:p-6"
                                            priority={index === 0}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                ))}
                                <div className="absolute top-6 left-8 bg-black/30 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                                    Current Highlight
                                </div>
                            </div>

                            {/* Right Pane Slider (Next Slide) */}
                            <div className="relative h-[250px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                                {slides.map((slide, index) => (
                                    <div 
                                        key={index}
                                        className={cn(
                                            "absolute inset-0 transition-opacity duration-1000 ease-in-out p-4 lg:p-8",
                                            ((currentSlide + 1) % slides.length) === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        )}
                                    >
                                        <Image
                                            src={slide.image}
                                            alt={slide.alt}
                                            fill
                                            className="object-contain p-2 lg:p-6"
                                            priority={index === 0}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                ))}
                                <div className="absolute top-6 left-8 bg-black/30 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                                    Up Next
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Bottom Navigation */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 px-5 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={cn(
                                    "h-1.5 transition-all duration-500 rounded-full",
                                    currentSlide === index ? "w-10 bg-accent shadow-[0_0_15px_rgba(56,130,165,0.8)]" : "w-1.5 bg-white/40 hover:bg-white/60"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* Sticky Sub-navigation */}
                <div className="sticky top-20 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md hidden lg:block">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center gap-12 py-4">
                            {[
                                { name: "Smart Appointments", id: "appointments", icon: <Calendar size={18} /> },
                                { name: "Spot Pass System", id: "spot-pass", icon: <Zap size={18} /> },
                                { name: "Real-time Chat", id: "chat", icon: <MessageCircle size={18} /> },
                                { name: "Workforce Hub", id: "workforce", icon: <Users size={18} /> }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-accent"
                                >
                                    {item.icon}
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- SMART APPOINTMENTS --- */}
                <section id="appointments" className="py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="mb-20 text-center lg:text-left">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-primary">
                                <Calendar className="h-4 w-4" />
                                <span>Module 01</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black text-primary mb-6">Smart Appointments</h2>
                            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                                Automated booking engine with real-time calendar sync and guest pre-registration. 
                                Eliminate queues and front-desk friction.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="relative group">
                                <div className="rounded-[3.5rem] overflow-hidden border-8 border-secondary/10 bg-white shadow-2xl relative">
                                    <Image
                                        src="/images/features/smart_appointments_hero_1772358159659.png"
                                        alt="Smart Appointments"
                                        width={1000}
                                        height={1000}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 z-10 bg-white p-6 rounded-2xl shadow-xl ring-1 ring-gray-100 hidden sm:block animate-float-fast">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                            <CalendarCheck className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-primary text-sm whitespace-nowrap">Instant Sync</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-12">
                                <div className="grid gap-8 sm:grid-cols-2">
                                    {[
                                        { t: "Personalized URLs", d: "Every host gets a unique link with their bio and slots.", i: <Share2 /> },
                                        { t: "Instant Slot Sync", d: "Deep integration with Outlook & Google calendars.", i: <Clock /> },
                                        { t: "Auto Reminders", d: "WhatsApp and Email alerts stop guest no-shows.", i: <BellRing /> },
                                        { t: "One-Tap Approval", d: "Hosts approve or reject visits from their lock screen.", i: <MousePointerClick /> }
                                    ].map((c, i) => (
                                        <div key={i} className="group p-6 rounded-3xl bg-secondary/10 border border-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
                                            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-accent mb-4 shadow-sm group-hover:bg-accent group-hover:text-white transition-colors">
                                                {React.cloneElement(c.i as React.ReactElement, { size: 24 })}
                                            </div>
                                            <h4 className="font-bold text-primary mb-2 text-lg">{c.t}</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed">{c.d}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-8 bg-primary rounded-[2.5rem] text-white flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
                                    <div className="relative z-10 h-16 w-16 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse shadow-xl shadow-accent/20">
                                        <Zap size={32} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-xl font-bold mb-2">Ready to Upgrade?</h4>
                                        <p className="text-primary-light opacity-80 text-sm">Join 500+ enterprises managing smart visits with SafeIn.</p>
                                    </div>
                                    <Button variant="outline" className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white hover:text-primary rounded-xl px-8" asChild>
                                        <Link href={routes.publicroute.REGISTER}>Get Started</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SPOT PASS SYSTEM --- */}
                <section id="spot-pass" className="py-24 bg-secondary/10 overflow-hidden border-y border-gray-100">
                    <div className="container mx-auto px-4">
                        <div className="mb-20 text-center lg:text-left">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-primary">
                                <Zap className="h-4 w-4" />
                                <span>Module 02</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black text-primary mb-6 text-right lg:text-left">Spot Pass System</h2>
                            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed lg:mr-auto">
                                Frictionless walk-in management with instant ID verification and host alerts. 
                                Handle unexpected guests in under 30 seconds.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 lg:items-center">
                            <div className="order-2 lg:order-1 space-y-8">
                                <div className="grid gap-6">
                                    {[
                                        { t: "OCR ID Scanning", d: "Scan Aadhaar, PAN, or DL and auto-fill details instantly.", i: <Scan /> },
                                        { t: "OTP Verification", d: "Verify visitor phone numbers via SMS or WhatsApp.", i: <Smartphone /> },
                                        { t: "Kiosk Mode", d: "Beautiful tablet interface for self-registration.", i: <LayoutDashboard /> },
                                        { t: "Instant Verification", d: "Secure 6-digit OTP codes for verified entry.", i: <ShieldCheck /> }
                                    ].map((c, i) => (
                                        <div key={i} className="flex gap-6 p-6 rounded-[2rem] bg-white shadow-sm hover:shadow-xl transition-all border border-gray-50 group">
                                            <div className="h-14 w-14 bg-secondary/30 rounded-2xl flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                                                {React.cloneElement(c.i as React.ReactElement, { size: 28 })}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary mb-1 text-lg">{c.t}</h4>
                                                <p className="text-sm text-gray-500 leading-relaxed">{c.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 relative">
                                <div className="rounded-[3.5rem] overflow-hidden bg-white shadow-2xl relative border-8 border-white p-2">
                                    <Image
                                        src="/images/features/otp_verification_mobile_1772358411976.png"
                                        alt="OTP Verification"
                                        width={1000}
                                        height={1000}
                                        className="h-full w-full object-cover rounded-[3rem]"
                                    />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="h-24 w-24 bg-accent rounded-full border-8 border-white flex items-center justify-center text-white shadow-2xl animate-pulse">
                                            <ShieldCheck size={48} />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-12 -right-12 h-64 w-64 bg-accent/10 rounded-full blur-[100px] -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- REAL-TIME CHAT --- */}
                <section id="chat" className="py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="mb-20 text-center lg:text-left">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-primary">
                                <MessagesSquare className="h-4 w-4" />
                                <span>Module 03</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black text-primary mb-6">Real-time Messaging</h2>
                            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                                Built-in Messenger for hosts and guests. Connected teams lead to faster 
                                lobby clearing and a premium hospitality experience.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="relative group lg:p-12">
                                <div className="relative z-10 rounded-[4rem] overflow-hidden border-4 border-gray-100 shadow-2xl bg-secondary/50 p-6">
                                    <Image
                                        src="/images/features/chat_hero_1772358492233.png"
                                        alt="Chat Feature"
                                        width={1000}
                                        height={1000}
                                        className="rounded-[3rem] shadow-lg group-hover:scale-[1.02] transition-transform duration-700"
                                    />
                                </div>
                                <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                                <div className="absolute inset-x-0 -bottom-12 flex justify-center lg:justify-end lg:pr-24">
                                    <div className="bg-white p-5 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 animate-float-slow">
                                        <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                            <Send size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-primary">99.9% Delivery</p>
                                            <p className="text-xs text-gray-400">Secure AES-256</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { t: "WhatsApp Bridge", d: "Guests chat via WhatsApp, hosts chat via SafeIn App.", i: <Share2 /> },
                                    { t: "Internal Messaging", d: "Dedicated channel for security staff and facility managers.", i: <Users /> },
                                    { t: "Lobby Concierge", d: "Receptionists can instantly update hosts about waiting guests.", i: <Smartphone /> },
                                    { t: "Privacy Purge", d: "Chat data is automatically deleted after visit completion.", i: <Lock /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-1 bg-white hover:bg-slate-50 rounded-[2rem] transition-colors group">
                                        <div className="h-16 w-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all flex-shrink-0">
                                            {React.cloneElement(item.i as React.ReactElement, { size: 28 })}
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="font-bold text-primary text-xl mb-1">{item.t}</h4>
                                            <p className="text-gray-500 leading-relaxed text-sm pr-4">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- WORKFORCE HUB --- */}
                <section id="workforce" className="py-24 bg-white overflow-hidden relative border-t border-gray-50">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                        <Database className="absolute bottom-12 right-12 h-96 w-96 rotate-12" />
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="mb-20 text-center lg:text-left">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-primary border border-accent/20">
                                <Users2 className="h-4 w-4" />
                                <span>Module 04</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black text-primary mb-6">Workforce Hub</h2>
                            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                                Enterprise employee management with granular RBAC and bulk onboarding. 
                                Master your entire staff directory across global offices.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-10">
                                <div className="grid gap-8">
                                    {[
                                        { t: "RBAC Security", d: "Set unique permissions for Guards, Managers, and Admins.", i: <ShieldCheck /> },
                                        { t: "Bulk Onboarding", d: "Import 10,000+ employees via CSV in seconds.", i: <Upload /> },
                                        { t: "Manager Insights", d: "Track team presence and visitor patterns in real-time.", i: <BarChart3 /> },
                                        { t: "Immutable Logs", d: "Complete audit trails for every access change.", i: <Database /> }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 p-6 rounded-3xl bg-secondary/10 border border-gray-100 hover:bg-white hover:shadow-xl hover:border-accent/20 transition-all group">
                                            <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all flex-shrink-0 shadow-sm">
                                                {React.cloneElement(item.i as React.ReactElement, { size: 28 })}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary text-xl mb-1">{item.t}</h4>
                                                <p className="text-gray-500 leading-relaxed text-sm pr-4">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative animate-in fade-in zoom-in duration-1000">
                                <div className="relative z-10 overflow-hidden rounded-[3.5rem] border-8 border-white/10 bg-white shadow-2xl shadow-primary-dark">
                                    <Image
                                        src="/images/features/workforce_dashboard_hero_1772358658740.png"
                                        alt="Workforce Hub"
                                        width={1000}
                                        height={1000}
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
                                </div>
                                <div className="absolute -bottom-12 -left-12 h-64 w-64 bg-accent/20 rounded-full blur-[100px] -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}


function Send(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    )
}
