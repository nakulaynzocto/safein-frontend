"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Copy, Check, Download, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alertDialog";
import { useGetQRConfigQuery, useRegenerateQRSlugMutation } from "@/store/api/qrSetupApi";
import { useGetProfileQuery } from "@/store/api/authApi";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { cn } from "@/lib/utils";

const QR_CANVAS_ID = "tenant-qr-canvas";
const COPY_FEEDBACK_MS = 1500;
const OUT_W = 1400;
const OUT_H = 1900;
const FONT_STACK = "'Plus Jakarta Sans', Arial, sans-serif";

function sanitizeFilename(name: string) {
    return name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) || "company";
}

function buildBrandedQrDataUrl(sourceCanvas: HTMLCanvasElement, companyName: string, scanUrl: string): string | null {
    const out = document.createElement("canvas");
    out.width = OUT_W;
    out.height = OUT_H;
    const ctx = out.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);

    ctx.fillStyle = "#074463";
    ctx.font = `700 72px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.fillText(companyName || "Company", out.width / 2, 140);

    ctx.fillStyle = "#3882a5";
    ctx.font = `600 44px ${FONT_STACK}`;
    ctx.fillText("Visitor Check-In QR", out.width / 2, 220);

    const cardX = 180;
    const cardY = 300;
    const cardW = 1040;
    const cardH = 1240;
    ctx.fillStyle = "#f8fbfd";
    ctx.strokeStyle = "#d6e5ef";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();

    const qrSize = 760;
    const qrX = (out.width - qrSize) / 2;
    const qrY = 430;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 48);
    ctx.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = "#1f2937";
    ctx.font = `600 38px ${FONT_STACK}`;
    ctx.fillText("Scan to Book Appointment", out.width / 2, 1280);

    ctx.fillStyle = "#6b7280";
    ctx.font = `500 30px ${FONT_STACK}`;
    ctx.fillText("Use latest QR if slug is changed", out.width / 2, 1350);

    const shortUrl = scanUrl.length > 64 ? `${scanUrl.slice(0, 61)}...` : scanUrl;
    ctx.fillStyle = "#94a3b8";
    ctx.font = `500 24px ${FONT_STACK}`;
    ctx.fillText(shortUrl, out.width / 2, 1500);

    return out.toDataURL("image/png");
}

function PreviewDownloadActions({
    scanUrl,
    onDownload,
    className,
}: {
    scanUrl: string;
    onDownload: () => void;
    className?: string;
}) {
    return (
        <div className={cn("flex gap-2", className)}>
            <Button className="min-w-[130px] flex-1 sm:flex-none" variant="outline" type="button" onClick={() => window.open(scanUrl, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview
            </Button>
            <Button className="min-w-[130px] flex-1 sm:flex-none" type="button" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
        </div>
    );
}

export default function QrCheckinSettingsPage() {
    const { data: config, isLoading } = useGetQRConfigQuery();
    const { data: profile } = useGetProfileQuery();
    const [regenerate, { isLoading: isUpdating }] = useRegenerateQRSlugMutation();
    const [customSlug, setCustomSlug] = useState("");
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scanBase = useMemo(() => {
        if (typeof window === "undefined") {
            return process.env.NEXT_PUBLIC_SCAN_APP_URL || "";
        }
        return process.env.NEXT_PUBLIC_SCAN_APP_URL || window.location.origin;
    }, []);

    const scanUrl = useMemo(() => `${scanBase}/scan/${config?.slug || ""}`, [scanBase, config?.slug]);

    const companyName = profile?.companyName ?? "";
    const currentSlug = config?.slug ?? "";
    const trimmedCustom = customSlug.trim();
    const canSaveSlug =
        Boolean(trimmedCustom) && trimmedCustom !== currentSlug && !isUpdating;

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(scanUrl);
            setCopied(true);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            copyTimerRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
            showSuccessToast("Scan link copied");
        } catch {
            showErrorToast("Could not copy link");
        }
    }, [scanUrl]);

    const handleDownload = useCallback(() => {
        const canvas = document.getElementById(QR_CANVAS_ID) as HTMLCanvasElement | null;
        if (!canvas) {
            showErrorToast("QR not ready yet");
            return;
        }
        const dataUrl = buildBrandedQrDataUrl(canvas, companyName, scanUrl);
        if (!dataUrl) {
            showErrorToast("Could not generate image");
            return;
        }
        const link = document.createElement("a");
        link.href = dataUrl.replace("image/png", "image/octet-stream");
        link.download = `${sanitizeFilename(companyName || "company")}-checkin-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccessToast("QR downloaded");
    }, [companyName, scanUrl]);

    const handleRegenerate = useCallback(async () => {
        try {
            await regenerate({ customSlug: trimmedCustom || undefined }).unwrap();
            setCustomSlug("");
            setEditing(false);
            setIsConfirmOpen(false);
            showSuccessToast("QR slug updated");
        } catch (error: unknown) {
            const msg = error && typeof error === "object" && "data" in error ? (error as { data?: { message?: string } }).data?.message : undefined;
            showErrorToast(msg || "Failed to update slug");
        }
    }, [regenerate, trimmedCustom]);

    const startEditing = useCallback(() => setEditing(true), []);
    const cancelEditing = useCallback(() => {
        setEditing(false);
        setCustomSlug("");
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-24 sm:space-y-6 sm:pb-6">
            <div>
                <h1 className="text-xl font-bold sm:text-2xl">QR Check-in</h1>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Visitors scan this QR to request appointment and entry approval.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                <Card className="order-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            QR Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <div className="mx-auto w-fit rounded-xl border bg-white p-3 sm:p-4">
                            <QRCodeCanvas
                                id={QR_CANVAS_ID}
                                value={scanUrl}
                                size={220}
                                level="H"
                                includeMargin
                                imageSettings={{
                                    src: "/safein-logo.svg",
                                    height: 34,
                                    width: 34,
                                    excavate: true,
                                }}
                            />
                        </div>
                        <p className="text-sm font-medium">{companyName || "—"}</p>
                        <PreviewDownloadActions scanUrl={scanUrl} onDownload={handleDownload} className="hidden justify-center sm:flex" />
                    </CardContent>
                </Card>

                <Card className="order-2 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Public Scan Link</CardTitle>
                        <CardDescription>Use this at your reception desk.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2 sm:space-y-0">
                            <div className="flex items-center gap-2">
                                <Input value={scanUrl} readOnly className="text-xs sm:text-sm" />
                                <Button variant="outline" className="shrink-0" type="button" onClick={handleCopy} aria-label="Copy scan link">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="px-1 text-xs text-muted-foreground">Reception me isi link ka latest QR display karein.</p>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <Label>QR Slug</Label>
                            {!editing ? (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold">{currentSlug}</span>
                                    <Button className="w-full sm:w-auto" variant="ghost" type="button" onClick={startEditing}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Change slug
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Input
                                        value={customSlug}
                                        onChange={(e) => setCustomSlug(e.target.value)}
                                        placeholder={currentSlug}
                                        autoComplete="off"
                                    />
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            className="w-full sm:w-auto"
                                            type="button"
                                            onClick={() => setIsConfirmOpen(true)}
                                            disabled={!canSaveSlug}
                                        >
                                            {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                            Save
                                        </Button>
                                        <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={cancelEditing}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
                <div className="mx-auto flex max-w-md">
                    <PreviewDownloadActions scanUrl={scanUrl} onDownload={handleDownload} className="w-full" />
                </div>
            </div>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change QR slug?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Slug change ke baad purana QR code invalid ho jayega. Entry ke liye aapko naya QR code hi use/print karna hoga.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-foreground" disabled={isUpdating} type="button">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-[#3882a5] text-white hover:bg-[#2d6a87] hover:text-white focus-visible:ring-[#3882a5]/30"
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                void handleRegenerate();
                            }}
                            disabled={isUpdating || !canSaveSlug}
                        >
                            {isUpdating ? "Updating..." : "Yes, Change Slug"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
