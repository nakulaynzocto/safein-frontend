"use client"

import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { showErrorToast, showSuccessToast } from "@/utils/toast"
import { Image as ImageIcon, X, CheckCircle, Camera, RotateCw } from "lucide-react"
import { useUploadFileMutation } from "@/store/api"

interface ImageUploadFieldProps {
  name: string
  label?: string
  register: any
  setValue: any
  errors?: any
  initialUrl?: string
  enableImageCapture?: boolean
}

export function ImageUploadField({ 
  name, 
  label, 
  register, 
  setValue, 
  errors, 
  initialUrl, 
  enableImageCapture = false 
}: ImageUploadFieldProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialUrl || null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showCaptureOptions, setShowCaptureOptions] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
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
    event.preventDefault()
    event.stopPropagation()
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
    // Reset the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processFile = async (file: File) => {
    try {
      setImageError(false)
      setIsImageLoading(true)
      setUploadSuccess(false)
      setPreviewImage(null)
      
      validateFile(file)
      
      const result = await uploadFile({ file }).unwrap()
      
      const uploadedUrl = result?.url
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload')
      }
      
      setPreviewImage(uploadedUrl)
      
      setValue(name, uploadedUrl, { shouldValidate: true })
      
      setIsImageLoading(false)
      setUploadSuccess(true)
      
      // Show success toast after a brief delay to ensure state is updated
      setTimeout(() => {
        showSuccessToast("Image uploaded successfully!")
      }, 100)
      
      setTimeout(() => setUploadSuccess(false), 3000)
      
    } catch (error: any) {
      setValue(name, "", { shouldValidate: true })
      setPreviewImage(null)
      setUploadSuccess(false)
      setImageError(true)
      setIsImageLoading(false)
      
      showErrorToast(error?.data?.message || error?.message || "Failed to upload image")
    }
  }

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    try {
      setIsCapturing(true)
      setShowCaptureOptions(false)
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      streamRef.current = stream
      setFacingMode(facing)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      showErrorToast("Cannot access camera. Please check permissions.")
      stopCamera()
    }
  }

  const switchCamera = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment'
    startCamera(newFacingMode)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `captured-image-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          })
          
          stopCamera()
          
          await processFile(file)
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const handleImageLoad = () => {
    setIsImageLoading(false)
    setImageError(false)
  }

  const handleImageError = (e: any) => {
    setIsImageLoading(false)
    setImageError(true)
    
    if (previewImage && previewImage.startsWith('http')) {
      setValue(name, "", { shouldValidate: true })
      setPreviewImage(null)
    }
  }

  const handleClearFile = () => {
    setValue(name, "", { shouldValidate: true })
    
    if (previewImage && previewImage !== initialUrl) {
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

  const triggerFileInput = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (enableImageCapture) {
      setShowCaptureOptions(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleGalleryUpload = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setShowCaptureOptions(false)
    fileInputRef.current?.click()
  }

  const handleCameraUpload = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setShowCaptureOptions(false)
    startCamera()
  }

  const cancelCapture = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setShowCaptureOptions(false)
  }

  const cancelCamera = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    stopCamera()
  }

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:') && previewImage !== initialUrl) {
        URL.revokeObjectURL(previewImage)
      }
      stopCamera()
    }
  }, [previewImage, initialUrl])

  useEffect(() => {
    setImageError(false)
  }, [previewImage])

  useEffect(() => {
    if (initialUrl && initialUrl !== previewImage) {
      setPreviewImage(initialUrl)
      setValue(name, initialUrl, { shouldValidate: true })
    } else if (!initialUrl && previewImage && previewImage.startsWith('http')) {
      setPreviewImage(null)
      setValue(name, '', { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl])

  return (
    <div className="space-y-3 p-[3px]">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      
      <div className="flex flex-col gap-3">
        {isCapturing && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-2xl mx-auto h-full flex flex-col justify-center">
              <video
                ref={videoRef}
                className="w-full h-auto max-h-[85vh] sm:max-h-[80vh] object-contain rounded-lg"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                <Button
                  type="button"
                  onClick={switchCamera}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-2 sm:p-3 shadow-lg"
                  title={`Switch to ${facingMode === 'environment' ? 'Front' : 'Back'} Camera`}
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              
              <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-2 sm:gap-4 px-2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg text-sm sm:text-base flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Capture Photo</span>
                  <span className="sm:hidden">Capture</span>
                </Button>
                <Button
                  type="button"
                  onClick={cancelCamera}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {showCaptureOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl sm:rounded-lg p-4 sm:p-6 w-full max-w-xs sm:w-80 shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">Choose Image Source</h3>
              <div className="space-y-2 sm:space-y-3">
                <Button
                  type="button"
                  onClick={handleCameraUpload}
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-2.5"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Take Photo</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleGalleryUpload}
                  className="w-full justify-start bg-gray-500 hover:bg-gray-600 text-white py-3 sm:py-2.5"
                >
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Choose from Gallery</span>
                </Button>
                <Button
                  type="button"
                  onClick={cancelCapture}
                  variant="outline"
                  className="w-full py-3 sm:py-2.5"
                >
                  <span className="text-sm sm:text-base">Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {previewImage ? (
          <div className="relative group">
            <div 
              className={`relative w-40 h-40 sm:w-40 sm:h-40 flex items-center justify-center border-2 rounded-xl sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
                uploadSuccess ? 'border-green-400 bg-white ring-2 ring-green-200' : 
                imageError ? 'border-red-400 bg-red-50 ring-2 ring-red-200' : 'border-gray-300 bg-white hover:border-blue-500 hover:ring-2 hover:ring-blue-200'
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isUploading && !isImageLoading) {
                  triggerFileInput(e)
                }
              }}
            >
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 z-10 rounded-xl">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-500"></div>
                    <span className="text-xs sm:text-sm text-blue-600 mt-3 font-medium">Uploading...</span>
                    <span className="text-xs text-blue-500 mt-1">Please wait</span>
                  </div>
                </div>
              )}
              
              {imageError && !isUploading ? (
                <div className="flex flex-col items-center justify-center text-red-500 p-3 sm:p-4">
                  <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 mb-2" />
                  <span className="text-xs sm:text-sm text-center font-medium">Failed to load</span>
                  <span className="text-xs text-gray-500 mt-1">Tap to retry</span>
                </div>
              ) : !isUploading && previewImage ? (
                <img
                  key={previewImage}
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : null}
              
              {!imageError && !isImageLoading && !isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearFile()
                  }}
                  disabled={isUploading}
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full p-1.5 sm:p-1.5 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200 z-20 shadow-md"
                  title="Remove image"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
              
              {uploadSuccess && !imageError && !isImageLoading && !isUploading && (
                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-green-500 text-white rounded-full p-1 sm:p-1.5 shadow-md animate-bounce z-20">
                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className={`flex flex-col items-center justify-center w-full h-40 sm:w-40 sm:h-40 border-2 border-dashed rounded-xl sm:rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group shadow-sm hover:shadow-md ${
              isUploading ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200" : "border-gray-300 hover:border-blue-400 hover:ring-2 hover:ring-blue-200"
            }`}>
              {isUploading || isImageLoading ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <span className="text-xs sm:text-sm text-blue-600 mt-3 font-medium animate-pulse">
                    {isUploading ? "Uploading..." : "Loading..."}
                  </span>
                  <span className="text-xs text-blue-500 mt-1">Please wait</span>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center p-4 sm:p-6" 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    triggerFileInput(e)
                  }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner group-hover:shadow-md">
                    {enableImageCapture ? (
                      <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
                    ) : (
                      <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 group-hover:text-blue-600 mt-3 sm:mt-4 font-medium transition-colors duration-300 text-center">
                    {enableImageCapture ? "Take or Upload Photo" : "Upload Image"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1.5 sm:mt-2 text-center">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              )}
            </div>
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
        <div className="text-red-600 text-sm">
          {errors.message}
        </div>
      )}
    </div>
  )
}
