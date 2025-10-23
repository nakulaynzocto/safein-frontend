"use client"

import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { showErrorToast, showSuccessToast } from "@/utils/toast"
import { Camera, Upload, Image as ImageIcon, X, CheckCircle, Smartphone, FolderOpen, RotateCcw, CameraIcon } from "lucide-react"

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
const supportsCamera = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Check camera permissions
const checkCameraPermission = async (): Promise<boolean> => {
  try {
    if (!navigator.permissions) {
      return true // Assume permission is available if permissions API is not supported
    }
    
    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return permission.state === 'granted'
  } catch (error) {
    console.log('Permission check failed:', error)
    return true // Assume permission is available if check fails
  }
}

export function ImageUploadField({ name, label, register, setValue, errors, initialUrl }: ImageUploadFieldProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputId = `${name}-file-input`

  useEffect(() => {
    setCameraSupported(supportsCamera())
  }, [])

  // Clean up camera stream when component unmounts or camera closes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file, "Uploaded from gallery")
    }
  }

  const startCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setIsCapturing(true)
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }
      
      // Request camera permission with specific constraints
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      }
      
      console.log('Requesting camera access with constraints:', constraints)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('Camera access granted, stream:', mediaStream)
      
      setStream(mediaStream)
      setShowCamera(true)
      setShowOptions(false)
      
      // Wait for video to load
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current?.play().catch(err => {
            console.error('Error playing video:', err)
            showErrorToast('Error starting camera preview')
          })
        }
        
        videoRef.current.onerror = (error) => {
          console.error('Video error:', error)
          showErrorToast('Error loading camera preview')
        }
      }
      
    } catch (error: any) {
      console.error('Camera access failed:', error)
      
      let errorMessage = 'Failed to access camera'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints cannot be satisfied.'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access blocked for security reasons. Please use HTTPS.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showErrorToast(errorMessage)
      
      // Clean up any partial state
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      setShowCamera(false)
      
    } finally {
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setCapturedImage(null)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
        
        // Stop camera after capture
        stopCamera()
      }
    }
  }

  const uploadCapturedPhoto = async () => {
    if (capturedImage && canvasRef.current) {
      try {
        setIsUploading(true)
        
        // Convert data URL to File
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        
        await processFile(file, "Photo captured and uploaded")
        setCapturedImage(null)
      } catch (error) {
        console.error('Upload failed:', error)
        showErrorToast('Failed to upload captured photo')
      } finally {
        setIsUploading(false)
      }
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
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage)
      }
    }
  }, [previewImage, initialUrl, capturedImage])

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
                  <>
                    <Button
                      type="button"
                      onClick={() => startCamera('environment')}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3 py-3"
                      disabled={isUploading || isCapturing}
                    >
                      <Camera className="w-5 h-5" />
                      {isCapturing ? 'Opening Camera...' : 'Take Photo (Rear Camera)'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => startCamera('user')}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3 py-3"
                      disabled={isUploading || isCapturing}
                    >
                      <Smartphone className="w-5 h-5" />
                      {isCapturing ? 'Opening Camera...' : 'Take Photo (Front Camera)'}
                    </Button>
                  </>
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
              
              {cameraSupported && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Camera Tips:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Make sure camera permission is allowed</li>
                    <li>• Use HTTPS for camera access</li>
                    <li>• Close other apps using camera</li>
                    <li>• Try refreshing if camera shows blank</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Camera</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={stopCamera}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  {isCapturing ? (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                        <p>Starting camera...</p>
                        <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <CameraIcon className="w-4 h-4" />
                    {isCapturing ? 'Starting Camera...' : 'Capture Photo'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Make sure camera permission is allowed in your browser settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Captured Photo Preview */}
        {capturedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">Captured Photo</h3>
                
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={capturedImage}
                    alt="Captured photo"
                    className="w-full h-64 object-cover"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={uploadCapturedPhoto}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCapturedImage(null)}
                    className="flex-1"
                  >
                    Retake
                  </Button>
                </div>
              </div>
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