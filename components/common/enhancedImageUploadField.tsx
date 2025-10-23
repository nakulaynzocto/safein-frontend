"use client"

import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { showErrorToast, showSuccessToast } from "@/utils/toast"
import { Camera, Upload, Image as ImageIcon, X, CheckCircle, Smartphone, FolderOpen } from "lucide-react"

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

// Check if device supports camera
const supportsCamera = () => {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia
}

export function ImageUploadField({ name, label, register, setValue, errors, initialUrl }: ImageUploadFieldProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = `${name}-file-input`
  const cameraInputId = `${name}-camera-input`

  useEffect(() => {
    setCameraSupported(supportsCamera())
  }, [])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file, "Uploaded from gallery")
    }
  }

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file, "Photo captured")
    }
  }

  const processFile = async (file: File, successMessage: string) => {
    try {
      setIsUploading(true)
      setUploadSuccess(false)
      setShowOptions(false)
      
      const url = await uploadImage(file)
      setValue(name, url, { shouldValidate: true })
      setPreviewImage(URL.createObjectURL(file))
      setUploadSuccess(true)
      showSuccessToast(`${successMessage} successfully!`)
      
      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      console.error("Image processing failed:", error)
      setValue(name, "", { shouldValidate: true })
      setPreviewImage(null)
      setUploadSuccess(false)
      showErrorToast(error instanceof Error ? error.message : "Failed to process image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearFile = () => {
    setValue(name, "", { shouldValidate: true })
    setPreviewImage(null)
    setUploadSuccess(false)
    setShowOptions(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const triggerCameraInput = () => {
    cameraInputRef.current?.click()
  }

  const toggleOptions = () => {
    setShowOptions(!showOptions)
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
                  <CheckCircle className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClearFile}
                disabled={isUploading}
                className="text-xs px-3 py-2"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleOptions}
                disabled={isUploading}
                className="text-xs px-3 py-2"
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group ${
              isUploading ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            }`}>
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <span className="text-sm text-blue-600 mt-3 font-medium animate-pulse">Processing...</span>
                  <span className="text-xs text-blue-500 mt-1">Please wait</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center" onClick={toggleOptions}>
                  <div className="w-12 h-12 bg-gray-200 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors duration-200">
                    <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 mt-3 font-medium transition-colors duration-200">
                    Upload Image
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Options Modal */}
        {showOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-center">Choose Upload Method</h3>
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full flex items-center justify-center gap-3 py-3"
                  disabled={isUploading}
                >
                  <FolderOpen className="w-5 h-5" />
                  Upload from Gallery
                </Button>
                {cameraSupported && (
                  <Button
                    type="button"
                    onClick={triggerCameraInput}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 py-3"
                    disabled={isUploading}
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setShowOptions(false)}
                  variant="ghost"
                  className="w-full py-2"
                >
                  Cancel
                </Button>
              </div>
              {!cameraSupported && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Camera not supported on this device
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          id={fileInputId}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          ref={fileInputRef}
        />
        <input
          id={cameraInputId}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          disabled={isUploading}
          ref={cameraInputRef}
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
