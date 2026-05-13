"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/store/api/appointmentApi";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { LogIn, User, Calendar, Clock, CheckCircle2, ImagePlus, Camera, RotateCw, X, Loader2 } from "lucide-react";
import { formatDate, formatTime } from "@/utils/helpers";
import { useUploadFileMutation } from "@/store/api";
import { ImageUploadField, InlineCameraView } from "@/components/common/imageUploadField";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CheckInDialogProps {
    appointment: Appointment | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: string, notes?: string, visitorPhoto?: string) => Promise<void>;
    isLoading?: boolean;
}

type ViewState = "form" | "camera" | "preview";

export function CheckInDialog({ appointment, open, onClose, onConfirm, isLoading = false }: CheckInDialogProps) {
    const { data: settingsData } = useGetSettingsQuery();
    const features = settingsData?.features;
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    // View state: form (default), camera (live feed), preview (captured image)
    const [viewState, setViewState] = useState<ViewState>("form");
    const [visitorPhotoUrl, setVisitorPhotoUrl] = useState<string>("");
    const [capturedPreview, setCapturedPreview] = useState<string>("");
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [cameraError, setCameraError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const isVerified = appointment?.isVerified || false;
    const visitorHasPhoto = !!(
        (appointment as any)?.visitorId?.photoUrl ||
        (appointment?.visitor as any)?.photoUrl ||
        (appointment as any)?.visitorId?.photo ||
        (appointment?.visitor as any)?.photo ||
        (appointment?.visitor as any)?.profilePicture
    );
    const requiresPhoto = features?.enableVisitorImageCapture && !visitorHasPhoto && !visitorPhotoUrl;

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setViewState("form");
            setVisitorPhotoUrl("");
            setCapturedPreview("");
            setCameraError(null);
        } else {
            stopCamera();
        }
    }, [open]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => { stopCamera(); };
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const startCamera = async (facing: "environment" | "user" = facingMode) => {
        setCameraError(null);
        stopCamera();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            setFacingMode(facing);
            setViewState("camera");
            // Give React time to render video element before assigning srcObject
            setTimeout(() => {
                if (videoRef.current && streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                    videoRef.current.play().catch(console.error);
                }
            }, 100);
        } catch (e: any) {
            const msg = e?.name === "NotAllowedError" ? "Camera permission denied. Please allow camera access." : "Camera unavailable on this device.";
            setCameraError(msg);
            setViewState("camera"); // Show the error screen inside dialog
        }
    };

    const switchCamera = () => {
        startCamera(facingMode === "environment" ? "user" : "environment");
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        if (!video.videoWidth || !video.videoHeight) {
            toast.error("Camera not ready yet, please wait a moment.");
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        stopCamera();
        setCapturedPreview(dataUrl);
        setViewState("preview");
    };

    const retakePhoto = () => {
        setCapturedPreview("");
        startCamera();
    };

    const confirmPhoto = async () => {
        if (!capturedPreview) return;
        try {
            // Convert dataURL to File
            const res = await fetch(capturedPreview);
            const blob = await res.blob();
            const file = new File([blob], "visitor-capture.jpg", { type: "image/jpeg" });
            const uploaded = await uploadFile({ file }).unwrap();
            if (uploaded?.url) {
                setVisitorPhotoUrl(uploaded.url);
                setViewState("form");
                toast.success("Photo captured successfully!");
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to upload photo. Please try again.");
        }
    };

    const cancelCamera = () => {
        stopCamera();
        setCapturedPreview("");
        setViewState("form");
    };

    const handleConfirmCheckIn = async () => {
        if (requiresPhoto && !visitorPhotoUrl) {
            toast.error("Please capture a visitor photo first.");
            return;
        }
        await onConfirm(appointment!._id, undefined, visitorPhotoUrl);
    };

    if (!appointment) return null;

    const getVisitorName = () => (appointment as any).visitorId?.name || appointment.visitor?.name || "N/A";
    const isReadyForCheckIn = !requiresPhoto || !!visitorPhotoUrl;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent
                className="sm:max-w-[440px] rounded-3xl border-none shadow-2xl bg-white p-0 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh]"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* ── CAMERA VIEW ── */}
                {viewState === "camera" && (
                    <InlineCameraView
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        facingMode={facingMode}
                        cameraError={cameraError}
                        onSwitchCamera={switchCamera}
                        onCapture={capturePhoto}
                        onCancel={cancelCamera}
                    />
                )}

                {/* ── PREVIEW VIEW ── */}
                {viewState === "preview" && (
                    <div className="flex flex-col h-full min-h-[480px] bg-black">
                        <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                            <button type="button" onClick={cancelCamera} className="p-2 rounded-full hover:bg-white/10 text-white">
                                <X className="h-5 w-5" />
                            </button>
                            <span className="text-white text-sm font-bold uppercase tracking-widest">Review Photo</span>
                            <div className="w-9" />
                        </div>
                        <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-900">
                            {capturedPreview && <img src={capturedPreview} alt="Captured" className="h-full w-full object-contain" />}
                        </div>
                        <div className="flex gap-4 justify-center p-6 bg-black">
                            <button
                                type="button"
                                onClick={retakePhoto}
                                className="flex items-center gap-2 rounded-full px-6 py-2.5 border border-white/20 bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-700 transition-colors shadow-xl"
                            >
                                <RotateCw className="h-4 w-4" /> Retake
                            </button>
                            <button
                                type="button"
                                onClick={confirmPhoto}
                                disabled={isUploading}
                                className="flex items-center gap-2 rounded-full px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
                            >
                                {isUploading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                                    : <><CheckCircle2 className="h-4 w-4" /> Use Photo</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── FORM VIEW ── */}
                {viewState === "form" && (
                    <>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <div className="text-center">
                                <div className={cn(
                                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                                    "bg-accent/10 text-accent"
                                )}>
                                    {isReadyForCheckIn ? <CheckCircle2 className="h-8 w-8" /> : <LogIn className="h-8 w-8" />}
                                </div>

                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-gray-800 text-center">Check In Visitor</DialogTitle>
                                    <DialogDescription className="text-gray-500 text-center mt-2">
                                        {isReadyForCheckIn
                                            ? "All security requirements met. Ready to check in."
                                            : "Complete security verification to grant premises entry."}
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Visitor Card */}
                                <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <User className="h-5 w-5 text-accent" />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Visitor</div>
                                            <div className="font-bold text-slate-700 truncate">{getVisitorName()}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                                        <div className="space-y-1 text-left">
                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date</div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {formatDate(appointment.appointmentDetails?.scheduledDate || "")}
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Time</div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                {appointment.appointmentDetails?.scheduledTime ? formatTime(appointment.appointmentDetails.scheduledTime) : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Capture Section */}
                                {features?.enableVisitorImageCapture && (
                                    <div className="mt-5 bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-left">
                                        <div className="text-xs font-bold text-sky-900 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                            <ImagePlus className="h-4 w-4" /> Live Image Capture
                                        </div>
                                        <div className="text-sm text-sky-700 mb-3 font-medium">
                                            Security policy requires a live visitor photo before check-in.
                                        </div>

                                        {visitorPhotoUrl ? (
                                            /* Captured photo preview */
                                            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-400">
                                                <img src={visitorPhotoUrl} alt="Visitor" className="w-full h-40 object-cover" />
                                                <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => startCamera()}
                                                    className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-colors"
                                                >
                                                    <RotateCw className="h-3 w-3" /> Retake
                                                </button>
                                            </div>
                                        ) : (
                                            /* Capture trigger */
                                            <button
                                                type="button"
                                                onClick={() => startCamera()}
                                                className="w-full h-36 rounded-xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 transition-colors group"
                                            >
                                                <div className="h-12 w-12 rounded-full bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center transition-colors">
                                                    <Camera className="h-6 w-6 text-sky-600" />
                                                </div>
                                                <span className="text-sm font-bold text-sky-700">Open Camera</span>
                                                <span className="text-xs text-sky-500">Tap to capture visitor photo</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 bg-slate-50 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full sm:w-auto h-11 rounded-2xl border-accent text-accent hover:bg-accent/10 font-bold transition-all px-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmCheckIn}
                                disabled={isLoading}
                                className={cn(
                                    "w-full sm:w-auto min-w-0 sm:min-w-[140px] h-12 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-[0.98] px-8",
                                    "bg-accent hover:bg-accent/90 shadow-accent/20"
                                )}
                            >
                                {isLoading ? (
                                    <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-r-transparent border-white" /> Processing...</>
                                ) : (
                                    <><LogIn className="mr-2 h-4 w-4" /> Finalize Check-In</>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
