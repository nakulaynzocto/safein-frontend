"use client";

import React from "react";
import { CheckCircle2, Home, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
    title?: string;
    message?: string;
    companyName?: string;
    visitorName?: string;
    hostName?: string;
    referenceId?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: LucideIcon;
    customFooterMessage?: string;
    enableVisitSlip?: boolean;
    visitorPhone?: string;
    visitorPhoto?: string;
}

export function SuccessState({
    title = "Request Sent!",
    message,
    companyName,
    visitorName,
    hostName,
    referenceId,
    actionLabel = "New Registration",
    onAction,
    icon: Icon = CheckCircle2,
    customFooterMessage = "Please wait at the reception area. You will receive a notification once your host approves.",
    enableVisitSlip = false,
    visitorPhone,
    visitorPhoto,
}: SuccessStateProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 flex flex-col items-center text-center space-y-10">
                
                {/* Google Pay Style Animated Tick */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20 duration-1000" />
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-200">
                        <Icon className="h-16 w-16 text-white stroke-[3] animate-in zoom-in duration-1000" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">{title}</h2>
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-[#3882a5]" />
                    <p className="text-slate-500 font-medium px-4">
                        {message || (
                            <>
                                Your visit request has been successfully submitted to <span className="font-bold text-slate-800">{companyName || "the company"}</span>.
                            </>
                        )}
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visitor</p>
                                <p className="truncate text-sm font-bold text-slate-800">{visitorName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Host</p>
                                <p className="truncate text-sm font-bold text-slate-800">{hostName || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center sm:text-left">Reference ID</p>
                                <p className="font-mono text-[12px] font-bold text-[#3882a5] text-center sm:text-left truncate">{referenceId || "GENERATED"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-2xl border border-blue-50 bg-blue-50/50 p-4">
                            <p className="text-xs font-semibold text-blue-600 text-center">
                                {customFooterMessage}
                            </p>
                        </div>

                        {enableVisitSlip && (
                            <Button 
                                onClick={handlePrint}
                                variant="outline"
                                className="h-14 w-full rounded-2xl border-slate-200 bg-white text-base font-bold text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 print:hidden"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#3882a5]"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                Print Visitor Slip
                            </Button>
                        )}

                        {onAction && (
                            <Button 
                                onClick={onAction}
                                className="h-14 w-full rounded-2xl bg-[#3882a5] text-base font-bold text-white shadow-xl shadow-[#3882a5]/20 transition-all hover:bg-[#2d6a87] hover:scale-105 active:scale-95 print:hidden"
                            >
                                <Home className="mr-2 h-4 w-4" /> {actionLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Printable Slip */}
            {enableVisitSlip && (
                <div className="hidden print:block fixed inset-0 bg-white text-black font-sans" style={{ width: '80mm', margin: '0 auto', padding: '6mm' }}>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
                    <style type="text/css" media="print">
                        {`
                        @page { margin: 0; size: 80mm auto; }
                        body { 
                            width: 80mm; 
                            margin: 0 auto; 
                            font-family: 'Inter', sans-serif !important;
                            -webkit-print-color-adjust: exact;
                        }
                        `}
                    </style>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '1mm', textTransform: 'uppercase' }}>
                            {companyName || "VISITOR SLIP"}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4mm' }}>
                            VISITOR ENTRY PASS
                        </div>
                        
                        <div style={{ width: '100%', borderTop: '1px dashed black', margin: '3mm 0' }}></div>

                        {visitorPhoto && (
                            <div style={{ width: '32mm', height: '32mm', margin: '2mm 0 4mm 0', border: '1px solid black', overflow: 'hidden' }}>
                                <img src={visitorPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Visitor" />
                            </div>
                        )}
                        
                        <div style={{ width: '100%', textAlign: 'left', fontSize: '11px', lineHeight: '1.4' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
                                <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px' }}>VISITOR</span>
                                <span style={{ fontWeight: '600' }}>{(visitorName || "N/A").toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
                                <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px' }}>MOBILE</span>
                                <span style={{ fontWeight: '600' }}>{visitorPhone || "N/A"}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
                                <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px' }}>MEETING WITH</span>
                                <span style={{ fontWeight: '600' }}>{(hostName || "Reception").toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
                                <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px' }}>DATE</span>
                                <span style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
                                <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px' }}>TIME</span>
                                <span style={{ fontWeight: '600' }}>{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div style={{ width: '100%', borderTop: '1px dashed black', margin: '3mm 0' }}></div>

                        <div style={{ width: '100%', border: '2px solid black', padding: '4mm 0', margin: '2mm 0' }}>
                            <div style={{ fontSize: '9px', fontWeight: '800', marginBottom: '1mm', textTransform: 'uppercase' }}>PASS ID / REFERENCE</div>
                            <div style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '1.5px' }}>
                                {referenceId || "ENTRY-XXXX"}
                            </div>
                        </div>

                        <div style={{ width: '100%', borderTop: '1px dashed black', margin: '3mm 0' }}></div>

                        <div style={{ fontSize: '9px', marginTop: '3mm', fontWeight: '600' }}>
                            THANK YOU FOR VISITING
                            <div style={{ fontSize: '8px', fontWeight: '400', marginTop: '1.5mm' }}>PRINTED ON: {new Date().toLocaleString()}</div>
                            <div style={{ marginTop: '4px', fontWeight: '800', fontSize: '8px', letterSpacing: '1.5px', color: '#3882a5' }}>SAFEIN AYNZO</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
