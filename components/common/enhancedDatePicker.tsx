"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EnhancedDatePickerProps {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    className?: string;
    minDate?: string;
}

export function EnhancedDatePicker({
    label,
    value,
    onChange,
    error,
    required = false,
    className,
    minDate,
}: EnhancedDatePickerProps) {
    const [open, setOpen] = React.useState(false);

    const dateValue = React.useMemo(() => {
        if (!value) return undefined;

        if (value.includes("/")) {
            const parts = value.split("/");
            if (parts.length === 3) {
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }

        if (value.includes("-")) {
            return new Date(value + "T00:00:00");
        }

        return new Date(value);
    }, [value]);

    const today = React.useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const minDateValue = React.useMemo(() => {
        if (minDate) {
            const d = new Date(minDate + "T00:00:00");
            d.setHours(0, 0, 0, 0);
            return d;
        }
        return today;
    }, [minDate, today]);

    const handleSelect = (date: Date | undefined) => {
        if (!date) return;

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return;
        }

        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const syntheticEvent = {
            target: { value: formattedDate },
            currentTarget: { value: formattedDate },
        } as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
            onChange(syntheticEvent);
        }

        setOpen(false);
    };

    const displayValue = React.useMemo(() => {
        if (!dateValue || isNaN(dateValue.getTime())) return "";
        return format(dateValue, "dd/MM/yyyy");
    }, [dateValue]);

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-foreground text-sm font-medium">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "group h-12 w-full justify-start text-left font-medium rounded-xl bg-muted/30 pl-4 border-border", // Updated styles
                            !dateValue && "text-muted-foreground hover:bg-[#3882a5] hover:text-white",
                            error && "border-destructive focus:ring-destructive",
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {displayValue || (
                            <span className="text-muted-foreground uppercase group-hover:text-white">DD/MM/YYYY</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-lg" align="start">
                    <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={handleSelect}
                        disabled={(date) => date < minDateValue}
                        initialFocus
                        className="rounded-md border-0"
                        classNames={{
                            day_selected:
                                "bg-[#3882a5] text-white hover:bg-[#2d6a87] hover:text-white focus:bg-[#3882a5] focus:text-white",
                            day_today: "bg-gray-100 text-gray-900 font-semibold",
                        }}
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}
