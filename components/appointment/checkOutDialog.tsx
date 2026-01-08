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
import { formatDate, formatDateTime } from "@/utils/helpers";

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
            <DialogContent className="max-w-md bg-white dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Check Out Visitor
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Appointment Details */}
                    <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Visitor:</span>
                            <span>{getVisitorName()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Appointment ID:</span>
                            <span className="font-mono text-xs">{appointment._id}</span>
                        </div>

                        {appointment.appointmentDetails && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Scheduled:</span>
                                <span>
                                    {formatDate(appointment.appointmentDetails.scheduledDate)} at{" "}
                                    {appointment.appointmentDetails.scheduledTime}
                                </span>
                            </div>
                        )}

                        {appointment.checkInTime && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Checked In:</span>
                                <span>{formatDateTime(appointment.checkInTime)}</span>
                            </div>
                        )}
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Check-out Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes about the visit completion..."
                            className="min-h-[100px] resize-none"
                            {...register("notes")}
                        />
                        <p className="text-muted-foreground text-xs">{notes?.length || 0}/500 characters</p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting || isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                    Checking Out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Check Out
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
