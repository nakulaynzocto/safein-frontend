"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HowItWorksSection({ routes }: { routes: any }) {
    return (
        <section className="bg-white py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="mb-20 text-center">
                    <h2 className="text-slate-900 mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                        How SafeIn <span className="text-[#3882a5]">Transforms Your Reception</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
                        Say goodbye to paper logs and front-desk friction. SafeIn digitizes your entrance 
                        with three powerful layers of technology designed for modern workspace excellence.
                    </p>
                </div>

                <div className="space-y-32">
                    {/* Solution 1: Seamless Entrance */}
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
                        <div className="relative">
                            <div className="absolute -left-6 -top-6 -z-10 h-full w-full rounded-3xl bg-blue-50/80 sm:-left-10 sm:-top-10"></div>
                            <Image
                                src="/home/custom/kiosk.png"
                                alt="Smart Digital Check-in"
                                width={600}
                                height={450}
                                className="rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                            />
                        </div>
                        <div className="lg:pr-8">
                            <h3 className="text-slate-900 mb-6 text-3xl font-black tracking-tight sm:text-4xl">
                                Empowering Workplace Efficiency
                            </h3>
                            <p className="text-slate-500 mb-8 text-xl leading-relaxed">
                                By automating the entrance process with smart check-ins and digital registration, 
                                businesses gain valuable time and reduce front-desk friction. SafeIn allows 
                                for seamless visitor transitions, ensuring every guest feels welcomed and secure.
                            </p>
                            <ul className="space-y-8">
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        One-Click OTP Check-in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Visitors receive a secure 6-digit security code for verification, 
                                        eliminating queues and front-desk manual work.
                                    </p>
                                </li>
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Digital visitor logs <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Automated, searchable records of every entry and exit, replacing 
                                        traditional paper registers with secure, cloud-based data.
                                    </p>
                                </li>
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Entrance verification <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
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
                            <h3 className="text-slate-900 mb-6 text-3xl font-black tracking-tight sm:text-4xl">
                                Advanced Security Framework
                            </h3>
                            <p className="text-slate-500 mb-8 text-xl leading-relaxed">
                                Leverage powerful analytics to track footfall, peak hours, and security patterns. 
                                Our real-time dashboard provides actionable insights into your workplace traffic, 
                                enabling informed security decisions to optimize operations and drive safety.
                            </p>
                            <ul className="space-y-8">
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Real-time occupancy tracking <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Live monitoring of person counts inside your facility for safety, 
                                        emergency management, and social distancing compliance.
                                    </p>
                                </li>
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Visitor pattern analytics <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Visualize peak visitor times and busy days to optimize staff 
                                        coverage and security resource allocation.
                                    </p>
                                </li>
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Automated safety reports <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Detailed, scheduled audit trails for security managers to ensure 
                                        regulatory compliance with zero manual effort.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="relative order-1 lg:order-2">
                            <div className="absolute -right-6 -bottom-6 -z-10 h-full w-full rounded-3xl bg-[#3882a5]/5 sm:-right-10 sm:-bottom-10"></div>
                            <Image
                                src="/home/custom/dashboard.png"
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
                            <div className="absolute -left-6 -bottom-6 -z-10 h-full w-full rounded-3xl bg-[#3882a5]/5 sm:-left-10 sm:-bottom-10"></div>
                            <Image
                                src="/home/solutions/smart-notifications.png"
                                alt="Smart Notification System"
                                width={600}
                                height={450}
                                className="rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                            />
                        </div>
                        <div className="lg:pr-8">
                            <h3 className="text-slate-900 mb-6 text-3xl font-black tracking-tight sm:text-4xl">
                                Connected Digital Reception
                            </h3>
                            <p className="text-slate-500 mb-8 text-xl leading-relaxed">
                                Stay informed with intelligent alerts and real-time connectivity. SafeIn 
                                bridges the gap between your visitors and staff with instant WhatsApp and 
                                in-app notifications, ensuring a professional and timely reception for every guest.
                            </p>
                            <ul className="space-y-8">
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        WhatsApp arrival alerts <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Instant notifications sent to the host's WhatsApp for immediate 
                                        visitor arrival awareness, even without the app.
                                    </p>
                                </li>
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Proactive push notifications <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Real-time mobile alerts for staff to approve or reject visitors 
                                        on-the-go with a single tap.
                                    </p>
                                </li>
                                <li>
                                    <Link href="/#core-features" className="group mb-2 flex items-center text-[#3882a5] font-semibold transition-colors hover:text-slate-900">
                                        Host-visitor internal messaging <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="text-slate-500 text-sm leading-relaxed">
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
    );
}
