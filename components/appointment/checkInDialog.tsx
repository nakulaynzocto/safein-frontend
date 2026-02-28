"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/store/api/appointmentApi";
import { LogIn, User, Calendar, Clock, AlertCircle } from "lucide-react";
import { formatDate, formatTime } from "@/utils/helpers";
import { cn } from "@/lib/utils";

interface CheckInDialogProps {
    appointment: Appointment | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: string, notes?: string) => Promise<void>;
    isLoading?: boolean;
}

export function CheckInDialog({ appointment, open, onClose, onConfirm, isLoading = false }: CheckInDialogProps) {
    if (!appointment) return null;

    const getVisitorName = () => {
        return (appointment as any).visitorId?.name || appointment.visitor?.name || "N/A";
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl bg-white p-0 overflow-hidden">
                <div className="p-6 text-center">
                    {/* Centered Icon like ConfirmationDialog */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <LogIn className="h-8 w-8 text-[#3882a5]" />
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                            Check In Visitor
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-center mt-2">
                            Confirm visitor arrival and grant premises entry.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Visitor Context Card (Simplified) */}
                    <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <User className="h-5 w-5 text-[#3882a5]" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visitor</div>
                                <div className="font-bold text-slate-700 truncate">{getVisitorName()}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                            <div className="space-y-1 text-left">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {formatDate(appointment.appointmentDetails?.scheduledDate || "")}
                                </div>
                            </div>
                            <div className="space-y-1 text-left">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {appointment.appointmentDetails?.scheduledTime ? formatTime(appointment.appointmentDetails.scheduledTime) : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Proceed with check-in for this visitor?
                    </p>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 p-6 bg-slate-50/50 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:flex-1 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(appointment._id)}
                        disabled={isLoading}
                        className="w-full sm:flex-1 h-12 rounded-xl bg-[#3882a5] hover:bg-[#2d6a87] text-white font-semibold shadow-lg shadow-[#3882a5]/20 transition-all active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white/80" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Confirm Entry
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
