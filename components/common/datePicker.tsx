"use client";

import type React from "react";

import { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    minDate?: string;
    required?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, label, error, helperText, minDate, required = false, onChange, value, ...props }, ref) => {
        // Always use today as minimum date to prevent past date selection
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];
        const minDateValue = minDate || todayStr;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedValue = e.target.value;

            if (selectedValue) {
                // Validate that selected date is not in the past
                const selectedDate = new Date(selectedValue + "T00:00:00");
                selectedDate.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    // If past date is selected, reset to today
                    e.target.value = todayStr;
                    if (onChange) {
                        const syntheticEvent = {
                            ...e,
                            target: { ...e.target, value: todayStr } as HTMLInputElement,
                        } as React.ChangeEvent<HTMLInputElement>;
                        onChange(syntheticEvent);
                    }
                    return;
                }
            }

            if (onChange) {
                onChange(e);
            }
        };

        // Normalize value to YYYY-MM-DD format
        const normalizedValue = value
            ? (() => {
                  if (typeof value === "string") {
                      if (value.includes("/")) {
                          // Convert DD/MM/YYYY to YYYY-MM-DD
                          const parts = value.split("/");
                          if (parts.length === 3) {
                              return `${parts[2]}-${parts[1]}-${parts[0]}`;
                          }
                      }
                      return value;
                  }
                  return value;
              })()
            : value;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="text-foreground text-sm font-medium">
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        type="date"
                        min={minDateValue}
                        max="2099-12-31"
                        value={normalizedValue}
                        onChange={handleChange}
                        className={cn(
                            "border-border bg-input text-foreground focus:ring-ring flex h-9 w-full rounded-md border py-2 pr-10 pl-3 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-destructive focus:ring-destructive",
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />
                    <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                </div>
                {error && <p className="text-destructive text-xs">{error}</p>}
                {helperText && !error && <p className="text-muted-foreground text-xs">{helperText}</p>}
            </div>
        );
    },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
