"use client";

import { PublicLayout } from "@/components/layout/publicLayout";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import ContactSection from "@/app/_sections/ContactSection";

export default function ContactPage() {
    return (
        <>
            <PageSEOHead
                title="Contact Us | SafeIn Visitor Management"
                description="Get in touch with the SafeIn team. We're here to help you with any questions about our visitor management system, pricing, or features."
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section - Exactly Matching Help and Blog pages */}
                    <section className="bg-hero-gradient relative flex min-h-[400px] items-center pt-20 pb-12 sm:min-h-[450px] sm:px-6 sm:pt-28 md:min-h-[500px] md:pt-32">
                        <div className="container mx-auto px-4 sm:px-6 text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-black text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter">
                                CONTACT US
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl font-medium">
                                Have questions about SafeIn? We are here to help. Send us a message and our team will get back to you shortly. Our team is ready to help you transform your workplace security. Reach out to us through any channel below.
                            </p>
                        </div>
                    </section>

                    <div className="py-20 md:py-24">
                        <div className="container mx-auto">
                            <ContactSection />
                        </div>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
