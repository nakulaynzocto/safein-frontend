"use client";

import Image from "next/image";
import Link from "next/link";

export default function FeatureSection() {
    return (
        <section id="features" className="bg-white py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-slate-900 mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                        We offer <span className="text-[#3882a5]">Comprehensive </span> <br className="hidden md:block" /> Visitor Solutions
                    </h2>
                    <p className="mx-auto max-w-3xl text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
                        SafeIn provides an all-in-one platform to manage visitors, employees, and 
                        deliveries with ironclad security and delightful guest experiences.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 pb-12">
                    {/* Feature 1 */}
                    <Link href="/#core-features" className="group flex flex-col rounded-[2.5rem] border border-[#3882a5]/20 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-[#3882a5]/50">
                        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/features/smart_appointments_hero_1772358159659.png"
                                alt="Smart Appointment Booking"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <div className="px-4 pb-4 flex flex-col flex-1">
                            <h3 className="text-slate-900 mb-3 text-xl font-bold tracking-tight">Smart Appointments</h3>
                            <p className="text-gray-600 text-base leading-relaxed mb-2 font-medium">
                                Automated booking engine with real-time calendar sync for a prioritized experience.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 2 */}
                    <Link href="/#features" className="group flex flex-col rounded-[2.5rem] border border-[#3882a5]/20 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-[#3882a5]/50">
                        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/features/spot_pass_hero_1772358331734.png"
                                alt="Spot Pass System"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <div className="px-4 pb-4 flex flex-col flex-1">
                            <h3 className="text-slate-900 mb-3 text-xl font-bold tracking-tight">Spot Pass System</h3>
                            <p className="text-gray-600 text-base leading-relaxed mb-2 font-medium">
                                Seamless walk-in management with instant host alerts and automated badge printing.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 3 */}
                    <Link href="/#features" className="group flex flex-col rounded-[2.5rem] border border-[#3882a5]/20 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-[#3882a5]/50">
                        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/features/chat_hero_1772358492233.png"
                                alt="Real-time Chat"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <div className="px-4 pb-4 flex flex-col flex-1">
                            <h3 className="text-slate-900 mb-3 text-xl font-bold tracking-tight">Real-time Messaging</h3>
                            <p className="text-gray-600 text-base leading-relaxed mb-2 font-medium">
                                Secure host-visitor messaging for premium hospitality and direct communication.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 4 */}
                    <Link href="/#features" className="group flex flex-col rounded-[2.5rem] border border-[#3882a5]/20 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-[#3882a5]/50">
                        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/features/workforce_dashboard_hero_1772358658740.png"
                                alt="Workforce Hub"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <div className="px-4 pb-4 flex flex-col flex-1">
                            <h4 className="text-slate-900 mb-3 text-xl font-bold tracking-tight">Workforce Hub</h4>
                            <p className="text-gray-600 text-base leading-relaxed mb-2 font-medium">
                                Enterprise directory management with granular access controls for all your staff.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
