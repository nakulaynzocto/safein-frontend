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
            className={`field__input field__input--icon-left flex items-center rounded-md border bg-white px-3 py-2 ${className}`}
        >
            <Search className="field__icon field__icon--left h-5 w-5 text-gray-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="off"
                className="field__text ml-2 w-full text-gray-700 outline-none"
            />
        </div>
    );
}
