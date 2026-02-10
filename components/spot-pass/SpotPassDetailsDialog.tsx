import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/utils/helpers";
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
    LogOut
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
            <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border-none shadow-2xl rounded-2xl">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-[#3882a5]">Spot Pass Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pt-4">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-dashed">
                        {/* Profile Photo */}
                        <div className="group relative shrink-0">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-[#3882a5]/10 shadow-lg">
                                <AvatarImage src={spotPass.photo} alt={spotPass.name} className="object-cover" />
                                <AvatarFallback className="text-3xl font-bold bg-[#3882a5]/5 text-[#3882a5]">
                                    {spotPass.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {spotPass.photo && (
                                <button
                                    onClick={() => window.open(spotPass.photo, "_blank")}
                                    className="absolute right-0 bottom-0 rounded-full bg-[#3882a5] p-2 text-white shadow-xl transition-all hover:scale-110 active:scale-95"
                                    title="View full image"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-4 text-center sm:text-left">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{spotPass.name}</h3>
                                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <Phone className="h-3.5 w-3.5 text-[#3882a5]" />
                                        <span className="text-sm font-medium">{spotPass.phone}</span>
                                    </div>
                                    <Badge variant={spotPass.status === 'checked-in' ? 'default' : 'secondary'} className={`px-3 py-1 text-xs capitalize ${spotPass.status === 'checked-in' ? 'bg-[#3882a5] hover:bg-[#2d6a87]' : ''}`}>
                                        {spotPass.status === 'checked-in' ? (
                                            <Clock className="mr-1.5 h-3 w-3 inline" />
                                        ) : (
                                            <CheckCircle2 className="mr-1.5 h-3 w-3 inline" />
                                        )}
                                        {spotPass.status === 'checked-in' ? 'Checked In' : 'Checked Out'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Personal Info */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Visitor Information</h4>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 rounded-lg bg-[#3882a5]/5 text-[#3882a5]">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Gender</p>
                                        <p className="text-sm font-semibold capitalize">{spotPass.gender}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 rounded-lg bg-[#3882a5]/5 text-[#3882a5]">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Address</p>
                                        <p className="text-sm font-semibold">{spotPass.address || "N/A"}</p>
                                    </div>
                                </div>

                                {spotPass.employeeId && (
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2 rounded-lg bg-[#3882a5]/5 text-[#3882a5]">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Meet To</p>
                                            <p className="text-sm font-semibold capitalize">
                                                {/* @ts-ignore */}
                                                {typeof spotPass.employeeId === 'object' ? spotPass.employeeId.name : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Entry Log */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Activity Log</h4>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 rounded-lg bg-emerald-500/5 text-emerald-600">
                                        <LogOut className="h-4 w-4 rotate-180" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Check-in Time</p>
                                        <p className="text-sm font-semibold">
                                            {format(new Date(spotPass.checkInTime), "dd/MM/yyyy hh:mm a")}
                                        </p>
                                    </div>
                                </div>

                                {spotPass.checkOutTime && (
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2 rounded-lg bg-blue-500/5 text-blue-600">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Check-out Time</p>
                                            <p className="text-sm font-semibold">
                                                {format(new Date(spotPass.checkOutTime), "dd/MM/yyyy hh:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Full Width Row: Notes */}
                        {spotPass.notes && (
                            <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <FileText className="h-3.5 w-3.5" />
                                    Internal Notes
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 italic">
                                    "{spotPass.notes}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-6 border-t mt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="px-10 h-11 font-semibold rounded-xl border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5]/10">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
