"use client";

import { useState, useRef, useEffect, type LegacyRef } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Image as ImageIcon, X, CheckCircle, Camera, RotateCw, Upload, Loader2 } from "lucide-react";
import { useUploadFileMutation } from "@/store/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
    name?: string;
    label?: string;
    register?: any;
    setValue?: any;
    errors?: any;
    initialUrl?: string | File | null;
    enableImageCapture?: boolean;
    appointmentToken?: string;
    qrSlug?: string;
    onUploadStatusChange?: (isUploading: boolean) => void;
    variant?: "default" | "avatar";
    autoOpenCamera?: boolean;
    directCameraOnly?: boolean;
    delayedUpload?: boolean;
    className?: string;
    value?: string | File | null;
    onChange?: (val: string | File | null) => void;
    placeholder?: string;
    shape?: "circle" | "square";
    aspectRatio?: "video" | "square" | "portrait";
}

function CameraCapturePortal({
    open,
    videoRef,
    canvasRef,
    facingMode,
    onSwitchCamera,
    onCapture,
    onCancel,
    compactCaptureLabel,
}: {
    open: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    facingMode: "environment" | "user";
    onSwitchCamera: (e?: React.MouseEvent) => void;
    onCapture: (e?: React.MouseEvent) => void;
    onCancel: (e?: React.MouseEvent) => void;
    compactCaptureLabel?: boolean;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!open || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-stretch justify-center bg-black/90 backdrop-blur-md sm:items-center sm:p-4 pointer-events-auto"
            style={{
                paddingTop: "max(0.5rem, env(safe-area-inset-top))",
                paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
        >
            <div className="relative flex min-h-[100dvh] w-full max-w-full flex-col items-center justify-center gap-6 overflow-hidden bg-[#0b1320] px-4 py-8 shadow-2xl sm:min-h-0 sm:max-h-[min(100dvh,52rem)] sm:max-w-3xl sm:rounded-[3rem] sm:p-10 pointer-events-auto">
                {/* Header Guidance */}
                <div className="absolute top-0 left-0 right-0 p-6 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-sm font-medium tracking-wide text-white/70 uppercase">
                        {facingMode === "user" ? "Selfie Mode" : "Rear Camera"}
                    </p>
                    <p className="text-lg font-bold text-white mt-1">
                        Position face inside the circle
                    </p>
                </div>

                {/* Camera Feedback Circle */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[6px] border-[#3882a5]/30 animate-pulse" />
                    <div className="relative h-[min(82vmin,28rem)] w-[min(82vmin,28rem)] shrink-0 overflow-hidden rounded-full border-4 border-white/90 shadow-[0_0_50px_rgba(56,130,165,0.4)] sm:h-[min(72vmin,24rem)] sm:w-[min(72vmin,24rem)]">
                        <video
                            ref={videoRef as LegacyRef<HTMLVideoElement>}
                            className={cn(
                                "h-full w-full object-cover transition-transform duration-500",
                                facingMode === "user" ? "-scale-x-100" : ""
                            )}
                            autoPlay
                            playsInline
                            muted
                        />
                    </div>
                </div>
                
                <canvas ref={canvasRef as LegacyRef<HTMLCanvasElement>} className="hidden" />

                {/* Bottom Controls Container */}
                <div className="relative mt-4 flex w-full items-center justify-center gap-8 sm:mt-2">
                    {/* Ghost spacer for balance */}
                    <div className="w-12 sm:w-14" />

                    {/* Main Capture Button */}
                    <button
                        type="button"
                        onClick={onCapture}
                        className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white transition-all hover:scale-110 active:scale-90 shadow-2xl cursor-pointer"
                    >
                        <div className="absolute inset-1 rounded-full border-4 border-black/5" />
                        <div className="h-14 w-14 rounded-full border-2 border-black/10 flex items-center justify-center group-hover:bg-slate-50">
                            <Camera className="h-7 w-7 text-black" />
                        </div>
                    </button>

                    {/* Camera Switch Button - Better position for thumb access */}
                    <button
                        type="button"
                        onClick={onSwitchCamera}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90 cursor-pointer"
                        title={`Switch to ${facingMode === "environment" ? "Front" : "Back"} Camera`}
                    >
                        <RotateCw className="h-6 w-6" />
                    </button>
                </div>

                {/* Cancel Action */}
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-bold text-white/50 uppercase tracking-widest transition-colors hover:text-red-400 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export function ImageUploadField({
    name,
    label,
    register,
    setValue,
    errors,
    initialUrl,
    enableImageCapture = false,
    appointmentToken,
    qrSlug,
    onUploadStatusChange,
    variant = "default",
    autoOpenCamera = false,
    directCameraOnly = false,
    delayedUpload = false,
    className,
    value,
    onChange,
    placeholder,
    shape,
    aspectRatio,
}: ImageUploadFieldProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(typeof initialUrl === "string" ? initialUrl : (typeof value === "string" ? value : null));
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showCaptureOptions, setShowCaptureOptions] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("user");
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const hasAutoOpenedRef = useRef(false);
    const fileInputId = `${name}-file-input`;

    const validateFile = (file: File): void => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error("File size exceeds 5MB limit");
        }
        if (!file.type.startsWith("image/")) {
            throw new Error("Only image files are allowed");
        }
    };
    
    /**
     * Efficient client-side image compression
     * Resizes image to max 800px and reduces quality to 0.7
     */
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const max_size = 800; // Limit resolution for web/visitor photos

                    if (width > height) {
                        if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                        }
                    } else {
                        if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                resolve(file); // Fallback to original
                            }
                        },
                        "image/jpeg",
                        0.7 // Compression quality (0.7 is good balance of size vs quality)
                    );
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const file = event.target.files?.[0];
        if (file) {
            await processFile(file);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const processFile = async (file: File) => {
        try {
            setImageError(false);
            setIsImageLoading(true);
            onUploadStatusChange?.(true);
            setUploadSuccess(false);
            setPreviewImage(null);

            validateFile(file);
            
            // Apply compression before processing/uploading
            const compressedFile = await compressImage(file);
            const fileToProcess = compressedFile;

            if (delayedUpload) {
                const localUrl = URL.createObjectURL(fileToProcess);
                setPreviewImage(localUrl);
                if (setValue && name) setValue(name, fileToProcess, { shouldValidate: true });
                if (onChange) onChange(localUrl);
                setIsImageLoading(false);
                onUploadStatusChange?.(false);
                setUploadSuccess(true);
                return;
            }

            const result = await uploadFile({ 
                file: fileToProcess, 
                token: appointmentToken,
                slug: qrSlug 
            }).unwrap();

            const uploadedUrl = result?.url;
            if (!uploadedUrl) {
                throw new Error("No URL returned from upload");
            }

            setPreviewImage(uploadedUrl);
            if (setValue && name) setValue(name, uploadedUrl, { shouldValidate: true });
            if (onChange) onChange(uploadedUrl);

            setIsImageLoading(false);
            onUploadStatusChange?.(false);
            setUploadSuccess(true);

            setTimeout(() => {
                showSuccessToast("Image selected successfully!");
            }, 100);

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error: any) {
            if (setValue && name) setValue(name, "", { shouldValidate: true });
            if (onChange) onChange(null);
            setPreviewImage(null);
            setUploadSuccess(false);
            setImageError(true);
            setIsImageLoading(false);
            onUploadStatusChange?.(false);

            let errorMessage = "Failed to process image";
            if (error?.message) errorMessage = error.message;
            showErrorToast(errorMessage);
        }
    };

    const startCamera = async (facing: "environment" | "user" = facingMode) => {
        try {
            setIsCapturing(true);
            setShowCaptureOptions(false);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            streamRef.current = stream;
            setFacingMode(facing);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (error) {
            showErrorToast("Cannot access camera. Please check permissions.");
            stopCamera();
        }
    };

    const switchCamera = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        const newFacingMode = facingMode === "environment" ? "user" : "environment";
        startCamera(newFacingMode);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
    };

    const capturePhoto = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                async (blob) => {
                    if (blob) {
                        const file = new File([blob], `captured-image-${Date.now()}.jpg`, {
                            type: "image/jpeg",
                        });

                        stopCamera();

                        await processFile(file);
                    }
                },
                "image/jpeg",
                0.9,
            );
        }
    };

    const handleImageLoad = () => {
        setIsImageLoading(false);
        setImageError(false);
    };

    const handleImageError = (e: any) => {
        setIsImageLoading(false);
        setImageError(true);

        if (previewImage && previewImage.startsWith("http")) {
            if (setValue && name) setValue(name, "", { shouldValidate: true });
            if (onChange) onChange(null);
            setPreviewImage(null);
        }
    };

    const handleClearFile = () => {
        if (setValue && name) setValue(name, "", { shouldValidate: true });
        if (onChange) onChange(null);

        if (previewImage && previewImage !== initialUrl && previewImage !== value) {
            if (previewImage.startsWith("blob:")) {
                URL.revokeObjectURL(previewImage);
            }
        }

        setPreviewImage(null);
        setUploadSuccess(false);
        setImageError(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (enableImageCapture) {
            if (directCameraOnly) {
                startCamera();
            } else {
                setShowCaptureOptions(true);
            }
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleGalleryUpload = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setShowCaptureOptions(false);
        fileInputRef.current?.click();
    };

    const handleCameraUpload = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setShowCaptureOptions(false);
        startCamera();
    };

    const cancelCapture = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setShowCaptureOptions(false);
    };

    const cancelCamera = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        stopCamera();
    };

    useEffect(() => {
        return () => {
            if (previewImage && typeof previewImage === "string" && previewImage.startsWith("blob:") && previewImage !== initialUrl) {
                URL.revokeObjectURL(previewImage);
            }
            stopCamera();
        };
    }, [previewImage, initialUrl]);

    useEffect(() => {
        setImageError(false);
    }, [previewImage]);

    useEffect(() => {
        if (initialUrl instanceof File) {
            const u = URL.createObjectURL(initialUrl);
            setPreviewImage(u);
            return () => URL.revokeObjectURL(u);
        } else if (typeof initialUrl === "string") {
            setPreviewImage(initialUrl);
        }
    }, [initialUrl]);

    useEffect(() => {
        if (!autoOpenCamera || hasAutoOpenedRef.current || !enableImageCapture || previewImage) {
            return;
        }
        hasAutoOpenedRef.current = true;
        startCamera();
        // intentionally once per mount for explicit capture-first flows
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenCamera, enableImageCapture, previewImage]);


    if (variant === "avatar") {
        return (
            <div className="flex flex-col items-center space-y-3">
                {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}

                {/* Camera Modal (Reuse existing logic) */}
                <CameraCapturePortal
                    open={isCapturing}
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    facingMode={facingMode}
                    onSwitchCamera={switchCamera}
                    onCapture={capturePhoto}
                    onCancel={cancelCamera}
                />

                {/* Source Selection Modal (Reuse existing logic) */}
                {showCaptureOptions && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                        <div className="w-full max-w-xs rounded-xl bg-white p-4 shadow-2xl sm:w-80 sm:rounded-lg sm:p-6 dark:bg-gray-800">
                            <h3 className="mb-4 text-center text-base font-semibold sm:text-lg dark:text-white">Choose Image Source</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <Button
                                    onClick={handleCameraUpload}
                                    className="h-12 w-full justify-start rounded-xl bg-[#3882a5] text-white hover:bg-[#2d6a87] sm:text-base"
                                >
                                    <Camera className="mr-2 h-5 w-5" />
                                    <span className="text-sm sm:text-base">Take Photo</span>
                                </Button>
                                <Button
                                    onClick={handleGalleryUpload}
                                    className="h-12 w-full justify-start rounded-xl bg-gray-500 text-white hover:bg-gray-600 sm:text-base"
                                >
                                    <ImageIcon className="mr-2 h-5 w-5" />
                                    <span className="text-sm sm:text-base">Choose from Gallery</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={cancelCapture}
                                    className="h-12 w-full rounded-xl sm:text-base"
                                >
                                    <span className="text-sm sm:text-base">Cancel</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex-shrink-0 relative group">
                    <Avatar className={`h-24 w-24 border-4 ${errors?.message ? "border-red-500" : "border-muted"}`}>
                        <AvatarImage
                            src={
                                typeof previewImage === "string"
                                    ? previewImage.startsWith("blob:") 
                                        ? previewImage 
                                        : `${previewImage}${previewImage.includes("?") ? "&" : "?"}v=${previewImage?.length}`
                                    : ""
                            }
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                            <Camera className="h-8 w-8 opacity-50" />
                        </AvatarFallback>
                    </Avatar>

                    <div
                        onClick={triggerFileInput}
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity rounded-full cursor-pointer ${isUploading || isImageLoading ? "opacity-100 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"
                            }`}
                    >
                        {isUploading || isImageLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload size={24} />
                                <span className="text-[10px] mt-1 font-medium">Upload</span>
                            </div>
                        )}
                    </div>

                    {/* Error Indicator */}
                    {imageError && !isUploading && (
                        <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-20">
                            <X size={12} />
                        </div>
                    )}

                    {/* Success Indicator */}
                    {uploadSuccess && !imageError && !isUploading && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-md z-20 animate-bounce">
                            <CheckCircle size={12} />
                        </div>
                    )}
                </div>

                <input
                    id={fileInputId}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    disabled={isUploading}
                    ref={fileInputRef}
                />
                {errors && <div className="text-xs text-red-600 text-center max-w-[120px]">{errors.message}</div>}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-[3px]">
            {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}

            <div className="flex flex-col gap-3">
                <CameraCapturePortal
                    open={isCapturing}
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    facingMode={facingMode}
                    onSwitchCamera={switchCamera}
                    onCapture={capturePhoto}
                    onCancel={cancelCamera}
                    compactCaptureLabel
                />

                {showCaptureOptions && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                        <div className="w-full max-w-xs rounded-xl bg-white p-4 shadow-2xl sm:w-80 sm:rounded-lg sm:p-6 dark:bg-gray-800">
                            <h3 className="mb-4 text-center text-base font-semibold sm:text-lg dark:text-white">Choose Image Source</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <Button
                                    onClick={handleCameraUpload}
                                    className="h-12 w-full justify-start rounded-xl bg-[#3882a5] text-white hover:bg-[#2d6a87] sm:text-base"
                                >
                                    <Camera className="mr-2 h-5 w-5" />
                                    <span className="text-sm sm:text-base">Take Photo</span>
                                </Button>
                                <Button
                                    onClick={handleGalleryUpload}
                                    className="h-12 w-full justify-start rounded-xl bg-gray-500 text-white hover:bg-gray-600 sm:text-base"
                                >
                                    <ImageIcon className="mr-2 h-5 w-5" />
                                    <span className="text-sm sm:text-base">Choose from Gallery</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={cancelCapture}
                                    className="h-12 w-full rounded-xl sm:text-base"
                                >
                                    <span className="text-sm sm:text-base">Cancel</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {previewImage ? (
                    <div className="group relative">
                        <div
                            className={`relative mx-auto flex h-56 w-56 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-md transition-all duration-300 hover:shadow-lg sm:h-64 sm:w-64 ${uploadSuccess
                                ? "border-green-400 bg-white ring-2 ring-green-200"
                                : imageError
                                    ? "border-red-400 bg-red-50 ring-2 ring-red-200"
                                    : "border-gray-300 bg-white hover:border-[#3882a5] hover:ring-2 hover:ring-[#3882a5]/20"
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isUploading && !isImageLoading) {
                                    triggerFileInput(e);
                                }
                            }}
                        >
                            {isUploading && (
                                <div className="bg-opacity-95 absolute inset-0 z-10 flex items-center justify-center rounded-full bg-white">
                                    <div className="flex flex-col items-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#3882a5]/20 border-t-[#3882a5]"></div>
                                        <span className="mt-3 text-xs font-medium text-[#3882a5] sm:text-sm">
                                            Uploading...
                                        </span>
                                        <span className="mt-1 text-xs text-[#3882a5]/70">Please wait</span>
                                    </div>
                                </div>
                            )}

                            {imageError && !isUploading ? (
                                <div className="flex flex-col items-center justify-center p-3 text-red-500 sm:p-4">
                                    <ImageIcon className="mb-2 h-7 w-7 sm:h-8 sm:w-8" />
                                    <span className="text-center text-xs font-medium sm:text-sm">Failed to load</span>
                                    <span className="mt-1 text-xs text-gray-500">Tap to retry</span>
                                </div>
                            ) : !isUploading && typeof previewImage === "string" ? (
                                <img
                                    key={previewImage}
                                    src={previewImage}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            ) : null}

                            {!imageError && !isImageLoading && !isUploading && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleClearFile();
                                    }}
                                    disabled={isUploading}
                                    className="absolute top-2 right-2 z-20 rounded-full bg-red-500 p-2 text-white opacity-100 shadow-md transition-opacity duration-200 hover:bg-red-600 active:bg-red-700"
                                    title="Retake photo"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            {uploadSuccess && !imageError && !isImageLoading && !isUploading && (
                                <div className="absolute top-1.5 left-1.5 z-20 animate-bounce rounded-full bg-green-500 p-1 text-white shadow-md sm:top-2 sm:left-2 sm:p-1.5">
                                    <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div
                            className={`group mx-auto flex h-56 w-56 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm transition-all duration-300 hover:from-[#3882a5]/5 hover:to-[#3882a5]/10 hover:shadow-md sm:h-64 sm:w-64 ${isUploading
                                ? "border-[#3882a5]/40 bg-[#3882a5]/5 ring-2 ring-[#3882a5]/20"
                                : "border-gray-300 hover:border-[#3882a5]/40 hover:ring-2 hover:ring-[#3882a5]/20"
                                }`
                            }
                        >
                            {isUploading || isImageLoading ? (
                                <div className="flex flex-col items-center justify-center p-4">
                                    <div className="relative">
                                        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#3882a5]/20"></div>
                                        <div className="absolute top-0 left-0 h-8 w-8 animate-spin rounded-full border-3 border-[#3882a5] border-t-transparent"></div>
                                    </div>
                                    <span className="mt-3 animate-pulse text-xs font-medium text-[#3882a5] sm:text-sm">
                                        {isUploading ? "Uploading..." : "Loading..."}
                                    </span>
                                    <span className="mt-1 text-xs text-[#3882a5]/70">Please wait</span>
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center p-4 sm:p-6"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        triggerFileInput(e);
                                    }}
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 shadow-inner transition-all duration-300 group-hover:bg-[#3882a5]/10 group-hover:shadow-md sm:h-16 sm:w-16">
                                        {enableImageCapture ? (
                                            <Camera className="h-7 w-7 text-gray-500 transition-colors duration-300 group-hover:text-[#3882a5] sm:h-8 sm:w-8" />
                                        ) : (
                                            <ImageIcon className="h-7 w-7 text-gray-500 transition-colors duration-300 group-hover:text-[#3882a5] sm:h-8 sm:w-8" />
                                        )}
                                    </div>
                                    <span className="mt-3 text-center text-xs font-medium text-gray-600 transition-colors duration-300 group-hover:text-[#3882a5] sm:mt-4 sm:text-sm">
                                        {enableImageCapture ? (directCameraOnly ? "Open Camera" : "Take or Upload Photo") : "Upload Image"}
                                    </span>
                                    <span className="mt-1.5 text-center text-xs text-gray-400 sm:mt-2">
                                        {enableImageCapture ? (directCameraOnly ? "Tap to capture photo" : "PNG, JPG up to 5MB") : "PNG, JPG up to 5MB"}
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
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    disabled={isUploading}
                    ref={fileInputRef}
                />
            </div>
            {errors && <div className="text-sm text-red-600">{errors.message}</div>}
        </div>
    );
}
