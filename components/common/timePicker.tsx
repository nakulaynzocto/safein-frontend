"use client"

import type React from "react"

import { forwardRef, useMemo } from "react"
import { cn } from "@/lib/utils"

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  minTime?: string
  show5MinuteIntervals?: boolean
  selectedDate?: string // ISO date string (YYYY-MM-DD)
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, label, error, helperText, required = false, minTime, show5MinuteIntervals = true, selectedDate, value, onChange, ...props }, ref) => {
    
    const generateTimeSlots = useMemo(() => {
      if (!show5MinuteIntervals) return []
      
      const slots: string[] = []
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      const isToday = selectedDate === today
      
      let startHour = 0
      let startMinute = 0
      
      if (isToday) {
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const roundedMinute = Math.ceil(currentMinute / 5) * 5
        startHour = currentHour
        startMinute = roundedMinute
        
        if (startMinute >= 60) {
          startHour += 1
          startMinute = 0
        }
        
        if (startHour >= 24) {
          return []
        }
      } else {
        startHour = 0
        startMinute = 0
      }
      
      for (let hour = startHour; hour < 24; hour++) {
        const startMin = hour === startHour ? startMinute : 0
        for (let minute = startMin; minute < 60; minute += 5) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          slots.push(timeStr)
        }
      }
      
      return slots
    }, [show5MinuteIntervals, selectedDate])
    
    if (show5MinuteIntervals && generateTimeSlots.length > 0) {
      return (
        <div className="space-y-2">
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <select
            value={value as string || ""}
            onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              className,
            )}
            {...(props as any)}
          >
            <option value="">Select time</option>
            {generateTimeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          type="time"
          min={minTime}
          step="300"
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    )
  },
)

TimePicker.displayName = "TimePicker"

export { TimePicker }
