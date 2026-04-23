"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simulate loading time or wait for app hydration
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white animate-out fade-out fill-mode-forwards duration-500 delay-1000">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-[#3882a5]/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-[#3882a5]/10 blur-3xl" />
            
            <div className="relative flex flex-col items-center">
                {/* Logo Container - Minimal & Clean */}
                <div className="relative mb-8 h-24 w-24 sm:h-32 sm:w-32 animate-in zoom-in duration-1000 ease-out">
                    {/* Subtle glow effect behind the logo */}
                    <div className="absolute inset-0 rounded-full bg-[#3882a5]/20 blur-2xl animate-pulse" />
                    <div className="relative flex h-full w-full items-center justify-center p-2">
                        <Image
                            src="/safein-logo.svg"
                            alt="SafeIn Logo"
                            width={120}
                            height={120}
                            className="h-full w-full object-contain drop-shadow-xl"
                            priority
                        />
                    </div>
                </div>

                {/* Brand Name */}
                <div className="flex flex-col items-center gap-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Safe<span className="text-[#3882a5]">In</span>
                    </h1>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 sm:text-sm">
                        Visitor Management
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mt-12 h-1 w-48 overflow-hidden rounded-full bg-gray-100 sm:w-64">
                    <div className="h-full bg-[#3882a5] animate-loading-bar" />
                </div>
            </div>

            {/* Powered by Aynzo */}
            <div className="absolute bottom-8 flex flex-col items-center gap-1 opacity-60">
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">Powered by</span>
                <span className="text-sm font-bold text-gray-600">Aynzo</span>
            </div>

            <style jsx global>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(-20%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
                }
            `}</style>
        </div>
    );
}
