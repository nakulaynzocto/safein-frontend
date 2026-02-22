"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EnhancedTimePickerProps {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    className?: string;
    selectedDate?: string;
}

export function EnhancedTimePicker({
    label,
    value,
    onChange,
    error,
    required = false,
    className,
    selectedDate,
}: EnhancedTimePickerProps) {
    const [open, setOpen] = React.useState(false);

    const timeSlots = React.useMemo(() => {
        const slots: string[] = [];
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        let normalizedSelectedDate = selectedDate;
        if (selectedDate && selectedDate.includes("/")) {
            const parts = selectedDate.split("/");
            if (parts.length === 3) {
                normalizedSelectedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        const isToday = normalizedSelectedDate === today;

        let startHour = 0;
        let startMinute = 0;

        if (isToday) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            // Round up to next 5-minute interval
            let roundedMinute = Math.ceil(currentMinute / 5) * 5;
            startHour = currentHour;
            startMinute = roundedMinute;

            // If rounded minute is 60, move to next hour
            if (startMinute >= 60) {
                startHour += 1;
                startMinute = 0;
            }

            // Ensure the start time is in the future
            // If rounded time is still in the past (e.g., current is 20:11, rounded is 20:10), add 5 minutes
            const currentTimeInMinutes = currentHour * 60 + currentMinute;
            const startTimeInMinutes = startHour * 60 + startMinute;

            if (startTimeInMinutes <= currentTimeInMinutes) {
                // Add 5 more minutes to ensure it's in the future
                startMinute += 5;
                if (startMinute >= 60) {
                    startHour += 1;
                    startMinute = startMinute - 60;
                }
            }

            // If we've passed midnight, no slots available
            if (startHour >= 24) {
                return [];
            }
        } else if (normalizedSelectedDate && normalizedSelectedDate < today) {
            return [];
        } else {
            startHour = 0;
            startMinute = 0;
        }

        // Get current time in minutes for comparison (only if today)
        const currentTimeInMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

        for (let hour = startHour; hour < 24; hour++) {
            const startMin = hour === startHour ? startMinute : 0;
            for (let minute = startMin; minute < 60; minute += 5) {
                const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                const slotTimeInMinutes = hour * 60 + minute;

                // Only add slots that are in the future (if today)
                if (!isToday || slotTimeInMinutes > currentTimeInMinutes) {
                    slots.push(timeStr);
                }
            }
        }

        return slots;
    }, [selectedDate]);

    const formatTo12Hour = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
    };

    const handleTimeSelect = (time: string) => {
        const syntheticEvent = {
            target: { value: time },
            currentTarget: { value: time },
        } as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
            onChange(syntheticEvent);
        }

        setOpen(false);
    };

    const displayValue = React.useMemo(() => {
        if (!value) return "";
        return formatTo12Hour(value);
    }, [value]);

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-foreground text-sm font-medium">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "group h-12 w-full justify-start text-left font-medium rounded-xl bg-background pl-4 border-border", // Updated styles
                            !value && "text-muted-foreground hover:bg-[#3882a5] hover:text-white",
                            error && "border-destructive focus:ring-destructive",
                        )}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        {displayValue || (
                            <span className="text-muted-foreground group-hover:text-white">Select time</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 shadow-lg z-[999999]" align="start">
                    <div className="h-[300px] overflow-y-auto px-1 pr-2 scrollbar-thin scrollbar-thumb-gray-200 touch-pan-y pointer-events-auto">
                        <div className="grid grid-cols-2 gap-1.5">
                            {timeSlots.length > 0 ? (
                                timeSlots.map((time) => {
                                    const isSelected = value === time;
                                    return (
                                        <Button
                                            key={time}
                                            type="button"
                                            variant={isSelected ? "default" : "ghost"}
                                            className={cn(
                                                "h-9 justify-start text-sm",
                                                isSelected && "bg-[#3882a5] text-white hover:bg-[#2d6a87]",
                                            )}
                                            onClick={() => handleTimeSelect(time)}
                                        >
                                            {formatTo12Hour(time)}
                                        </Button>
                                    );
                                })
                            ) : (
                                <div className="text-muted-foreground col-span-2 py-4 text-center text-sm">
                                    No available time slots
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}
