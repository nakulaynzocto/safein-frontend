"use client";

import type React from "react";

import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    minTime?: string;
    show5MinuteIntervals?: boolean;
    selectedDate?: string; // ISO date string (YYYY-MM-DD)
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            required = false,
            minTime,
            show5MinuteIntervals = true,
            selectedDate,
            value,
            onChange,
            ...props
        },
        ref,
    ) => {
        const formatTo12Hour = (time: string) => {
            const [h, m] = time.split(":").map(Number);
            const period = h >= 12 ? "PM" : "AM";
            const hour12 = h % 12 === 0 ? 12 : h % 12;
            return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
        };

        const generateTimeSlots = useMemo(() => {
            if (!show5MinuteIntervals) return [];

            const slots: string[] = [];
            const now = new Date();
            const today = now.toISOString().split("T")[0];

            // Normalize selectedDate to YYYY-MM-DD format
            let normalizedSelectedDate = selectedDate;
            if (selectedDate && selectedDate.includes("/")) {
                // Convert DD/MM/YYYY to YYYY-MM-DD
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
                const roundedMinute = Math.ceil(currentMinute / 5) * 5;
                startHour = currentHour;
                startMinute = roundedMinute;

                // If rounded minute is 60, move to next hour
                if (startMinute >= 60) {
                    startHour += 1;
                    startMinute = 0;
                }

                // If we've passed midnight, no slots available
                if (startHour >= 24) {
                    return [];
                }
            } else if (normalizedSelectedDate && normalizedSelectedDate < today) {
                // If selected date is in the past, return empty slots
                return [];
            } else {
                // Future date, start from beginning of day
                startHour = 0;
                startMinute = 0;
            }

            // Generate time slots
            for (let hour = startHour; hour < 24; hour++) {
                const startMin = hour === startHour ? startMinute : 0;
                for (let minute = startMin; minute < 60; minute += 5) {
                    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                    slots.push(timeStr);
                }
            }

            return slots;
        }, [show5MinuteIntervals, selectedDate]);

        if (show5MinuteIntervals && generateTimeSlots.length > 0) {
            return (
                <div className="space-y-1.5">
                    {label && (
                        <label className="text-foreground text-sm font-medium">
                            {label}
                            {required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                    )}
                    <select
                        value={(value as string) || ""}
                        onChange={(e) => {
                            if (onChange) {
                                // Create a synthetic event compatible with HTMLInputElement
                                const syntheticEvent = {
                                    ...e,
                                    target: e.target as unknown as HTMLInputElement,
                                    currentTarget: e.currentTarget as unknown as HTMLInputElement,
                                } as React.ChangeEvent<HTMLInputElement>;
                                onChange(syntheticEvent);
                            }
                        }}
                        className={cn(
                            "border-border bg-input text-foreground focus:ring-ring flex h-9 w-full cursor-pointer appearance-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-destructive focus:ring-destructive",
                            className,
                        )}
                        style={{ zIndex: 1 }}
                        {...(props as any)}
                    >
                        <option value="">Select time</option>
                        {generateTimeSlots.map((time) => (
                            <option key={time} value={time}>
                                {formatTo12Hour(time)}
                            </option>
                        ))}
                    </select>
                    {error && <p className="text-destructive text-xs">{error}</p>}
                    {helperText && !error && <p className="text-muted-foreground text-xs">{helperText}</p>}
                </div>
            );
        }

        // Calculate min time for native time input
        const calculateMinTime = () => {
            if (minTime) return minTime;

            const now = new Date();
            const today = now.toISOString().split("T")[0];

            // Normalize selectedDate
            let normalizedSelectedDate = selectedDate;
            if (selectedDate && selectedDate.includes("/")) {
                const parts = selectedDate.split("/");
                if (parts.length === 3) {
                    normalizedSelectedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            if (normalizedSelectedDate === today) {
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const roundedMinute = Math.ceil(currentMinute / 5) * 5;
                const minHour = roundedMinute >= 60 ? currentHour + 1 : currentHour;
                const minMin = roundedMinute >= 60 ? 0 : roundedMinute;
                return `${minHour.toString().padStart(2, "0")}:${minMin.toString().padStart(2, "0")}`;
            }

            return undefined;
        };

        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="text-foreground text-sm font-medium">
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}
                <input
                    type="time"
                    min={calculateMinTime()}
                    step="300"
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "border-border bg-input text-foreground focus:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus:ring-destructive",
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-destructive text-xs">{error}</p>}
                {helperText && !error && <p className="text-muted-foreground text-xs">{helperText}</p>}
            </div>
        );
    },
);

TimePicker.displayName = "TimePicker";

export { TimePicker };
