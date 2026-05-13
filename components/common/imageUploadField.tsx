"use client";

import { useState, useRef, useEffect, type LegacyRef, useMemo } from "react";
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
    onCameraStart?: () => void;
    onCameraStop?: () => void;
}


// --- Shared Camera View (used inline inside dialogs/modals) ---
export function InlineCameraView({
    videoRef,
    canvasRef,
    facingMode,
    cameraError,
    onSwitchCamera,
    onCapture,
    onCancel,
    onFallbackToGallery,
}: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    facingMode: "environment" | "user";
    cameraError?: string | null;
    onSwitchCamera: () => void;
    onCapture: () => void;
    onCancel: () => void;
    onFallbackToGallery?: () => void;
}) {
    return (
        <div className="flex flex-col h-full min-h-[420px] bg-black">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-white text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Photo Mode</span>
                    <span className="text-white text-sm font-bold uppercase tracking-widest">Capture Image</span>
                </div>
                <button
                    type="button"
                    onClick={onSwitchCamera}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                    <RotateCw className="h-5 w-5" />
                </button>
            </div>

            {/* Video / Error area */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-900">
                {cameraError ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-red-500/20 p-4">
                            <Camera className="h-8 w-8 text-red-400" />
                        </div>
                        <h4 className="mb-2 text-base font-bold text-white">Camera Error</h4>
                        <p className="text-sm text-slate-300 mb-6 max-w-xs">{cameraError}</p>
                        <button
                            type="button"
                            onClick={() => { onCancel(); onFallbackToGallery?.(); }}
                            className="rounded-full px-8 py-2.5 bg-white text-slate-800 text-sm font-bold hover:bg-slate-100 transition-colors"
                        >
                            Use Gallery Instead
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef as LegacyRef<HTMLVideoElement>}
                            autoPlay
                            playsInline
                            muted
                            className={cn("h-full w-full object-cover", facingMode === "user" && "-scale-x-100")}
                        />
                        {/* Circular guide */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[92vw] h-[92vw] max-w-[750px] max-h-[750px] rounded-full border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
                        </div>
                    </>
                )}
            </div>

            <canvas ref={canvasRef as LegacyRef<HTMLCanvasElement>} className="hidden" />

            {/* Capture button */}
            {!cameraError && (
                <div className="flex justify-around items-center py-8 bg-black">
                    <button
                        type="button"
                        onClick={() => { onCancel(); onFallbackToGallery?.(); }}
                        className="flex flex-col items-center gap-1 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Gallery</span>
                    </button>

                    <button
                        type="button"
                        onClick={onCapture}
                        className="h-20 w-20 rounded-full bg-white border-[6px] border-white/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    />

                    <button
                        type="button"
                        onClick={onSwitchCamera}
                        className="flex flex-col items-center gap-1 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                            <RotateCw className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Flip</span>
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Internal Portal Component (wraps InlineCameraView in a fullscreen portal) ---
function CameraCapturePortal({
    open,
    videoRef,
    canvasRef,
    facingMode,
    onSwitchCamera,
    onCapture,
    onCancel,
    onFallbackToGallery,
    cameraError,
}: {
    open: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    facingMode: "environment" | "user";
    onSwitchCamera: (e?: React.MouseEvent) => void;
    onCapture: (e?: React.MouseEvent) => void;
    onCancel: (e?: React.MouseEvent) => void;
    onFallbackToGallery?: () => void;
    cameraError?: string | null;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!open || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999] flex flex-col bg-black">
            <InlineCameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                facingMode={facingMode}
                cameraError={cameraError}
                onSwitchCamera={onSwitchCamera}
                onCapture={onCapture}
                onCancel={onCancel}
                onFallbackToGallery={onFallbackToGallery}
            />
        </div>,
        document.body
    );
}

// --- Main Component ---
export function ImageUploadField({
    name, label, setValue, initialUrl, enableImageCapture = false, appointmentToken, qrSlug, onUploadStatusChange,
    variant = "default", autoOpenCamera = false, directCameraOnly = false, delayedUpload = false, value, onChange, errors, onCameraStart, onCameraStop
}: ImageUploadFieldProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(typeof initialUrl === "string" ? initialUrl : (typeof value === "string" ? value : null));
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showCaptureOptions, setShowCaptureOptions] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Initial load effects
    useEffect(() => {
        if (initialUrl instanceof File) {
            const u = URL.createObjectURL(initialUrl);
            setPreviewImage(u);
            return () => URL.revokeObjectURL(u);
        } else if (typeof initialUrl === "string") setPreviewImage(initialUrl);
    }, [initialUrl]);

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const max_size = 800;
                    let w = img.width, h = img.height;
                    if (w > h) { if (w > max_size) { h *= max_size / w; w = max_size; } }
                    else { if (h > max_size) { w *= max_size / h; h = max_size; } }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
                    canvas.toBlob((b) => resolve(b ? new File([b], file.name, { type: "image/jpeg" }) : file), "image/jpeg", 0.7);
                };
            };
        });
    };

    const processFile = async (file: File) => {
        let tempUrl: string | null = null;
        try {
            setIsImageLoading(true); onUploadStatusChange?.(true); setUploadSuccess(false);
            const compressed = await compressImage(file);
            
            if (delayedUpload) {
                tempUrl = URL.createObjectURL(compressed);
                setPreviewImage(tempUrl);
                if (setValue && name) setValue(name, compressed, { shouldValidate: true });
                if (onChange) onChange(tempUrl);
            } else {
                tempUrl = URL.createObjectURL(compressed);
                setPreviewImage(tempUrl); // Show immediately
                
                const res = await uploadFile({ file: compressed, token: appointmentToken, slug: qrSlug }).unwrap();
                if (res?.url) {
                    setPreviewImage(res.url);
                    if (setValue && name) setValue(name, res.url, { shouldValidate: true });
                    if (onChange) onChange(res.url);
                    setUploadSuccess(true);
                    setTimeout(() => setUploadSuccess(false), 3000);
                }
            }
        } catch (e: any) { 
            showErrorToast(e?.message || "Upload failed"); 
            if (!delayedUpload && tempUrl) {
                setPreviewImage(typeof initialUrl === "string" ? initialUrl : (typeof value === "string" ? value : null));
            }
        }
        finally { 
            setIsImageLoading(false); 
            onUploadStatusChange?.(false); 
        }
    };

    const startCamera = async (facing: "environment" | "user" = facingMode) => {
        try {
            setIsCapturing(true); setShowCaptureOptions(false); setCameraError(null);
            onCameraStart?.();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } } });
            streamRef.current = stream; setFacingMode(facing);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.log("Play interrupted", e));
            }
        } catch (e: any) {
            setCameraError(e?.name === 'NotAllowedError' ? "Permission denied." : "Camera unavailable.");
            showErrorToast("Camera access failed.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null; setIsCapturing(false); setCameraError(null);
        onCameraStop?.();
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const v = videoRef.current, c = canvasRef.current;
            if (!v.videoWidth || !v.videoHeight) {
                showErrorToast("Camera not ready. Please wait a moment.");
                return;
            }
            c.width = v.videoWidth; c.height = v.videoHeight;
            c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
            c.toBlob(async (b) => { if (b) { stopCamera(); await processFile(new File([b], "capture.jpg", { type: "image/jpeg" })); } }, "image/jpeg", 0.9);
        }
    };

    const commonModals = (
        <>
            <CameraCapturePortal open={isCapturing} videoRef={videoRef} canvasRef={canvasRef} facingMode={facingMode} onSwitchCamera={() => startCamera(facingMode === "environment" ? "user" : "environment")} onCapture={capturePhoto} onCancel={stopCamera} onFallbackToGallery={() => fileInputRef.current?.click()} cameraError={cameraError} />
            {showCaptureOptions && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-center mb-6">Choose Source</h3>
                        <div className="grid gap-3">
                            <Button onClick={() => { setShowCaptureOptions(false); startCamera(); }} className="h-14 rounded-2xl bg-[#3882a5]"><Camera className="mr-2 h-5 w-5" /> Take Photo</Button>
                            <Button onClick={() => { setShowCaptureOptions(false); fileInputRef.current?.click(); }} variant="secondary" className="h-14 rounded-2xl"><ImageIcon className="mr-2 h-5 w-5" /> Gallery</Button>
                            <Button onClick={() => setShowCaptureOptions(false)} variant="ghost" className="h-12">Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    const trigger = (e: any) => {
        e.preventDefault();
        if (isUploading) return;
        
        // If capture is enabled, open camera directly. 
        // Inside the camera view, there is a "Gallery" button to switch.
        if (enableImageCapture) {
            startCamera();
        } else {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={cn("relative", variant === "avatar" ? "flex flex-col items-center" : "w-full")}>
            {label && <Label className="text-sm font-bold text-slate-700 mb-2 block">{label}</Label>}
            {commonModals}
            
            <div className="relative group cursor-pointer" onClick={trigger}>
                {variant === "avatar" ? (
                    <Avatar className={cn("h-28 w-28 border-4 transition-all group-hover:scale-105", errors?.message ? "border-red-500" : "border-white shadow-xl")}>
                        <AvatarImage src={previewImage || ""} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-400"><Camera size={32} /></AvatarFallback>
                    </Avatar>
                ) : (
                    <div className={cn("h-48 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 transition-all", previewImage ? "border-solid" : "border-slate-200")}>
                        {previewImage ? <img src={previewImage} className="h-full w-full object-cover rounded-2xl" /> : (
                            <div className="text-center space-y-2">
                                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-400"><Upload size={20} /></div>
                                <p className="text-xs font-bold text-slate-500">Click to Upload</p>
                            </div>
                        )}
                    </div>
                )}
                
                {(isUploading || isImageLoading) && (
                    <div className={cn("absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-10", variant !== "avatar" ? "rounded-2xl" : "rounded-full")}>
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">Uploading...</p>
                    </div>
                )}

                <div className={cn("absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity", variant !== "avatar" && "rounded-2xl")}>
                    <Camera size={24} />
                </div>

                {uploadSuccess && <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg animate-bounce"><CheckCircle size={14} /></div>}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            {errors?.message && <p className="text-xs font-bold text-red-500 mt-2">{errors.message}</p>}
        </div>
    );
}
