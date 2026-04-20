import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials, formatName } from "@/utils/helpers";
import { format } from "date-fns";
import { SpotPass } from "@/store/api/spotPassApi";
import {
    User,
    Phone,
    MapPin,
    Calendar,
    Maximize2,
    Briefcase,
    FileText,
    Clock,
    CheckCircle2,
    X
} from "lucide-react";

interface SpotPassDetailsDialogProps {
    spotPass: SpotPass | null;
    open: boolean;
    onClose: () => void;
}

export function SpotPassDetailsDialog({ spotPass, open, onClose }: SpotPassDetailsDialogProps) {
    if (!spotPass) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent showCloseButton={false} className="max-w-lg bg-white dark:bg-gray-950 border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">Spot Pass Details</DialogTitle>
                <DialogDescription className="sr-only">
                    View detailed information about this spot pass.
                </DialogDescription>
                <div className="relative h-16 bg-gradient-to-r from-[#074463] to-[#3882a5]">
                    <button 
                        onClick={onClose}
                        className="absolute right-3 top-3 h-7 w-7 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all active:scale-95 z-10"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                        <div className="group relative">
                            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-950 shadow-xl">
                                <AvatarImage src={spotPass.photo} alt={spotPass.name} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-[#f1f5f9] text-[#074463] flex items-center justify-center leading-none">
                                    {getInitials(spotPass.name, 1)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>

                <div className="px-6 pt-9 pb-4 space-y-3 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-2">
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{formatName(spotPass.name)}</h3>
                            <div className="mt-0.5 flex items-center justify-center sm:justify-start gap-2">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200/50">
                                    <Phone className="h-2.5 w-2.5 text-[#3882a5]" />
                                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{spotPass.phone}</span>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-wider ${
                                    spotPass.status === 'checked-in' 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                    {spotPass.status === 'checked-in' ? <Clock className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5" />}
                                    {spotPass.status === 'checked-in' ? 'In' : 'Out'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Info Block 1 */}
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2 shadow-sm">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#3882a5]">Visitor Info</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-[#3882a5]">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-gray-400 font-black uppercase">Gender</p>
                                        <p className="text-[11px] font-bold capitalize">{spotPass.gender}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-[#3882a5]">
                                        <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] text-gray-400 font-black uppercase">Address</p>
                                        <p className="text-[11px] font-bold truncate">{spotPass.address || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Block 2 */}
                        <div className="p-3 rounded-xl bg-[#074463]/[0.02] dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2 shadow-sm">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#3882a5]">Log</h4>
                            <div className="space-y-3">
                                <div className="relative pl-4 border-l-2 border-emerald-500/20 py-0.5">
                                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                    <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">Check-in</p>
                                    <p className="text-[10px] font-black text-gray-900 dark:text-white leading-tight">
                                        {format(new Date(spotPass.checkInTime), "dd MMM")} · <span className="text-emerald-600 font-bold">{format(new Date(spotPass.checkInTime), "hh:mm a")}</span>
                                    </p>
                                </div>
                                {spotPass.checkOutTime && (
                                    <div className="relative pl-4 border-l-2 border-blue-500/20 py-0.5">
                                        <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                                        <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">Check-out</p>
                                        <p className="text-[10px] font-black text-gray-900 dark:text-white leading-tight">
                                            {format(new Date(spotPass.checkOutTime), "dd MMM")} · <span className="text-blue-600 font-bold">{format(new Date(spotPass.checkOutTime), "hh:mm a")}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Full Width Row: Notes */}
                        {spotPass.notes && (
                            <div className="md:col-span-2 p-3 rounded-xl bg-[#3882a5]/5 border border-[#3882a5]/10 space-y-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#3882a5]">
                                    <FileText className="h-3 w-3" />
                                    Notes
                                </div>
                                <p className="text-[11px] font-medium italic opacity-80 truncate">
                                    "{spotPass.notes}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-0.5">
                        <Button 
                            onClick={onClose} 
                            variant="primary" 
                            className="px-8 h-9 text-[10px] font-black text-white rounded-xl shadow-lg transition-all active:scale-95 hover:scale-105"
                        >
                            Got it
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
