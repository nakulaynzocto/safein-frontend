import React, { useState } from "react";
import { 
    MoreVertical, 
    CheckCircle, 
    Printer, 
    MessageSquare, 
    Copy, 
    Send, 
    Trash2, 
    Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdownMenu";
import { useCooldown } from "@/hooks/useCooldown";

interface AppointmentActionCellProps {
    item: any;
    user: any;
    handleCopyLink: (link: any) => void;
    setDeleteLinkId: (id: string) => void;
    setSelectedBookingId: (id: string) => void;
    setNoteValue: (value: string) => void;
    setShowEditNoteModal: (show: boolean) => void;
    handleInlineVerifyOtp: (bookingId: string, otp: string) => Promise<void>;
    isVerifyingInline: string | null;
    handleResendApi: (item: any) => Promise<boolean>;
    handlePrintPass: (item: any) => void;
}

export const AppointmentActionCell = ({
    item,
    user,
    handleCopyLink,
    setDeleteLinkId,
    setSelectedBookingId,
    setNoteValue,
    setShowEditNoteModal,
    handleInlineVerifyOtp,
    isVerifyingInline,
    handleResendApi,
    handlePrintPass,
}: AppointmentActionCellProps) => {
    const { cooldowns, startCooldown } = useCooldown();
    const [otpValue, setOtpValue] = useState("");

    const handleResend = async () => {
        const success = await handleResendApi(item);
        if (success) {
            startCooldown(item._id);
        }
    };
    const isCreator = user?.id && (
        item.createdBy === user.id ||
        (typeof item.createdBy === 'object' && item.createdBy?._id === user.id)
    );
    const isSpecial = item.entryType === 'special';
    const isBooked = item.isBooked;

    return (
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 min-h-[40px]">
            {/* Slot 1: Inline OTP Field or Status */}
            <div className="flex-1 min-w-0 max-w-[180px]">
                {isSpecial && !isBooked ? (
                    <div className="flex items-center gap-1 p-1 bg-[#3882a5]/5 border border-[#3882a5]/10 rounded-lg transition-all hover:border-[#3882a5]/20">
                        <Input
                            className="h-7 w-full text-xs px-1.5 bg-white border-[#3882a5]/20 focus-visible:ring-[#3882a5] rounded-md tabular-nums"
                            placeholder="OTP"
                            maxLength={6}
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInlineVerifyOtp(item._id, otpValue);
                            }}
                        />
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => handleInlineVerifyOtp(item._id, otpValue)}
                            disabled={isVerifyingInline === item._id || !otpValue}
                            className="h-6 w-6 shrink-0 bg-[#3882a5] hover:bg-[#2d6a87] text-white rounded-md shadow-sm"
                        >
                            {isVerifyingInline === item._id ? (
                                <LoadingSpinner size="sm" className="h-3 w-3 border-white" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        {isBooked ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs py-0 h-5 font-bold">
                                <CheckCircle className="h-3 w-3 mr-1" /> VERIFIED
                            </Badge>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                    </div>
                )}
            </div>

            {/* Slot 2: Action Menu */}
            <div className="shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-sm">
                        {isBooked && (
                            <DropdownMenuItem
                                onClick={() => handlePrintPass(item)}
                                className="flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer focus:bg-slate-50 focus:text-[#3882a5] group"
                            >
                                <div className="bg-slate-100 p-1.5 rounded-lg group-focus:bg-[#3882a5]/10 transition-colors">
                                    <Printer className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-700">Print Visit Pass</span>
                            </DropdownMenuItem>
                        )}
                        {isSpecial && isCreator && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedBookingId(item._id);
                                    setNoteValue(item.notes || "");
                                    setShowEditNoteModal(true);
                                }}
                                className="flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer focus:bg-slate-50 focus:text-[#3882a5] group"
                            >
                                <div className="bg-slate-100 p-1.5 rounded-lg group-focus:bg-[#3882a5]/10 transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-700">{item.notes ? "Edit Priority Note" : "Add Priority Note"}</span>
                            </DropdownMenuItem>
                        )}

                        {item.entryType === 'link' && !isBooked && (
                            <DropdownMenuItem
                                onClick={() => handleCopyLink(item)}
                                className="flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer focus:bg-slate-50 focus:text-[#3882a5] group"
                            >
                                <div className="bg-slate-100 p-1.5 rounded-lg group-focus:bg-[#3882a5]/10 transition-colors">
                                    <Copy className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-700">Copy Smart Link</span>
                            </DropdownMenuItem>
                        )}

                        {!isBooked && (
                            <DropdownMenuItem
                                onClick={handleResend}
                                disabled={!!cooldowns[item._id]}
                                className="flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer focus:bg-slate-50 focus:text-[#3882a5] group disabled:opacity-50"
                            >
                                <div className="bg-slate-100 p-1.5 rounded-lg group-focus:bg-[#3882a5]/10 transition-colors">
                                    <Send className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-700">
                                    {cooldowns[item._id] ? `Retry in ${cooldowns[item._id]}s` : "Resend Notification"}
                                </span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="my-1 opacity-50" />

                        <DropdownMenuItem
                            onClick={() => setDeleteLinkId(item._id)}
                            className="flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 group"
                        >
                            <div className="bg-rose-100 p-1.5 rounded-lg group-focus:bg-rose-200/50 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">Delete Record</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
