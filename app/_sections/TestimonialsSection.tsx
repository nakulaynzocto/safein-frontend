"use client";

import Image from "next/image";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
    const testimonials = [
        {
            name: "Amit Kumar",
            role: "Security Manager, IT Park",
            image: "/home/hero/avatar-1.png",
            content: "\"The SafeIn management system has transformed our security operations in our Delhi office. Setup was incredibly easy and the support team is outstanding.\""
        },
        {
            name: "Priya Sharma",
            role: "Secretary, Green Valley",
            image: "/home/hero/avatar-2.png",
            content: "\"Excellent platform for housing societies. The analytics help us understand visitor patterns and improve our security measures significantly in Mumbai.\""
        },
        {
            name: "Rahul Mehta",
            role: "Operations Head, Tech Hub",
            image: "/home/hero/avatar-3.png",
            content: "\"Professional service and reliable platform. Our visitors in Bangalore love the streamlined check-in process and our team appreciates the high efficiency.\""
        }
    ];

    return (
        <section className="bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="mb-20 text-center">
                    <span className="mb-4 inline-block text-sm font-bold tracking-[0.2em] text-[#3882a5] uppercase">
                        Testimonials
                    </span>
                    <h2 className="text-[#074463] mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-[#3882a5] mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
                        Join 1000+ businesses across top Indian cities securing their premises 
                        with our sophisticated management suite.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-3">
                    {testimonials.map((testimonial, i) => (
                        <div key={i} className="flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10">
                            <div className="mb-6 flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current text-[#3882a5]" />
                                ))}
                            </div>
                            <p className="mb-8 flex-grow text-lg leading-relaxed text-gray-700 italic">
                                {testimonial.content}
                            </p>
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                <Image
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full shadow-md"
                                />
                                <div>
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
