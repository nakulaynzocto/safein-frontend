"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Image as ImageIcon, X, CheckCircle, Camera, RotateCw } from "lucide-react";
import { useUploadFileMutation } from "@/store/api";

interface ImageUploadFieldProps {
    name: string;
    label?: string;
    register: any;
    setValue: any;
    errors?: any;
    initialUrl?: string;
    enableImageCapture?: boolean;
    appointmentToken?: string; // Token for public upload endpoint
    onUploadStatusChange?: (isUploading: boolean) => void;
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
    onUploadStatusChange,
}: ImageUploadFieldProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(initialUrl || null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showCaptureOptions, setShowCaptureOptions] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
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

            const result = await uploadFile({ file, token: appointmentToken }).unwrap();

            const uploadedUrl = result?.url;
            if (!uploadedUrl) {
                throw new Error("No URL returned from upload");
            }

            setPreviewImage(uploadedUrl);

            setValue(name, uploadedUrl, { shouldValidate: true });

            setIsImageLoading(false);
            onUploadStatusChange?.(false);
            setUploadSuccess(true);

            setTimeout(() => {
                showSuccessToast("Image uploaded successfully!");
            }, 100);

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error: any) {
            setValue(name, "", { shouldValidate: true });
            setPreviewImage(null);
            setUploadSuccess(false);
            setImageError(true);
            setIsImageLoading(false);
            onUploadStatusChange?.(false);

            let errorMessage = "Failed to upload image";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.data?.error) {
                errorMessage = error.data.error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.data && typeof error.data === "string") {
                errorMessage = error.data;
            } else if (error?.error) {
                errorMessage = error.error;
            } else if (typeof error === "string") {
                errorMessage = error;
            }

            showErrorToast(errorMessage);
            return;
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
            setValue(name, "", { shouldValidate: true });
            setPreviewImage(null);
        }
    };

    const handleClearFile = () => {
        setValue(name, "", { shouldValidate: true });

        if (previewImage && previewImage !== initialUrl) {
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
            setShowCaptureOptions(true);
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
            if (previewImage && previewImage.startsWith("blob:") && previewImage !== initialUrl) {
                URL.revokeObjectURL(previewImage);
            }
            stopCamera();
        };
    }, [previewImage, initialUrl]);

    useEffect(() => {
        setImageError(false);
    }, [previewImage]);

    useEffect(() => {
        if (initialUrl) {
            setPreviewImage(initialUrl);
        }
    }, [initialUrl]);

    return (
        <div className="space-y-3 p-[3px]">
            {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}

            <div className="flex flex-col gap-3">
                {isCapturing && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-2 sm:p-4">
                        <div className="relative mx-auto flex h-full w-full max-w-2xl flex-col justify-center">
                            <video
                                ref={videoRef}
                                className="h-auto max-h-[85vh] w-full rounded-lg object-contain sm:max-h-[80vh]"
                                autoPlay
                                playsInline
                                muted
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                                <Button
                                    type="button"
                                    onClick={switchCamera}
                                    className="bg-opacity-90 hover:bg-opacity-100 rounded-full bg-white p-2 text-black shadow-lg sm:p-3"
                                    title={`Switch to ${facingMode === "environment" ? "Front" : "Back"} Camera`}
                                >
                                    <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                            </div>

                            <div className="absolute right-0 bottom-2 left-0 flex justify-center gap-2 px-2 sm:bottom-4 sm:gap-4">
                                <Button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-black shadow-lg hover:bg-gray-200 sm:px-6 sm:py-3 sm:text-base"
                                >
                                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Capture Photo</span>
                                    <span className="sm:hidden">Capture</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={cancelCamera}
                                    className="rounded-full bg-red-500 px-4 py-2 text-sm text-white shadow-lg hover:bg-red-600 sm:px-6 sm:py-3 sm:text-base"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {showCaptureOptions && (
                    <div className="bg-opacity-50 fixed inset-0 z-40 flex items-center justify-center bg-black p-4">
                        <div className="w-full max-w-xs rounded-xl bg-white p-4 shadow-2xl sm:w-80 sm:rounded-lg sm:p-6">
                            <h3 className="mb-4 text-center text-base font-semibold sm:text-lg">Choose Image Source</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <Button
                                    type="button"
                                    onClick={handleCameraUpload}
                                    className="w-full justify-start bg-blue-500 py-3 text-white hover:bg-blue-600 sm:py-2.5"
                                >
                                    <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">Take Photo</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleGalleryUpload}
                                    className="w-full justify-start bg-gray-500 py-3 text-white hover:bg-gray-600 sm:py-2.5"
                                >
                                    <ImageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                    <div className="group relative">
                        <div
                            className={`relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg sm:h-40 sm:w-40 sm:rounded-xl ${
                                uploadSuccess
                                    ? "border-green-400 bg-white ring-2 ring-green-200"
                                    : imageError
                                      ? "border-red-400 bg-red-50 ring-2 ring-red-200"
                                      : "border-gray-300 bg-white hover:border-blue-500 hover:ring-2 hover:ring-blue-200"
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
                                <div className="bg-opacity-95 absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white">
                                    <div className="flex flex-col items-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-500"></div>
                                        <span className="mt-3 text-xs font-medium text-blue-600 sm:text-sm">
                                            Uploading...
                                        </span>
                                        <span className="mt-1 text-xs text-blue-500">Please wait</span>
                                    </div>
                                </div>
                            )}

                            {imageError && !isUploading ? (
                                <div className="flex flex-col items-center justify-center p-3 text-red-500 sm:p-4">
                                    <ImageIcon className="mb-2 h-7 w-7 sm:h-8 sm:w-8" />
                                    <span className="text-center text-xs font-medium sm:text-sm">Failed to load</span>
                                    <span className="mt-1 text-xs text-gray-500">Tap to retry</span>
                                </div>
                            ) : !isUploading && previewImage ? (
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
                                    className="absolute top-1.5 right-1.5 z-20 rounded-full bg-red-500 p-2 text-white opacity-100 shadow-md transition-opacity duration-200 hover:bg-red-600 active:bg-red-700 sm:top-2 sm:right-2 sm:p-1.5"
                                    title="Remove image"
                                >
                                    <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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
                            className={`group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm transition-all duration-300 hover:from-blue-50 hover:to-blue-100 hover:shadow-md sm:h-40 sm:w-40 sm:rounded-xl ${
                                isUploading
                                    ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-300 hover:border-blue-400 hover:ring-2 hover:ring-blue-200"
                            }`}
                        >
                            {isUploading || isImageLoading ? (
                                <div className="flex flex-col items-center justify-center p-4">
                                    <div className="relative">
                                        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200"></div>
                                        <div className="absolute top-0 left-0 h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent"></div>
                                    </div>
                                    <span className="mt-3 animate-pulse text-xs font-medium text-blue-600 sm:text-sm">
                                        {isUploading ? "Uploading..." : "Loading..."}
                                    </span>
                                    <span className="mt-1 text-xs text-blue-500">Please wait</span>
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
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 shadow-inner transition-all duration-300 group-hover:bg-blue-200 group-hover:shadow-md sm:h-14 sm:w-14">
                                        {enableImageCapture ? (
                                            <Camera className="h-6 w-6 text-gray-500 transition-colors duration-300 group-hover:text-blue-600 sm:h-7 sm:w-7" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-gray-500 transition-colors duration-300 group-hover:text-blue-600 sm:h-7 sm:w-7" />
                                        )}
                                    </div>
                                    <span className="mt-3 text-center text-xs font-medium text-gray-600 transition-colors duration-300 group-hover:text-blue-600 sm:mt-4 sm:text-sm">
                                        {enableImageCapture ? "Take or Upload Photo" : "Upload Image"}
                                    </span>
                                    <span className="mt-1.5 text-center text-xs text-gray-400 sm:mt-2">
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
