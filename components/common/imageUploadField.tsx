"use client"

import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"

interface ImageUploadFieldProps {
  name: string
  label: string
  register: any
  setValue: any
  errors?: any
  initialUrl?: string
}

// Function to upload image and return a URL
async function uploadImage(file: File): Promise<string> {
  try {
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed")
    }

    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    if (!response.ok) throw new Error("Image upload failed")
    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export function ImageUploadField({ name, label, register, setValue, errors, initialUrl }: ImageUploadFieldProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = `${name}-file-input`

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)
        setUploadSuccess(false)
        const url = await uploadImage(file)
        setValue(name, url, { shouldValidate: true })
        setPreviewImage(URL.createObjectURL(file)) // Show local preview
        setUploadSuccess(true)
        // Reset success state after 2 seconds
        setTimeout(() => setUploadSuccess(false), 2000)
      } catch (error) {
        console.error("Image upload failed:", error)
        setValue(name, "", { shouldValidate: true })
        setPreviewImage(null)
        setUploadSuccess(false)
        // You could show a toast notification here
        alert(error instanceof Error ? error.message : "Failed to upload image")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleClearFile = () => {
    setValue(name, "", { shouldValidate: true })
    setPreviewImage(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewImage && !initialUrl) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage, initialUrl])

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex flex-col gap-3">
        {previewImage ? (
          <div className="relative group">
            <div className={`relative w-40 h-40 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
              uploadSuccess ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <img
                src={previewImage}
                alt={label}
                className="max-w-full max-h-full object-cover rounded-lg"
                onError={() => {
                  setValue(name, "", { shouldValidate: true })
                  setPreviewImage(null)
                }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl"></div>
              
              {/* Success indicator */}
              {uploadSuccess && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleClearFile}
                className="flex items-center gap-1 text-xs px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center gap-1 text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <label
              htmlFor={fileInputId}
              className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group ${
                isUploading ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <span className="text-sm text-blue-600 mt-3 font-medium animate-pulse">Uploading...</span>
                  <span className="text-xs text-blue-500 mt-1">Please wait</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-gray-200 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors duration-200">
                    <svg
                      className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 mt-3 font-medium transition-colors duration-200">
                    Upload Image
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              )}
            </label>
          </div>
        )}
        <input
          id={fileInputId}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          ref={fileInputRef}
        />
      </div>
      {errors && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errors.message}
        </div>
      )}
    </div>
  )
}
