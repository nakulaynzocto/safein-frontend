"use client"

import { forwardRef, useId, useMemo, useState, useEffect, useCallback } from "react"
import Select, { type GroupBase, type StylesConfig, type SingleValue } from "react-select"
import { cn } from "@/lib/utils"

export interface Option {
  value: string | number
  label: string
  color?: string
  searchKeywords?: string
}

type RSOption = { value: string; label: string; color?: string; searchKeywords?: string }

export interface SelectFieldProps {
  label?: string
  error?: string
  helperText?: string
  options: Option[]
  placeholder?: string
  onChange?: (value: string) => void
  onInputChange?: (inputValue: string) => void
  value?: string | number
  name?: string
  required?: boolean
  allowEmpty?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  isLoading?: boolean
  isRtl?: boolean
  isDisabled?: boolean
  disabled?: boolean
  menuZIndex?: number
  className?: string
}

const MENU_PORTAL_Z_INDEX = 2147483647 // Maximum z-index value

const SelectField = forwardRef<any, SelectFieldProps>(function SelectField(
  {
    className,
    label,
    error,
    helperText,
    options,
    placeholder = "Select option",
    value,
    onChange,
    onInputChange,
    name,
    required = false,
    allowEmpty = true,
    isClearable,
    isSearchable = true,
    isLoading,
    isRtl,
    isDisabled,
    disabled,
  },
  ref
) {
  const stableId = useId()
  const controlId = name ?? stableId
  const describedBy = error ? `${controlId}-error` : helperText ? `${controlId}-helper` : undefined
  const isFieldDisabled = !!(isDisabled || disabled)
  const isActuallyClearable = typeof isClearable === "boolean" ? isClearable : allowEmpty && !required

  // Track if component is mounted (for SSR safety)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Convert options to react-select format
  const rsOptions: RSOption[] = useMemo(
    () => options.map((o) => ({ 
      value: String(o.value), 
      label: o.label, 
      color: o.color, 
      searchKeywords: o.searchKeywords 
    })),
    [options]
  )

  // Find selected option - convert value to string for comparison
  const selectedOption: RSOption | null = useMemo(() => {
    if (value === null || value === undefined || value === "") return null
    const stringValue = String(value)
    const found = rsOptions.find((o) => o.value === stringValue)
    return found ?? null
  }, [value, rsOptions])

  // Handle selection change - use useCallback and proper typing
  const handleChange = useCallback((newValue: SingleValue<RSOption>) => {
    const selectedValue = newValue ? newValue.value : ""
    onChange?.(selectedValue)
  }, [onChange])

  // Custom filter function for searching
  // When onInputChange is provided, we're doing server-side search, so show all options
  // Otherwise, do client-side filtering
  const customFilter = useCallback((option: { label: string; value: string; data: RSOption }, inputValue: string) => {
    // If onInputChange is provided, we're doing server-side search, so show all options
    // The API will handle the filtering
    if (onInputChange) {
      return true
    }
    // Otherwise, do client-side filtering
    if (!inputValue) return true
    const searchText = inputValue.toLowerCase()
    const label = option.label.toLowerCase()
    const val = option.value.toLowerCase()
    const keywords = (option.data.searchKeywords || "").toLowerCase()
    return label.includes(searchText) || val.includes(searchText) || keywords.includes(searchText)
  }, [onInputChange])

  // Styles for react-select
  const customStyles: StylesConfig<RSOption, false, GroupBase<RSOption>> = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        backgroundColor: "#ffffff",
        minHeight: 40,
        borderRadius: 6,
        borderColor: error ? "#ef4444" : state.isFocused ? "#3882a5" : "#e5e7eb",
        boxShadow: state.isFocused ? (error ? "0 0 0 2px rgba(239, 68, 68, 0.2)" : "0 0 0 2px rgba(56, 130, 165, 0.2)") : "none",
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
        backgroundColor: optDisabled
          ? "#f9fafb"
          : isSelected
            ? "#3882a5"
            : isFocused
              ? "#e9eff6"
              : "#ffffff",
        color: optDisabled
          ? "#9ca3af"
          : isSelected
            ? "#ffffff"
            : "#161718",
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
    }),
    [error, isFieldDisabled]
  )

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={controlId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select<RSOption, false, GroupBase<RSOption>>
        ref={ref}
        inputId={controlId}
        instanceId={controlId}
        name={name}
        options={rsOptions}
        value={selectedOption}
        onChange={handleChange}
        onInputChange={onInputChange}
        placeholder={placeholder}
        isDisabled={isFieldDisabled}
        isLoading={!!isLoading}
        isClearable={isActuallyClearable}
        isSearchable={isSearchable}
        isRtl={!!isRtl}
        filterOption={customFilter}
        styles={customStyles}
        classNamePrefix="rs"
        aria-invalid={!!error}
        aria-describedby={describedBy}
        menuPortalTarget={isMounted ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
        closeMenuOnSelect={true}
        blurInputOnSelect={true}
        openMenuOnFocus={false}
        tabSelectsValue={true}
        escapeClearsValue={false}
        backspaceRemovesValue={true}
        menuShouldScrollIntoView={false}
      />

      {error && (
        <p id={`${controlId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${controlId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
})

SelectField.displayName = "SelectField"
export { SelectField }
