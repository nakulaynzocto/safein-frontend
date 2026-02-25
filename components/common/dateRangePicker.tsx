"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, X as XIcon, Check } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
    onDateRangeChange?: (v: { startDate: string | null; endDate: string | null }) => void;
    initialValue?: { startDate: string | null; endDate: string | null };
    className?: string;
}

const PREDEFINED_RANGES = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "last7" },
    { label: "Last 30 Days", value: "last30" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Last 1 Year", value: "lastYear" },
    { label: "All", value: "all" },
];

export default function DateRangePicker({
    onDateRangeChange,
    initialValue,
    className,
}: DateRangePickerProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        if (initialValue?.startDate && initialValue?.endDate) {
            return {
                from: new Date(initialValue.startDate),
                to: new Date(initialValue.endDate),
            };
        }
        return undefined;
    });

    const [isOpen, setIsOpen] = React.useState(false);

    // Sync from props
    React.useEffect(() => {
        if (initialValue?.startDate && initialValue?.endDate) {
            setDate({
                from: new Date(initialValue.startDate),
                to: new Date(initialValue.endDate),
            });
        } else {
            setDate(undefined);
        }
    }, [initialValue]);

    const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range);
    };

    const handleApply = () => {
        if (date?.from && date?.to) {
            onDateRangeChange?.({
                startDate: formatLocalDate(date.from),
                endDate: formatLocalDate(date.to),
            });
        }
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDate(undefined);
        onDateRangeChange?.({ startDate: null, endDate: null });
        setIsOpen(false);
    };

    const handlePresetClick = (preset: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let from: Date | undefined;
        let to: Date | undefined = today;

        switch (preset) {
            case "today":
                from = today;
                to = today;
                break;
            case "yesterday":
                from = subDays(today, 1);
                to = subDays(today, 1);
                break;
            case "last7":
                from = subDays(today, 6);
                to = today;
                break;
            case "last30":
                from = subDays(today, 29);
                to = today;
                break;
            case "thisMonth":
                from = startOfMonth(today);
                to = endOfMonth(today);
                break;
            case "lastMonth":
                const lastMonth = subMonths(today, 1);
                from = startOfMonth(lastMonth);
                to = endOfMonth(lastMonth);
                break;
            case "lastYear":
                from = subDays(today, 365);
                to = today;
                break;
            case "all":
                from = undefined;
                to = undefined;
                setDate(undefined);
                onDateRangeChange?.({ startDate: null, endDate: null });
                setIsOpen(false);
                return;
        }

        if (from && to) {
            const newRange = { from, to };
            setDate(newRange);
            onDateRangeChange?.({
                startDate: formatLocalDate(from),
                endDate: formatLocalDate(to),
            });
            setIsOpen(false);
        }
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "h-12 flex items-center justify-center font-normal rounded-xl border-border bg-background hover:bg-accent/10 transition-all",
                            !date && "text-muted-foreground",
                            date ? "px-2 sm:px-3" : "w-12 sm:w-auto sm:px-4"
                        )}
                    >
                        <CalendarIcon className={cn(
                            "h-4 w-4 shrink-0 text-[#3882a5]",
                            !date && "sm:mr-2"
                        )} />
                        
                        <span className={cn(
                            "truncate text-sm hidden sm:inline-flex items-center",
                            !date && "ml-0"
                        )}>
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                "Pick a date range"
                            )}
                        </span>

                        {date && (
                            <div 
                                role="button"
                                className="ml-1 sm:ml-2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent/20 transition-colors"
                                onClick={handleClear}
                            >
                                <XIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0 rounded-2xl shadow-2xl border-border bg-popover overflow-hidden" 
                    align="center"
                    sideOffset={8}
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Presets Sidebar */}
                        <div className="w-full md:w-40 border-b md:border-b-0 md:border-r border-border bg-muted/20 p-2 md:p-3 overflow-x-auto md:overflow-visible flex flex-row md:flex-col gap-1">
                            {PREDEFINED_RANGES.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => handlePresetClick(range.value)}
                                    className={cn(
                                        "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/80 text-left",
                                        "md:w-full flex items-center justify-between group relative",
                                        "hover:pl-4 transition-all duration-200"
                                    )}
                                >
                                    <span className="text-gray-600 group-hover:text-[#3882a5] font-medium transition-colors">{range.label}</span>
                                    <div className="h-1 w-1 rounded-full bg-transparent group-hover:bg-[#3882a5] transition-all ml-2" />
                                </button>
                            ))}
                        </div>

                        {/* Calendar Area */}
                        <div className="p-1 md:p-3">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={handleSelect}
                                numberOfMonths={2}
                                className="hidden md:block"
                            />
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={handleSelect}
                                numberOfMonths={1}
                                className="md:hidden"
                            />
                            
                            {/* Mobile/Tablet Footer */}
                            <div className="flex items-center justify-between gap-4 border-t border-border p-3 mt-1 md:mt-3">
                                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 max-w-[150px]">
                                    {date?.from && date?.to ? (
                                        `${format(date.from, "dd/MM/yy")} - ${format(date.to, "dd/MM/yy")}`
                                    ) : (
                                        "Select range"
                                    )}
                                </p>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 text-xs px-3 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-8 text-xs px-4 rounded-lg bg-[#3882a5] hover:bg-[#2d6a87] text-white"
                                        onClick={handleApply}
                                        disabled={!date?.from || !date?.to}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
