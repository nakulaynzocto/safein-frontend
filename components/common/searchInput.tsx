"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onDebouncedChange?: (value: string) => void
  debounceDelay?: number
  className?: string
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  onDebouncedChange,
  debounceDelay = 500,
  className = ""
}: SearchInputProps) {
  const debouncedValue = useDebounce(value, debounceDelay)

  useEffect(() => {
    if (onDebouncedChange) {
      onDebouncedChange(debouncedValue)
    }
  }, [debouncedValue, onDebouncedChange])

  return (
    <div className={`flex items-center border rounded-md px-3 py-2 bg-white field__input field__input--icon-left ${className}`}>
      <Search className="h-5 w-5 text-gray-400 field__icon field__icon--left" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-2 w-full outline-none text-gray-700 field__text"
      />
    </div>
  )
}
