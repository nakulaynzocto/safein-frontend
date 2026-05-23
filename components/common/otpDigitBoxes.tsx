"use client";

import { useRef, useCallback, useEffect, useMemo, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_LENGTH = 6;

function toSlots(value: string, length: number): string[] {
    const d = value.replace(/\D/g, "").slice(0, length);
    const slots: string[] = [];
    for (let i = 0; i < length; i++) {
        slots.push(d[i] ?? "");
    }
    return slots;
}

type OtpDigitBoxesProps = {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    className?: string;
    id?: string;
    "aria-label"?: string;
};

export function OtpDigitBoxes({
    value,
    onChange,
    length = DEFAULT_LENGTH,
    disabled,
    className,
    id = "otp-digit",
    "aria-label": ariaLabel = "Verification code",
}: OtpDigitBoxesProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const slots = useMemo(() => toSlots(value, length), [value, length]);

    useEffect(() => {
        if (disabled) return;
        // Focus first empty slot or first slot if all empty
        const firstEmptyIndex = slots.findIndex(s => !s);
        const focusIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
        inputsRef.current[focusIndex]?.focus();
    }, [disabled, length]); // Remove slots from dependency to avoid refocus on typing

    const setCombined = useCallback(
        (slotsArr: string[]) => {
            onChange(slotsArr.join("").replace(/\D/g, "").slice(0, length));
        },
        [onChange, length],
    );

    const focusAt = (i: number) => {
        const el = inputsRef.current[i];
        if (el) {
            el.focus();
            el.select();
        }
    };

    const handleChange = (index: number, raw: string) => {
        const d = raw.replace(/\D/g, "");
        if (d.length > 1) {
            const next = d.slice(0, length);
            onChange(next);
            focusAt(Math.min(next.length, length - 1));
            return;
        }
        
        const nextSlots = [...slots];
        nextSlots[index] = d.slice(-1);
        setCombined(nextSlots);
        
        if (d && index < length - 1) {
            focusAt(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!slots[index] && index > 0) {
                e.preventDefault();
                const nextSlots = [...slots];
                nextSlots[index - 1] = "";
                setCombined(nextSlots);
                focusAt(index - 1);
            }
        }
        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            focusAt(index - 1);
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            focusAt(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (text) {
            onChange(text);
            focusAt(Math.min(text.length, length - 1));
        }
    };

    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={cn("flex w-full justify-center gap-1.5 sm:gap-2", className)}
        >
            {Array.from({ length }, (_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputsRef.current[i] = el;
                    }}
                    id={i === 0 ? id : `${id}-${i}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    disabled={disabled}
                    value={slots[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={cn(
                        "flex h-12 w-10 shrink-0 rounded-lg border border-slate-200 bg-white text-center text-lg font-semibold text-[#0f172a] shadow-sm outline-none transition-colors",
                        "focus:border-[#3882a5] focus:ring-2 focus:ring-[#3882a5]/25",
                        "sm:h-14 sm:w-11 sm:text-xl font-bold",
                        disabled && "cursor-not-allowed bg-slate-50 opacity-70",
                    )}
                    aria-label={`${ariaLabel} digit ${i + 1} of ${length}`}
                />
            ))}
        </div>
    );
}
