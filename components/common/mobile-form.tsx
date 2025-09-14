"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface MobileFormProps {
  title: string
  description?: string
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
  className?: string
}

export function MobileForm({ title, description, onSubmit, children, className }: MobileFormProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className={cn("mx-auto max-w-md", className)}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {children}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

interface MobileFormFieldProps {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
}

export function MobileFormField({ label, children, error, required }: MobileFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

interface MobileInputProps extends React.ComponentProps<typeof Input> {
  label?: string
  error?: string
  required?: boolean
}

export function MobileInput({ label, error, required, className, ...props }: MobileInputProps) {
  const input = (
    <Input 
      className={cn("h-11", className)} 
      {...props} 
    />
  )

  if (label) {
    return (
      <MobileFormField label={label} error={error} required={required}>
        {input}
      </MobileFormField>
    )
  }

  return input
}

interface MobileTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string
  error?: string
  required?: boolean
}

export function MobileTextarea({ label, error, required, className, ...props }: MobileTextareaProps) {
  const textarea = (
    <Textarea 
      className={cn("min-h-[100px]", className)} 
      {...props} 
    />
  )

  if (label) {
    return (
      <MobileFormField label={label} error={error} required={required}>
        {textarea}
      </MobileFormField>
    )
  }

  return textarea
}

interface MobileSelectProps {
  label?: string
  error?: string
  required?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function MobileSelect({ label, error, required, placeholder, value, onValueChange, children }: MobileSelectProps) {
  const select = (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )

  if (label) {
    return (
      <MobileFormField label={label} error={error} required={required}>
        {select}
      </MobileFormField>
    )
  }

  return select
}

interface MobileDatePickerProps {
  label?: string
  error?: string
  required?: boolean
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}

export function MobileDatePicker({ label, error, required, value, onChange, placeholder = "Pick a date" }: MobileDatePickerProps) {
  const datePicker = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )

  if (label) {
    return (
      <MobileFormField label={label} error={error} required={required}>
        {datePicker}
      </MobileFormField>
    )
  }

  return datePicker
}

interface MobileFormActionsProps {
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  isLoading?: boolean
}

export function MobileFormActions({ submitLabel = "Submit", cancelLabel = "Cancel", onCancel, isLoading }: MobileFormActionsProps) {
  return (
    <div className="space-y-3 pt-4">
      <Button 
        type="submit" 
        className="w-full h-11" 
        disabled={isLoading}
      >
        {submitLabel}
      </Button>
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-11" 
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  )
}
