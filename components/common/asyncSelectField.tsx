"use client";

import { forwardRef, useId, useState, useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { type GroupBase, type StylesConfig, type SingleValue } from "react-select";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/helpers";

export interface Option {
    value: string;
    label: string;
    color?: string;
    searchKeywords?: string;
    image?: string;
}

type RSOption = { value: string; label: string; color?: string; searchKeywords?: string; image?: string };

export interface AsyncSelectFieldProps {
    label?: string;
    error?: string;
    helperText?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    value?: string | number;
    name?: string;
    required?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
    className?: string;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    defaultOptions?: Option[] | boolean;
    cacheOptions?: boolean;
}

const MENU_PORTAL_Z_INDEX = 2147483647;

const AsyncSelectField = forwardRef<any, AsyncSelectFieldProps>(function AsyncSelectField(
    {
        className,
        label,
        error,
        helperText,
        placeholder = "Search and select...",
        value,
        onChange,
        name,
        required = false,
        isClearable = true,
        isDisabled,
        disabled,
        loadOptions,
        defaultOptions = true,
        cacheOptions = true,
    },
    ref
) {
    const stableId = useId();
    const controlId = name ?? stableId;
    const describedBy = error ? `${controlId}-error` : helperText ? `${controlId}-helper` : undefined;
    const isFieldDisabled = !!(isDisabled || disabled);

    const [isMounted, setIsMounted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<RSOption | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Convert loadOptions to return RSOption[]
    const handleLoadOptions = useCallback(
        async (inputValue: string): Promise<RSOption[]> => {
            const options = await loadOptions(inputValue);
            return options.map((o) => ({
                value: String(o.value),
                label: o.label,
                color: o.color,
                searchKeywords: o.searchKeywords,
                image: o.image,
            }));
        },
        [loadOptions]
    );

    // Update selected option when value changes
    useEffect(() => {
        if (value === null || value === undefined || value === "") {
            setSelectedOption(null);
        } else {
            const stringValue = String(value);
            // If we have a value but no selected option with matching value, 
            // we need to load it
            if (!selectedOption || selectedOption.value !== stringValue) {
                // Try loading with empty string to get default options that might include this value
                handleLoadOptions("").then((options) => {
                    const found = options.find((o) => o.value === stringValue);
                    if (found) {
                        setSelectedOption(found);
                    }
                });
            }
        }
    }, [value, selectedOption, handleLoadOptions]);

    const handleChange = useCallback(
        (newValue: SingleValue<RSOption>) => {
            const selectedValue = newValue ? newValue.value : "";
            setSelectedOption(newValue);
            onChange?.(selectedValue);
        },
        [onChange]
    );

    const customStyles: StylesConfig<RSOption, false, GroupBase<RSOption>> = {
        control: (base, state) => ({
            ...base,
            backgroundColor: "#f3f4f64d",
            minHeight: 48,
            height: 48,
            borderRadius: 12,
            borderColor: error ? "#ef4444" : state.isFocused ? "#3882a5" : "#e5e7eb",
            boxShadow: state.isFocused
                ? error
                    ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                    : "0 0 0 2px rgba(56, 130, 165, 0.2)"
                : "none",
            cursor: isFieldDisabled ? "not-allowed" : "pointer",
            opacity: isFieldDisabled ? 0.6 : 1,
            "&:hover": {
                borderColor: state.isFocused ? (error ? "#ef4444" : "#3882a5") : "#d1d5db",
            },
        }),
        valueContainer: (base) => ({
            ...base,
            padding: "0 12px",
        }),
        placeholder: (base) => ({
            ...base,
            color: "#6b7280",
            fontSize: 14,
        }),
        singleValue: (base) => ({
            ...base,
            color: "#161718",
            fontSize: 14,
        }),
        input: (base) => ({
            ...base,
            color: "#161718",
            fontSize: 14,
            margin: 0,
            padding: 0,
        }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: "#6b7280",
            padding: "0 8px",
            transition: "transform 0.2s",
            transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
            "&:hover": {
                color: "#161718",
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "#6b7280",
            padding: "0 4px",
            "&:hover": {
                color: "#ef4444",
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            marginTop: 4,
            overflow: "hidden",
            zIndex: MENU_PORTAL_Z_INDEX,
        }),
        menuList: (base) => ({
            ...base,
            padding: 4,
            maxHeight: 250,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: MENU_PORTAL_Z_INDEX,
        }),
        option: (base, { isDisabled: optDisabled, isFocused, isSelected }) => ({
            ...base,
            backgroundColor: optDisabled ? "#f9fafb" : isSelected ? "#3882a5" : isFocused ? "#e9eff6" : "#ffffff",
            color: optDisabled ? "#9ca3af" : isSelected ? "#ffffff" : "#161718",
            cursor: optDisabled ? "not-allowed" : "pointer",
            padding: "10px 12px",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: isSelected ? 500 : 400,
            "&:active": {
                backgroundColor: isSelected ? "#2c6b8a" : "#d1e7f2",
            },
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: "#6b7280",
            fontSize: 14,
            padding: "12px",
        }),
        loadingMessage: (base) => ({
            ...base,
            color: "#6b7280",
            fontSize: 14,
        }),
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label htmlFor={controlId} className="text-foreground text-sm font-medium">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}

            <AsyncSelect<RSOption, false, GroupBase<RSOption>>
                ref={ref}
                inputId={controlId}
                instanceId={controlId}
                name={name}
                cacheOptions={cacheOptions}
                defaultOptions={defaultOptions}
                loadOptions={handleLoadOptions}
                value={selectedOption}
                onChange={handleChange}
                placeholder={placeholder}
                isDisabled={isFieldDisabled}
                isClearable={isClearable}
                styles={customStyles}
                classNamePrefix="rs"
                aria-invalid={!!error}
                aria-describedby={describedBy}
                menuPortalTarget={isMounted ? document.body : null}
                menuPosition="fixed"
                menuPlacement="auto"
                closeMenuOnSelect={true}
                blurInputOnSelect={false}
                openMenuOnFocus={false}
                tabSelectsValue={true}
                escapeClearsValue={false}
                backspaceRemovesValue={true}
                menuShouldScrollIntoView={false}
                formatOptionLabel={(option) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage src={option.image} alt={option.label} className="object-cover" />
                            <AvatarFallback className="text-xs font-medium leading-none bg-secondary text-secondary-foreground flex items-center justify-center">
                                {getInitials(option.label)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{option.label}</span>
                    </div>
                )}
            />

            {error && (
                <p id={`${controlId}-error`} className="text-destructive text-xs">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p id={`${controlId}-helper`} className="text-muted-foreground text-xs">
                    {helperText}
                </p>
            )}
        </div>
    );
});

AsyncSelectField.displayName = "AsyncSelectField";
export { AsyncSelectField };
