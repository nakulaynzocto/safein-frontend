"use client";

import Image from "next/image";
import { Building2, Zap, Heart, Award, Activity } from "lucide-react";

export default function IndustriesSection() {
    const industries = [
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
    ];

    return (
        <section className="relative overflow-hidden bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="mb-20 text-center">
                    <div className="bg-[#3882a5]/5 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 ring-1 ring-[#3882a5]/10">
                        <Building2 className="text-[#3882a5] h-4 w-4" />
                        <span className="text-xs font-bold tracking-widest text-[#3882a5] uppercase">
                            Industry Solutions
                        </span>
                    </div>
                    <h2 className="text-[#074463] mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Tailored for Every Enterprise
                    </h2>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {industries.map((industry, i) => (
                        <div key={i} className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(7,68,99,0.12)]">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                                <Image
                                    src={industry.img}
                                    alt={industry.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#074463]/90 via-[#074463]/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90"></div>
                                
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
    );
}
