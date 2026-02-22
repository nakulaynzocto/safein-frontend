"use client";

import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Label } from "@/components/ui/label";

interface PhoneInputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    defaultCountry?: string;
    className?: string; // Added className prop
}

export function PhoneInputField({
    id,
    label,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    placeholder = "Enter phone number",
    defaultCountry = "in", // India as default
    className,
}: PhoneInputFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </Label>
            <div className="phone-input-wrapper relative">
                <PhoneInput
                    country={defaultCountry}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    inputProps={{
                        id,
                        name: id,
                        required,
                        placeholder,
                        "aria-label": label,
                    }}
                    containerClass="phone-input-container"
                    inputClass={`phone-input-field pl-4 h-12 !bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium w-full ${className || ""}`}
                    buttonClass="phone-input-button !bg-background !rounded-l-xl !border-border hover:!bg-background"
                    dropdownClass="phone-input-dropdown"
                    searchClass="phone-input-search"
                    containerStyle={{
                        width: "100%",
                    }}
                    inputStyle={{
                        width: "100%",
                        height: "48px", // h-12
                        borderRadius: "12px", // rounded-xl
                        border: error ? "1px solid rgb(239 68 68)" : "1px solid rgb(226 232 240)",
                    }}
                    buttonStyle={{
                        borderRadius: "12px 0 0 12px", // rounded-xl
                        border: error ? "1px solid rgb(239 68 68)" : "1px solid rgb(226 232 240)",
                        backgroundColor: "transparent",
                    }}
                    dropdownStyle={{}}
                    searchStyle={{
                        width: "90%",
                        margin: "8px auto",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid rgb(226 232 240)",
                    }}
                    enableSearch
                    searchPlaceholder="Search country"
                    preferredCountries={["in", "us", "gb", "ae"]}
                    preserveOrder={["preferredCountries"]}
                    specialLabel=""
                />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
}
