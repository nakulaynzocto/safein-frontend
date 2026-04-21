import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle, Ban, Pencil, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alertDialog";
import { useGetSettingsQuery, useUpdateSettingsMutation, Holiday } from "@/store/api/settingsApi";
import { cn } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { LoadingSpinner } from "@/components/common/loadingSpinner";

export function HolidaySettings() {
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    
    const [date, setDate] = useState<Date>();
    const [reason, setReason] = useState("");
    const [message, setMessage] = useState("");
    const [blockPortal, setBlockPortal] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Edit state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editDate, setEditDate] = useState<Date>();
    const [editReason, setEditReason] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [editBlockPortal, setEditBlockPortal] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const holidays = settings?.holidays || [];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;
    
    const sortedHolidays = [...holidays]
        .map((h, i) => ({ ...h, originalIndex: i }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    const totalPages = Math.ceil(sortedHolidays.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedHolidays = sortedHolidays.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleAddHoliday = async () => {
        if (!date) return;

        const newHoliday: Holiday = {
            date: date.toISOString(),
            reason: reason.trim(),
            message: message.trim(),
            blockPortal: blockPortal,
        };

        try {
            await updateSettings({
                holidays: [...holidays, newHoliday]
            }).unwrap();
            
            showSuccessToast("Holiday added successfully");
            setIsAddOpen(false);
            setDate(undefined);
            setReason("");
            setMessage("");
            setBlockPortal(false);
        } catch (error) {
            showErrorToast("Failed to add holiday");
        }
    };

    const handleEditHoliday = async () => {
        if (editingIndex === null || !editDate) return;

        const updatedHoliday: Holiday = {
            date: editDate.toISOString(),
            reason: editReason.trim(),
            message: editMessage.trim(),
            blockPortal: editBlockPortal,
        };

        try {
            const updatedHolidays = [...holidays];
            updatedHolidays[editingIndex] = updatedHoliday;

            await updateSettings({
                holidays: updatedHolidays
            }).unwrap();
            
            showSuccessToast("Holiday updated successfully");
            setIsEditOpen(false);
            setEditingIndex(null);
        } catch (error) {
            showErrorToast("Failed to update holiday");
        }
    };

    const handleDeleteHoliday = (index: number) => {
        const updatedHolidays = holidays.filter((_, i) => i !== index);
        updateSettings({
            holidays: updatedHolidays
        }).unwrap()
        .then(() => showSuccessToast("Holiday removed"))
        .catch(() => showErrorToast("Failed to remove holiday"));
    };

    const startEditing = (holiday: Holiday, index: number) => {
        setEditingIndex(index);
        setEditDate(new Date(holiday.date));
        setEditReason(holiday.reason || "");
        setEditMessage(holiday.message || "");
        setEditBlockPortal(holiday.blockPortal || false);
        setIsEditOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950">
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Office Holidays
                        </CardTitle>
                        <CardDescription>
                            Mark non-working days to alert visitors or block the portal during QR check-in
                        </CardDescription>
                    </div>
                    
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#3882a5] hover:bg-[#2d6a87] text-white rounded-xl shadow-md transition-all active:scale-95 w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Holiday
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-6 overflow-hidden">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white">Add New Holiday</DialogTitle>
                                <DialogDescription>Fill in the details to mark an official holiday.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-12 justify-start text-left font-normal rounded-xl border-slate-200 transition-all hover:bg-slate-50",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-[#3882a5]" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="center">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason (Internal)</Label>
                                    <Input
                                        placeholder="e.g. Diwali, Annual Day"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-[#3882a5]/20 focus-visible:border-[#3882a5]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Warning Message (For Visitors)</Label>
                                    <Input
                                        placeholder="e.g. Office is closed today..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-[#3882a5]/20 focus-visible:border-[#3882a5]"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-slate-800 dark:text-white">Block Portal</Label>
                                        <p className="text-[11px] text-slate-500 font-medium">Disable check-ins entirely for this day</p>
                                    </div>
                                    <Switch 
                                        checked={blockPortal}
                                        onCheckedChange={setBlockPortal}
                                    />
                                </div>
                            </div>
                            <Button 
                                className="w-full h-12 bg-[#3882a5] hover:bg-[#2d6a87] text-white rounded-xl shadow-lg mt-4 transition-all active:scale-[0.98]"
                                onClick={handleAddHoliday}
                                disabled={!date || isUpdating}
                            >
                                {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                                Save Holiday
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-6 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white">Edit Holiday</DialogTitle>
                            <DialogDescription>Update the details for this official holiday.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal rounded-xl border-slate-200 transition-all hover:bg-slate-50",
                                                !editDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-[#3882a5]" />
                                            {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="center">
                                        <Calendar
                                            mode="single"
                                            selected={editDate}
                                            onSelect={setEditDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason (Internal)</Label>
                                <Input
                                    placeholder="e.g. Diwali, Annual Day"
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-[#3882a5]/20 focus-visible:border-[#3882a5]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Warning Message (For Visitors)</Label>
                                <Input
                                    placeholder="e.g. Office is closed today..."
                                    value={editMessage}
                                    onChange={(e) => setEditMessage(e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-[#3882a5]/20 focus-visible:border-[#3882a5]"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 dark:bg-slate-900/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-slate-800 dark:text-white">Block Portal</Label>
                                    <p className="text-[11px] text-slate-500 font-medium">Disable check-ins entirely for this day</p>
                                </div>
                                <Switch 
                                    checked={editBlockPortal}
                                    onCheckedChange={setEditBlockPortal}
                                />
                            </div>
                        </div>
                        <Button 
                            className="w-full h-12 bg-[#3882a5] hover:bg-[#2d6a87] text-white rounded-xl shadow-lg mt-4 transition-all active:scale-[0.98]"
                            onClick={handleEditHoliday}
                            disabled={!editDate || isUpdating}
                        >
                            {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Update Holiday
                        </Button>
                    </DialogContent>
                </Dialog>

                {holidays.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                        <CalendarIcon className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No holidays marked yet</p>
                        <p className="text-xs text-slate-400 mt-1">Marked holidays will be shown to visitors on QR check-in</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedHolidays.map((holiday) => (
                                <div 
                                    key={holiday.originalIndex}
                                    className={cn(
                                        "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300",
                                        holiday.blockPortal ? "border-red-100 bg-red-50/5 hover:border-red-200" : "border-slate-100 hover:border-[#3882a5]/30 hover:bg-slate-50/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm",
                                            holiday.blockPortal ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700"
                                        )}>
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            {format(new Date(holiday.date), "MMM dd, yyyy")}
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => startEditing(holiday, holiday.originalIndex)}
                                                className="h-8 w-8 text-slate-400 hover:text-[#3882a5] hover:bg-[#3882a5]/10 rounded-lg transition-all"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Holiday?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove this holiday? Visitors will be able to check-in normally on this date.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                                                            onClick={() => handleDeleteHoliday(holiday.originalIndex)}
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className={cn(
                                                "font-bold text-lg line-clamp-1",
                                                holiday.blockPortal ? "text-red-900" : "text-slate-800"
                                            )}>{holiday.reason || "Holiday"}</h5>
                                            {holiday.blockPortal && (
                                                <Ban className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        {holiday.message && (
                                            <p className={cn(
                                                "text-xs mt-1 line-clamp-2 leading-relaxed opacity-70",
                                                holiday.blockPortal ? "text-red-700" : "text-slate-500"
                                            )}>
                                                "{holiday.message}"
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="absolute -bottom-2 -right-2 p-1 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                        {holiday.blockPortal ? <Ban className="h-24 w-24 text-red-500" /> : <AlertCircle className="h-24 w-24 text-[#3882a5]" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                    Showing <span className="text-slate-900 font-bold">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedHolidays.length)}</span> of <span className="text-slate-900 font-bold">{sortedHolidays.length}</span> holidays
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-xs"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                                        <span className="text-xs font-bold text-[#3882a5]">{currentPage}</span>
                                        <span className="text-xs font-bold text-slate-400">/</span>
                                        <span className="text-xs font-bold text-slate-500">{totalPages}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-xs"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
