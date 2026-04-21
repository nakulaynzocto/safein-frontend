"use client";

import React from "react";
import { format } from "date-fns";
import { useGetSettingsQuery } from "@/store/api/settingsApi";

interface VisitSlipProps {
    appointment: any;
}

export const VisitSlip = React.forwardRef<HTMLDivElement, VisitSlipProps>(({ appointment }, ref) => {
    const { data: settings } = useGetSettingsQuery();
    
    if (!appointment) return null;

    // Handle both populated and unpopulated data
    const visitor = appointment.visitorId || appointment.visitor;
    const employee = appointment.employeeId || appointment.employee;
    const details = appointment.appointmentDetails || appointment;
    const companyName = settings?.companyName || "GATEKEEPER";
    
    // Prioritize check-in photo over default visitor photo
    const visitorPhoto = appointment.visitorPhoto || visitor?.photo || visitor?.profilePicture || "";

    return (
        <div ref={ref} className="print-only">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                    .print-only { display: block !important; width: 80mm; padding: 15px; box-sizing: border-box; background: white; }
                    .no-print { display: none !important; }
                }
                .print-only { display: none; }
            `}} />

            <div className="flex flex-col items-center text-center space-y-3">
                {/* Header with Company Name */}
                <div className="border-b-2 border-dashed border-slate-300 w-full pb-3 mb-2">
                    <h2 className="text-lg font-black uppercase tracking-widest text-[#3882a5] leading-none mb-1">{companyName}</h2>
                    <h1 className="text-sm font-bold uppercase tracking-[4px] text-slate-500">Visit Pass</h1>
                    <p className="text-[9px] font-bold text-slate-400 tabular-nums mt-1">ID: {appointment._id?.slice(-8).toUpperCase()}</p>
                </div>

                {/* Visitor Info */}
                <div className="w-full space-y-2 mt-4">
                    {visitorPhoto && (
                        <div className="flex justify-center mb-4">
                            <img 
                                src={visitorPhoto} 
                                alt="Visitor" 
                                className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200" 
                            />
                        </div>
                    )}
                    
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-none">Visitor</p>
                        <p className="text-lg font-black text-slate-900 uppercase leading-tight mt-1">{visitor?.name}</p>
                        <p className="text-xs font-bold text-slate-600 font-mono mt-1">{visitor?.phone}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 py-4 border-y border-dashed border-slate-200 my-4">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Meeting To</p>
                            <p className="text-sm font-bold text-slate-800 uppercase mt-1">{employee?.name}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Purpose</p>
                            <p className="text-xs font-medium text-slate-700 mt-1">{details?.purpose || "N/A"}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Date</p>
                            <p className="text-[11px] font-bold text-slate-800 mt-1">
                                {details?.scheduledDate ? format(new Date(details.scheduledDate), "MMM dd, yyyy") : "---"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">In Time</p>
                            <p className="text-[11px] font-bold text-slate-800 mt-1">{details?.scheduledTime || "---"}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-6 w-full text-center">
                    <div className="border-t border-dashed border-slate-300 pt-4 mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">Valid for today only</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[3px] mb-1">Powered by</p>
                        <div className="px-3 py-1 bg-[#3882a5]/5 rounded-full">
                            <span style={{ fontWeight: '800', fontSize: '10px', letterSpacing: '2px', color: '#3882a5' }}>SAFEIN AYNZO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

VisitSlip.displayName = "VisitSlip";

