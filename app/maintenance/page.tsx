"use client";

import React from 'react';
import { Settings, Wrench, Clock, ShieldCheck, RefreshCw, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-[#3882a5]/30">
            {/* Dynamic Animated Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#3882a5]/20 rounded-full blur-[120px] animate-blob-slow pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#074463]/20 rounded-full blur-[120px] animate-blob-slow animation-delay-2000 pointer-events-none" />
            
            {/* Mesh Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

            <div className="max-w-3xl w-full relative z-10 flex flex-col items-center">
                
                {/* Main Content Card */}
                <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-1000">
                    
                    <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                        
                        {/* Hero Icon Section */}
                        <div className="relative">
                            <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/20 shadow-xl flex items-center justify-center relative">
                                <Settings className="h-14 w-14 text-[#3882a5] animate-spin-slow" />
                                
                                <div className="absolute -top-2 -right-2 h-10 w-10 bg-[#074463] rounded-xl flex items-center justify-center shadow-lg border-2 border-[#020617]">
                                    <Wrench className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-[#3882a5]/10 rounded-[2rem] blur-2xl -z-10" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                System <span className="text-[#3882a5]">Upgrade</span>
                            </h1>
                            <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                                SafeIn is currently under maintenance for essential security updates. 
                                <span className="hidden sm:inline"> We appreciate your patience while we strengthen your experience.</span>
                            </p>
                        </div>

                        {/* Status Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                            <div className="bg-white/[0.02] border border-white/5 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left">
                                <div className="h-12 w-12 rounded-xl bg-[#3882a5]/10 flex items-center justify-center shrink-0">
                                    <Clock className="h-6 w-6 text-[#3882a5]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Timeline</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">30—45 mins</p>
                                </div>
                            </div>
                            
                            <div className="bg-white/[0.02] border border-white/5 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Data Health</h3>
                                    <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">Encrypted</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 w-full flex flex-col items-center gap-6">
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button 
                                    asChild
                                    className="h-12 px-8 rounded-xl bg-[#3882a5] hover:bg-[#3882a5]/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#3882a5]/20 active:scale-95"
                                >
                                    <Link href="/" className="flex items-center gap-2">
                                        <RefreshCw size={14} className="animate-spin-slow duration-[4s]" />
                                        Refresh Now
                                    </Link>
                                </Button>
                                
                                <Button 
                                    variant="outline"
                                    asChild
                                    className="h-12 px-8 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest active:scale-95"
                                >
                                    <a href="mailto:support@safein.app" className="flex items-center gap-2">
                                        Support <ArrowRight size={14} />
                                    </a>
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 text-slate-600">
                                <span className="text-[9px] font-bold uppercase tracking-wider">support@safein.app</span>
                                <div className="h-3 w-px bg-white/10" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">SafeIn v2.4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Decorative Label */}
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 opacity-50 animate-pulse">
                    Protecting What Matters Most
                </p>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes blob-slow {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .animate-blob-slow {
                    animation: blob-slow 20s infinite alternate;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    );
}
