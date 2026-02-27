"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/utils/routes";

interface AuthPageLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
    const router = useRouter();

    return (
        <div className="flex min-h-screen bg-white overflow-hidden">
            {/* Left Side: Form */}
            <div className="flex w-full flex-col lg:w-1/2 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 xl:px-24">
                {/* Back to Home — in normal flow, never overlaps form */}
                <div className="mb-6 sm:mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(routes.publicroute.HOME)}
                        className="text-muted-foreground hover:bg-[#3882a5] hover:text-white rounded-lg px-3 flex items-center gap-2 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Button>
                </div>

                <div className="mx-auto w-full max-w-md">
                    {children}
                </div>
            </div>

            {/* Right Side: Image & Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#3882a5] flex-col items-center justify-center p-12 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-48 -mt-48 transition-all" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#074463]/20 rounded-full -ml-24 -mb-24 transition-all" />

                <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
                    {/* Image in a Premium Frame */}
                    <div className="relative mb-12">
                        <div className="absolute -inset-4 bg-white/10 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden border-8 border-white/20 shadow-2xl bg-white/5 p-4">
                            <div className="w-full h-full rounded-full overflow-hidden">
                                <img
                                    src="/images/auth-side.png"
                                    alt="Management Dashboard"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding Text */}
                    <div className="space-y-4 max-w-md">
                        <h2 className="text-3xl font-extrabold text-white leading-tight">
                            Streamline Your Visitor Management Experience
                        </h2>
                        <p className="text-blue-50/80 text-lg leading-relaxed">
                            Join thousands of organizations using Aynzo to manage their front desk operations with ease and security.
                        </p>
                    </div>
                </div>

                {/* Footer Link (Optional) */}
                <div className="absolute bottom-12 left-0 right-0 text-center text-white/40 text-sm">
                    &copy; {new Date().getFullYear()} Aynzo Global Private Limited. All rights reserved.
                </div>
            </div>
        </div>
    );
}
