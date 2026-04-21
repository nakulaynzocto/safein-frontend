import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { format } from "date-fns";
import { Appointment } from "@/store/api/appointmentApi";
import {
    ExternalLink,
    User,
    Phone,
    Calendar,
    Clock,
    Briefcase,
    FileText,
    Car,
    CheckCircle,
    XCircle,
    Maximize2,
    X
} from "lucide-react";
import { StatusBadge } from "@/components/common/statusBadge";
import { formatDateWithPattern } from "@/utils/dateUtils";
import { getAppointmentDateTime, getInitials, formatName, formatTime } from "@/utils/helpers";

interface AppointmentDetailsDialogProps {
    appointment: Appointment | null;
    mode: "active";
    open: boolean;
    on_close: () => void;
    onCheckOut?: () => void;
}

const formatDate = formatDateWithPattern;

const getFieldValue = (appointment: Appointment, key: string): any => {
    const fieldMap: Record<string, (appt: Appointment) => any> = {
        _id: (appt) => appt._id || "N/A",
        visitorName: (appt) => (appt as any).visitorId?.name || appt.visitor?.name || "N/A",
        visitorPhone: (appt) => (appt as any).visitorId?.phone || appt.visitor?.phone || "N/A",
        visitorPhoto: (appt) => appt.visitorPhoto || (appt as any).visitorId?.photo || (appt as any).visitor?.photo || "",
        employeeName: (appt) => (appt as any).employeeId?.name || appt.employee?.name || "N/A",
        purpose: (appt) => appt.appointmentDetails?.purpose || "N/A",
        appointmentDate: (appt) => appt.appointmentDetails?.scheduledDate || "N/A",
        appointmentTime: (appt) => (appt.appointmentDetails?.scheduledTime ? formatTime(appt.appointmentDetails.scheduledTime) : "N/A"),
        notes: (appt) => appt.appointmentDetails?.notes || "N/A",
        vehicleNumber: (appt) => appt.appointmentDetails?.vehicleNumber || "",
        vehiclePhoto: (appt) => appt.appointmentDetails?.vehiclePhoto || "",
        checkOutTime: (appt) => appt.checkOutTime || null,
        checkInNotes: (appt) => appt.checkInNotes || (appt.securityDetails?.securityNotes) || "",
        checkOutNotes: (appt) => appt.checkOutNotes || "",
    };

    const handler = fieldMap[key];
    return handler ? handler(appointment) : appointment[key as keyof Appointment] || "N/A";
};

const statusVariants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
    completed: "default",
    "checked-out": "outline",
};

const fieldConfig = [
    { key: "visitorName", label: "Visitor Name" },
    { key: "visitorPhone", label: "Visitor Phone" },
    { key: "employeeName", label: "Meeting With" },
    { key: "purpose", label: "Purpose" },
    {
        key: "appointmentDate",
        label: "Appointment Date",
        format: (val: string) => formatDate(val, "MMM dd, yyyy"),
    },
    { key: "appointmentTime", label: "Appointment Time" },
    { key: "status", label: "Status" },
    { key: "notes", label: "Notes", optional: true },
    { key: "vehicleNumber", label: "Vehicle Number", optional: true },
    {
        key: "checkInTime",
        label: "Check In Time",
        format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' hh:mm a", "Not checked in"),
    },
    {
        key: "checkOutTime",
        label: "Check Out Time",
        showOnlyForCompleted: true,
        format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' hh:mm a", "Not checked out"),
    },
    { key: "checkInNotes", label: "Check In Notes", optional: true },
    { key: "checkOutNotes", label: "Check Out Notes", optional: true, showOnlyForCompleted: true },
    {
        key: "createdAt",
        label: "Created At",
        format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' hh:mm a"),
    },
];

export function AppointmentDetailsDialog({ appointment, mode, open, on_close, onCheckOut }: AppointmentDetailsDialogProps) {
    if (!appointment) return null;

    const visitorPhoto = getFieldValue(appointment, "visitorPhoto");
    const visitorName = formatName(getFieldValue(appointment, "visitorName"));
    const status = appointment.status;

    // Helper to group fields for cards
    const meetingDetails = [
        { key: "employeeName", label: "Meeting With", icon: Briefcase },
        { key: "purpose", label: "Purpose", icon: FileText },
        { key: "notes", label: "Notes", icon: FileText, optional: true },
    ];

    const scheduleDetails = [
        { key: "appointmentDate", label: "Appointment Date", icon: Calendar, format: (val: string) => formatDate(val, "MMM dd, yyyy") },
        { key: "appointmentTime", label: "Appointment Time", icon: Clock },
        { key: "createdAt", label: "Created At", icon: Calendar, format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' hh:mm a") },
    ];

    const checkDetails = [
        { key: "checkInTime", label: "Check In Time", icon: CheckCircle, format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' hh:mm a", "Not checked in") },
        { key: "checkOutTime", label: "Check Out Time", icon: XCircle, format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' hh:mm a", "Not checked out"), showOnlyForCompleted: true },
        { key: "vehicleNumber", label: "Vehicle Number", icon: Car, optional: true },
    ];

    const renderCardValue = (config: any) => {
        const value = getFieldValue(appointment, config.key);
        if (config.optional && !value && config.key !== "checkInTime" && config.key !== "checkOutTime") return null;
        if (config.showOnlyForCompleted && appointment.status !== "completed") return null;

        let displayValue = config.format ? config.format(value) : value;

        return (
            <div key={config.key} className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <config.icon className="h-4 w-4 text-[#3882a5]" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{config.label}</p>
                    <div className="text-xs font-bold text-gray-800 dark:text-white truncate">
                        {config.key === "employeeName" ? (
                            <div className="flex items-center gap-2">
                                <UserAvatar
                                    src={(appointment as any).employeeId?.photo || appointment.employee?.photo || ""}
                                    name={displayValue}
                                    size="sm"
                                    fallbackClassName="text-[10px]"
                                />
                                <span>{formatName(displayValue)}</span>
                            </div>
                        ) : (
                            displayValue || "N/A"
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && on_close()}>
            <DialogContent showCloseButton={false} className="max-w-lg bg-white dark:bg-gray-950 border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">Appointment Details</DialogTitle>
                <DialogDescription className="sr-only">
                    View detailed information about this appointment.
                </DialogDescription>
                
                <div className="relative h-16 bg-gradient-to-r from-[#074463] to-[#3882a5]">
                    <button 
                        onClick={on_close}
                        className="absolute right-3 top-3 h-7 w-7 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all active:scale-95 z-10"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                        <div className="group relative">
                            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-950 shadow-xl">
                                <AvatarImage src={visitorPhoto} alt={visitorName} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-[#f1f5f9] text-[#074463] flex items-center justify-center leading-none">
                                    {getInitials(visitorName, 1)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>

                <div className="px-6 pt-9 pb-4 space-y-3 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-2">
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{visitorName}</h3>
                            <div className="mt-0.5 flex items-center justify-center sm:justify-start gap-2">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200/50">
                                    <Phone className="h-2.5 w-2.5 text-[#3882a5]" />
                                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{getFieldValue(appointment, "visitorPhone")}</span>
                                </div>
                                <StatusBadge status={status} className="text-[8px] font-black tracking-widest" />
                            </div>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Meeting Management Card */}
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2 shadow-sm">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#3882a5]">Meeting Details</h4>
                            <div className="space-y-2">
                                {meetingDetails.map(renderCardValue)}
                            </div>
                        </div>

                        {/* Schedule Card */}
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2 shadow-sm">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#3882a5]">Schedule</h4>
                            <div className="space-y-2">
                                {scheduleDetails.map(renderCardValue)}
                            </div>
                        </div>

                        {/* Check Log Card */}
                        <div className="md:col-span-2 p-3 rounded-xl bg-[#074463]/[0.02] dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2 shadow-sm">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#3882a5]">Attendance Log</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {checkDetails.map(renderCardValue)}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-0.5">
                        <Button 
                            onClick={on_close} 
                            variant="primary" 
                            className="px-8 h-9 text-[10px] font-black text-white rounded-xl shadow-lg transition-all active:scale-95 hover:scale-105"
                        >
                            Understood
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
