"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Country } from "country-state-city";
import Select, { type StylesConfig, type GroupBase } from "react-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
    parsePhoneNumberFromString, 
    isValidPhoneNumber, 
    AsYouType, 
    CountryCode, 
    getExampleNumber 
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

interface PhoneInputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    defaultCountry?: string;
    className?: string;
}

type CountryOption = {
    value: string;
    label: string;
    name: string;
    image: string;
    phoneCode: string;
    searchKeywords: string;
};

export function PhoneInputField({
    id,
    label,
    value = "",
    onChange,
    error: externalError,
    helperText,
    required = false,
    disabled = false,
    placeholder = "Enter phone number",
    defaultCountry = "IN",
    className,
}: PhoneInputFieldProps) {
    // 1. Prepare country options
    const countryOptions = useMemo<CountryOption[]>(() => {
        return Country.getAllCountries().map((c) => ({
            value: c.isoCode,
            label: `+${c.phonecode}`,
            name: c.name,
            searchKeywords: `${c.name} ${c.isoCode} ${c.phonecode}`,
            image: `https://flagcdn.com/w40/${c.isoCode.toLowerCase()}.png`,
            phoneCode: c.phonecode,
        }));
    }, []);

    // 2. State
    const [selectedIso, setSelectedIso] = useState(defaultCountry.toUpperCase());
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    useEffect(() => { setIsMounted(true); }, []);

    // 3. Sync value
    useEffect(() => {
        if (!value) {
            setPhoneNumber("");
            const defaultOpt = countryOptions.find(o => o.value === defaultCountry.toUpperCase());
            if (defaultOpt) setSelectedIso(defaultOpt.value);
            return;
        }

        const stringValue = String(value);
        const startsWithPlus = stringValue.startsWith("+");
        const cleanValue = stringValue.replace(/\D/g, "");

        // 1. If it starts with '+', strictly parse it as an international number
        if (startsWithPlus) {
            try {
                // Try to parse with libphonenumber-js
                const parsed = parsePhoneNumberFromString(stringValue);
                
                if (parsed && parsed.country) {
                    setSelectedIso(parsed.country as string);
                    setPhoneNumber(parsed.nationalNumber);
                    return;
                }
            } catch (e) {
                // Fallback to manual mapping below
            }

            // Fallback for startsWithPlus: Match the best country code manually
            const matchingOptions = countryOptions
                .filter((opt) => cleanValue.startsWith(opt.phoneCode))
                .sort((a, b) => b.phoneCode.length - a.phoneCode.length);

            if (matchingOptions.length > 0) {
                const bestMatch = matchingOptions[0];
                setSelectedIso(bestMatch.value);
                setPhoneNumber(cleanValue.slice(bestMatch.phoneCode.length));
                return;
            }
        }

        // 2. If no '+' prefix, default to the provided defaultCountry (e.g. IN for +91)
        const defaultOpt = countryOptions.find(o => o.value === defaultCountry.toUpperCase());
        if (defaultOpt) {
            setSelectedIso(defaultOpt.value);
            
            // Check if the number already starts with the default phone code (without '+')
            if (cleanValue.length > defaultOpt.phoneCode.length && cleanValue.startsWith(defaultOpt.phoneCode)) {
                // Treat as "CountryCode + Number" format, strip the code for display
                setPhoneNumber(cleanValue.slice(defaultOpt.phoneCode.length));
            } else {
                // Treat as a raw domestic number
                setPhoneNumber(cleanValue);
            }
        }
    }, [value, countryOptions, defaultCountry]);

    // 4. Validation
    const validateNumber = useCallback((iso: string, num: string) => {
        if (!num) {
            setInternalError(null);
            return;
        }
        
        const option = countryOptions.find(o => o.value === iso);
        if (!option) return;

        const fullNumber = `+${option.phoneCode}${num}`;
        if (!isValidPhoneNumber(fullNumber, iso as CountryCode)) {
            // Get an example number for this country to show expected length if possible
            try {
                const example = getExampleNumber(iso as CountryCode, examples);
                if (example) {
                    const exampleNational = example.formatNational().replace(/\D/g, "");
                    if (num.length < exampleNational.length) {
                        setInternalError(`Too short for ${iso}`);
                    } else if (num.length > exampleNational.length) {
                        setInternalError(`Too long for ${iso}`);
                    } else {
                        setInternalError(`Invalid number for ${iso}`);
                    }
                } else {
                    setInternalError(`Invalid number`);
                }
            } catch (e) {
                setInternalError(`Invalid number`);
            }
        } else {
            setInternalError(null);
        }
    }, [countryOptions]);

    // 5. Handlers
    const handleCountryChange = useCallback((option: CountryOption | null) => {
        if (option) {
            setSelectedIso(option.value);
            const fullValue = `+${option.phoneCode}${phoneNumber}`;
            onChange(fullValue);
            validateNumber(option.value, phoneNumber);
        }
    }, [phoneNumber, onChange, validateNumber]);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputDigits = e.target.value.replace(/\D/g, "");
        const option = countryOptions.find((o) => o.value === selectedIso);
        const code = option?.phoneCode || "";

        // Standard max length for any phone number is usually 15 digits including code
        const maxDigitsAllowed = 15 - code.length;
        const digits = inputDigits.substring(0, Math.max(10, maxDigitsAllowed + 2)); // Allow slightly more to not be too restrictive during typing

        setPhoneNumber(digits);
        onChange(`+${code}${digits}`);
        validateNumber(selectedIso, digits);
    }, [countryOptions, selectedIso, onChange, validateNumber]);

    const selectedOption = useMemo(
        () => countryOptions.find((o) => o.value === selectedIso) ?? null,
        [countryOptions, selectedIso]
    );

    const formatOptionLabel = useCallback((option: CountryOption, { context }: { context: 'menu' | 'value' }) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
            <img
                src={option.image}
                alt=""
                style={{ width: 20, height: 14, objectFit: "cover", borderRadius: 2, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{option.label}</span>
            {context === 'menu' && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginLeft: "auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {option.name}
                </span>
            )}
        </div>
    ), []);

    const countrySelectStyles: StylesConfig<CountryOption, false, GroupBase<CountryOption>> = useMemo(() => ({
        control: (base) => ({
            ...base,
            border: "none",
            boxShadow: "none",
            background: "transparent",
            minHeight: 48,
            height: 48,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            borderRadius: 0,
            padding: 0,
        }),
        valueContainer: (base) => ({
            ...base,
            padding: "0 2px 0 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
            flexWrap: "nowrap" as const,
        }),
        singleValue: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            color: "var(--foreground)",
        }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: () => ({ display: "none" }),
        clearIndicator: () => ({ display: "none" }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
            color: "var(--foreground)",
            fontSize: 14,
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "var(--popover, #ffffff)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            marginTop: 8,
            overflow: "hidden",
            zIndex: 9999,
            width: 300,
            minWidth: 280,
        }),
        menuList: (base) => ({
            ...base,
            padding: 4,
            maxHeight: 250,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
                ? "var(--primary)"
                : isFocused
                    ? "var(--accent)"
                    : "var(--background)",
            color: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: isSelected ? 600 : 400,
        }),
    }), []);

    const customFilter = useCallback(
        (option: { data: CountryOption }, inputValue: string) => {
            if (!inputValue) return true;
            const s = inputValue.toLowerCase();
            const kw = (option.data.searchKeywords || "").toLowerCase();
            const lbl = option.data.label.toLowerCase();
            return kw.includes(s) || lbl.includes(s);
        },
        []
    );

    const error = externalError || internalError;

    return (
        <div className={cn("space-y-1.5 w-full", className)}>
            {label && (
                <label htmlFor={id} className="text-foreground text-sm font-medium">
                    {label}
                    {required ? (
                        <span className="ml-1 text-red-500 font-bold">*</span>
                    ) : (
                        <span className="ml-1 text-muted-foreground text-[10px] font-normal leading-none">(Optional)</span>
                    )}
                </label>
            )}
            <div
                className={cn(
                    "phone-unified-input-field flex flex-row items-center overflow-hidden rounded-xl border transition-all duration-200 bg-background",
                    "h-12 w-full",
                    error
                        ? "border-destructive ring-2 ring-destructive/20"
                        : isFocused
                            ? "border-accent ring-2 ring-[var(--ring)]"
                            : "border-border hover:border-border-hover",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                )}
                onFocus={() => !disabled && setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                {/* Country Selector */}
                <div className="w-auto min-w-[70px] shrink-0 h-full flex items-center">
                    <Select<CountryOption>
                        value={selectedOption}
                        onChange={handleCountryChange}
                        options={countryOptions}
                        styles={countrySelectStyles}
                        isDisabled={disabled}
                        isClearable={false}
                        isSearchable={true}
                        formatOptionLabel={formatOptionLabel}
                        filterOption={customFilter}
                        menuPortalTarget={isMounted ? document.body : undefined}
                        menuPosition="fixed"
                        menuPlacement="auto"
                        classNamePrefix="phone-rs"
                    />
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-border shrink-0" />

                {/* Phone Number Input */}
                <input
                    id={id}
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="tel"
                    className="flex-1 min-w-0 h-full bg-transparent border-none pl-1.5 pr-3 text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
                />
            </div>

            {error && <p className="text-destructive text-xs">{error}</p>}
            {helperText && !error && <p className="text-muted-foreground text-xs">{helperText}</p>}

            <style jsx global>{`
                /* Prevent browser autofill from changing background color */
                .phone-unified-input-field input:-webkit-autofill,
                .phone-unified-input-field input:-webkit-autofill:hover,
                .phone-unified-input-field input:-webkit-autofill:focus,
                .phone-unified-input-field input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 50px var(--background) inset !important;
                    -webkit-text-fill-color: var(--foreground) !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                .phone-unified-input-field input {
                    background-color: transparent !important;
                }
            `}</style>
        </div>
    );
}
