"use client"

import type * as React from "react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, X, FileImage, File } from "lucide-react"

type FileUploadProps = {
  accept?: string
  onChange?: (file: File | null) => void
  className?: string
  label?: string
  error?: string
  required?: boolean
  maxSize?: number // in MB
  disabled?: boolean
}

export function FileUpload({ 
  accept, 
  onChange, 
  className, 
  label,
  error,
  required,
  maxSize = 5, // Default 5MB
  disabled = false
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`)
        return
      }
      
      // Validate file type if accept is specified
      if (accept && !accept.split(',').some(type => {
        const cleanType = type.trim()
        if (cleanType.startsWith('.')) {
          return file.name.toLowerCase().endsWith(cleanType.toLowerCase())
        }
        return file.type.match(cleanType.replace('*', '.*'))
      })) {
        alert(`File type not allowed. Accepted types: ${accept}`)
        return
      }
    }
    
    setSelectedFile(file)
    onChange?.(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    handleFileChange(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    const file = e.dataTransfer.files?.[0] ?? null
    handleFileChange(file)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
          dragActive && !disabled
            ? "border-primary bg-primary/5"
            : selectedFile
              ? "border-green-300 bg-green-50"
              : error
                ? "border-destructive bg-destructive/5"
                : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Upload className={cn(
              "w-8 h-8 mx-auto mb-2",
              dragActive ? "text-primary" : "text-gray-400"
            )} />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {dragActive ? "Drop file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">
              {accept ? `Accepted formats: ${accept}` : "Any file type"} • Max {maxSize}MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-destructive text-xs leading-5">{error}</p>
      )}
    </div>
  )
}