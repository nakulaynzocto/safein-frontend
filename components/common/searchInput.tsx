"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onDebouncedChange?: (value: string) => void;
    debounceDelay?: number;
    className?: string;
}

export function SearchInput({
    placeholder,
    value,
    onChange,
    onDebouncedChange,
    debounceDelay = 500,
    className = "",
}: SearchInputProps) {
    const debouncedValue = useDebounce(value, debounceDelay);

    useEffect(() => {
        if (onDebouncedChange) {
            onDebouncedChange(debouncedValue);
        }
    }, [debouncedValue, onDebouncedChange]);

    return (
        <div
            className={`flex items-center rounded-xl border border-border bg-background px-3 h-12 transition-all focus-within:bg-background focus-within:ring-1 focus-within:ring-ring ${className}`}
        >
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="off"
                className="ml-2 w-full bg-transparent text-foreground outline-none font-medium placeholder:text-muted-foreground"
            />
        </div>
    );
}
