"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function FeatureSection() {
    return (
        <section className="bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="mb-20 text-center">
                    <h2 className="text-[#074463] mb-6 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
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
                            <h3 className="text-[#074463] mb-3 text-xl font-bold tracking-tight">Smart Appointments</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                Automated booking engine with real-time calendar sync.
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[#3882a5] font-bold text-sm">
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
                            <h3 className="text-[#074463] mb-3 text-xl font-bold tracking-tight">Spot Pass System</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                Seamless walk-in management with instant host alerts.
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[#3882a5] font-bold text-sm">
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
                            <h3 className="text-[#074463] mb-3 text-xl font-bold tracking-tight">Real-time Messaging</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                Secure host-visitor messaging for premium hospitality.
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[#3882a5] font-bold text-sm">
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
                            <h4 className="text-[#074463] mb-3 text-xl font-bold tracking-tight">Workforce Hub</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                Enterprise directory management with granular access controls.
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[#3882a5] font-bold text-sm">
                                Learn more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
