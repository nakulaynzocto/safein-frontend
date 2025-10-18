"use client"

import type React from "react"
import { forwardRef, useId } from "react"
import Select, { Props as ReactSelectProps, SingleValue } from "react-select"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface SelectFieldProps
  extends Omit<ReactSelectProps<Option, false>, "options" | "value" | "onChange"> {
  label?: string
  error?: string
  helperText?: string
  options: Option[]
  placeholder?: string
  onChange?: (value: string) => void
  value?: string
  name?: string
  required?: boolean
}

const SelectField = forwardRef<any, SelectFieldProps>(
  (
    { className, label, error, helperText, options, placeholder, value, onChange, name, required = false, ...props },
    ref
  ) => {
    const selectedOption: Option | null =
      options.find((opt) => opt.value === value) || null

    const handleChange = (option: SingleValue<Option>) => {
      const selectedValue = option ? option.value : ""
      onChange?.(selectedValue)
    }

    // ✅ Stable ID to prevent SSR/client mismatch
    const stableId = useId()

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={name ?? stableId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Select
          ref={ref}
          inputId={name ?? stableId}
          instanceId={name ?? stableId} // ← add this for react-select’s internal IDs
          className={cn("text-sm", className)}
          classNamePrefix="react-select"
          options={options}
          placeholder={placeholder}
          value={selectedOption}
          onChange={handleChange}
          isSearchable
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "2.5rem",
              borderRadius: "0.375rem",
              borderColor: error ? "hsl(var(--destructive))" : "#e0e0e0",
              backgroundColor: "hsl(var(--input))",
              boxShadow: state.isFocused ? `0 0 0 2px hsl(var(--ring))` : undefined,
              "&:hover": {
                borderColor: error ? "hsl(var(--destructive))" : "#e0e0e0",
              },
            }),
            placeholder: (base) => ({ ...base, color: "hsl(var(--muted-foreground))" }),
            singleValue: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
            input: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
            menu: (base) => ({ ...base, borderRadius: "0.375rem", zIndex: 20 }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? "hsl(var(--primary))"
                : "transparent",
              color: state.isFocused
                ? "hsl(var(--primary-foreground))"
                : "hsl(var(--foreground))",
              cursor: "pointer",
              "&:active": {
                backgroundColor: "hsl(var(--primary) / 0.8)",
              },
            }),
          }}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)

SelectField.displayName = "SelectField"
export { SelectField }
