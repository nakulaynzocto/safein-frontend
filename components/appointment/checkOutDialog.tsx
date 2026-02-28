"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Appointment } from "@/store/api/appointmentApi";
import { LogOut, User, Calendar, Clock } from "lucide-react";
import { formatDate, formatDateTime, formatTime } from "@/utils/helpers";
import { cn } from "@/lib/utils";

const checkOutSchema = yup.object({
    notes: yup.string().optional().max(500, "Notes cannot exceed 500 characters"),
});

type CheckOutFormData = {
    notes?: string;
};

interface CheckOutDialogProps {
    appointment: Appointment | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: string, notes?: string) => Promise<void>;
    isLoading?: boolean;
}

export function CheckOutDialog({ appointment, open, onClose, onConfirm, isLoading = false }: CheckOutDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<CheckOutFormData>({
        defaultValues: {
            notes: undefined,
        },
    });

    const notes = watch("notes");

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (data: CheckOutFormData) => {
        if (!appointment) return;

        setIsSubmitting(true);
        try {
            await onConfirm(appointment._id, data.notes || undefined);
            handleClose();
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!appointment) return null;

    const getVisitorName = () => {
        return (appointment as any).visitorId?.name || appointment.visitor?.name || "N/A";
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px] rounded-3xl border-none shadow-2xl bg-white p-0 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 text-center">
                        {/* Centered Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <LogOut className="h-8 w-8 text-orange-600" />
                        </div>

                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                                Check Out Visitor
                            </DialogTitle>
                            <p className="text-gray-500 text-center text-sm mt-1">
                                Complete visit and log visitor departure.
                            </p>
                        </DialogHeader>

                        {/* Visitor Context Card */}
                        <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <User className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visitor</div>
                                    <div className="font-bold text-slate-700 truncate">{getVisitorName()}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                                <div className="space-y-1 text-left">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Date</div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        {formatDate(appointment.appointmentDetails?.scheduledDate || "")}
                                    </div>
                                </div>
                                <div className="space-y-1 text-left">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Check-in Time</div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        {formatDate(appointment.checkInTime || "")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Field */}
                        <div className="mt-4 text-left space-y-1.5">
                            <Label htmlFor="notes" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                Check-out Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any notes about the visit completion..."
                                className="min-h-[60px] py-2.5 resize-none rounded-xl border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                                {...register("notes")}
                            />
                            <div className="flex justify-end pr-1">
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    (notes?.length || 0) > 450 ? "text-rose-500" : "text-slate-400"
                                )}>
                                    {notes?.length || 0}/500
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 p-5 bg-slate-50/50 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting || isLoading}
                            className="w-full sm:flex-1 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full sm:flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white/80" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Complete Visit
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
