"use client"

import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { showErrorToast, showSuccessToast } from "@/utils/toast"
import { Image as ImageIcon, X, CheckCircle } from "lucide-react"
import { useUploadFileMutation } from "@/store/api"

interface ImageUploadFieldProps {
  name: string
  label?: string
  register: any
  setValue: any
  errors?: any
  initialUrl?: string
}

export function ImageUploadField({ name, label, register, setValue, errors, initialUrl }: ImageUploadFieldProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialUrl || null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = `${name}-file-input`

  const validateFile = (file: File): void => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit")
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed")
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    try {
      // Reset states
      setImageError(false)
      setIsImageLoading(true)
      setUploadSuccess(false)
      
      // Validate file
      validateFile(file)
      
      // Show immediate preview with local file
      const localPreview = URL.createObjectURL(file)
      setPreviewImage(localPreview)
      
      // Upload using RTK Query
      const result = await uploadFile({ file }).unwrap()
      
      // Extract URL from the result
      const uploadedUrl = result?.url
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload')
      }
      
      // Use the uploaded URL from server for preview
      setValue(name, uploadedUrl, { shouldValidate: true })
      
      // Small delay to let the image start loading before revoking blob URL
      setTimeout(() => {
        URL.revokeObjectURL(localPreview)
      }, 100)
      
      // Set the server URL as preview - keep loading state active
      setPreviewImage(uploadedUrl)
      
      // Don't set loading to false here - let handleImageLoad do it when image actually loads
      setUploadSuccess(true)
      showSuccessToast("Image uploaded successfully!")
      
      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)
      
    } catch (error: any) {
      console.error("Image processing failed:", error)
      setValue(name, "", { shouldValidate: true })
      setPreviewImage(null)
      setUploadSuccess(false)
      setImageError(true)
      
      // Clean up any preview URLs
      if (previewImage && !initialUrl) {
        URL.revokeObjectURL(previewImage)
      }
      
      showErrorToast(error?.data?.message || error?.message || "Failed to upload image")
    } finally {
      setIsImageLoading(false)
    }
  }

  const handleImageLoad = () => {
    setIsImageLoading(false)
    setImageError(false)
  }

  const handleImageError = (e: any) => {
    setIsImageLoading(false)
    setImageError(true)
    
    // If there's an error loading the server image, clear the value
    if (previewImage && previewImage.startsWith('http')) {
      setValue(name, "", { shouldValidate: true })
      setPreviewImage(null)
    }
  }

  const handleClearFile = () => {
    setValue(name, "", { shouldValidate: true })
    
    // Clean up preview URL if it's not the initial URL from props
    if (previewImage && previewImage !== initialUrl) {
      // Check if it's a blob URL before revoking
      if (previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage)
      }
    }
    
    setPreviewImage(null)
    setUploadSuccess(false)
    setImageError(false)
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
      if (previewImage && previewImage.startsWith('blob:') && previewImage !== initialUrl) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage, initialUrl])

  // Reset image error when preview changes
  useEffect(() => {
    setImageError(false)
  }, [previewImage])

  // Update preview when initialUrl changes (for edit mode)
  useEffect(() => {
    if (initialUrl && initialUrl !== previewImage) {
      setPreviewImage(initialUrl)
      setValue(name, initialUrl, { shouldValidate: true })
    } else if (!initialUrl && previewImage && previewImage.startsWith('http')) {
      // Clear preview if initialUrl is cleared
      setPreviewImage(null)
      setValue(name, '', { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl])

  return (
    <div className="space-y-3">
      {/* Render label if provided */}
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      
      <div className="flex flex-col gap-3">
        {previewImage ? (
          <div className="relative group">
            <div 
              className={`relative w-40 h-40 flex items-center justify-center border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                uploadSuccess ? 'border-green-300 bg-white' : 
                imageError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
              onClick={!isUploading ? triggerFileInput : undefined}
            >
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-500"></div>
                    <span className="text-xs text-blue-600 mt-2">Loading...</span>
                  </div>
                </div>
              )}
              
              {imageError ? (
                <div className="flex flex-col items-center justify-center text-red-500 p-4">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm text-center">Failed to load image</span>
                  <span className="text-xs text-gray-500 mt-2">Click to retry</span>
                </div>
              ) : (
                <img
                  key={previewImage}
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
              
              {/* Cross icon at top-right to remove image */}
              {!imageError && !isImageLoading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearFile()
                  }}
                  disabled={isUploading}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {/* Success indicator */}
              {uploadSuccess && !imageError && (
                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className={`flex flex-col items-center justify-center w-30 h-30 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group ${
              isUploading ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            }`}>
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
                <div className="flex flex-col items-center justify-center" onClick={triggerFileInput}>
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

        {/* Hidden file input */}
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
        <div className="text-red-600 text-sm">
          {errors.message}
        </div>
      )}
    </div>
  )
}