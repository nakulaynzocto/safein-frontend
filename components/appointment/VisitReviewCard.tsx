"use client";

import React from "react";
import { User, Calendar, Clock, MessageSquare, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VisitReviewCardProps {
    visitor: {
        name: string;
        phone: string;
        email?: string;
        photo?: string;
    };
    appointment: {
        hostName: string;
        date: string;
        time: string;
        purpose: string;
    };
    className?: string;
}

export function VisitReviewCard({ visitor, appointment, className }: VisitReviewCardProps) {
    return (
        <div className={cn("space-y-6", className)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visitor Profile */}
                <Card className="rounded-3xl border-slate-100 bg-slate-50/30 overflow-hidden shadow-none">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                                <AvatarImage src={visitor.photo} className="object-cover" />
                                <AvatarFallback className="bg-[#3882a5] text-white">
                                    <User size={40} />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">{visitor.name}</h4>
                                <p className="text-sm text-slate-500 font-medium">{visitor.phone}</p>
                                {visitor.email && <p className="text-xs text-slate-400 mt-1">{visitor.email}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Visit Details */}
                <Card className="rounded-3xl border-slate-100 bg-slate-50/30 shadow-none">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100">
                            <div className="h-10 w-10 rounded-xl bg-[#3882a5]/10 flex items-center justify-center text-[#3882a5]">
                                <Briefcase size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host</p>
                                <p className="text-sm font-bold text-slate-900 truncate">{appointment.hostName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-2xl border border-slate-100">
                                <Calendar className="h-4 w-4 text-slate-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                <p className="text-xs font-bold text-slate-900">{appointment.date}</p>
                            </div>
                            <div className="p-3 bg-white rounded-2xl border border-slate-100">
                                <Clock className="h-4 w-4 text-slate-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                                <p className="text-xs font-bold text-slate-900">{appointment.time}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-white rounded-2xl border border-slate-100">
                            <MessageSquare className="h-4 w-4 text-slate-400 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose</p>
                            <p className="text-sm font-bold text-slate-900">{appointment.purpose}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
