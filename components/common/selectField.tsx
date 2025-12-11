"use client"

import type React from "react"
import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils"

interface Option {
  value: string | number
  label: string
}

interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label?: string
  error?: string
  helperText?: string
  options: Option[]
  placeholder?: string
  onChange?: (value: string) => void
  value?: string | number
  name?: string
  required?: boolean
  allowEmpty?: boolean
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = "Select option",
      value = "",
      onChange,
      name,
      required = false,
      allowEmpty = true,
      ...props
    },
    ref
  ) => {
    const stableId = useId()
    const controlId = name ?? stableId
    const describedBy = error
      ? `${controlId}-error`
      : helperText
        ? `${controlId}-helper`
        : undefined

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.target.value
      onChange?.(selectedValue)
    }

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={controlId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={controlId}
          name={name}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive focus:ring-destructive" : "",
            className
          )}
          {...props}
        >
          {allowEmpty && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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
  }
)

SelectField.displayName = "SelectField"
export { SelectField }
