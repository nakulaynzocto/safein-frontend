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
import { DeliverySetupWarning } from "@/components/common/DeliverySetupWarning";

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
        <div className="space-y-8 pb-24 sm:pb-8">
            <DeliverySetupWarning />

            <div className="grid gap-6 lg:grid-cols-12">
                {/* QR Preview Card */}
                <Card className="order-1 overflow-hidden border-none shadow-xl lg:col-span-5">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#074463]">
                            <div className="rounded-lg bg-[#3882a5]/10 p-2 text-[#3882a5]">
                                <QrCode className="h-5 w-5" />
                            </div>
                            QR Identity Card
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 text-center">
                        <div className="group relative mx-auto w-fit">
                            <div className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-tr from-[#3882a5] to-blue-300 opacity-20 blur-sm transition-opacity group-hover:opacity-40" />
                            <div className="relative rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                                <QRCodeCanvas
                                    id={QR_CANVAS_ID}
                                    value={scanUrl}
                                    size={240}
                                    level="H"
                                    includeMargin
                                    imageSettings={{
                                        src: "/safein-logo.svg",
                                        height: 38,
                                        width: 38,
                                        excavate: true,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800">{companyName || "Your Company"}</h3>
                            <p className="text-sm text-muted-foreground">Reception Check-in Station</p>
                        </div>

                        <div className="hidden grid-cols-2 gap-3 sm:grid">
                            <Button
                                className="w-full border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5]/5"
                                variant="outline"
                                type="button"
                                onClick={() => window.open(scanUrl, "_blank")}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                            <Button
                                className="w-full bg-[#3882a5] shadow-md hover:bg-[#2d6a87]"
                                type="button"
                                onClick={handleDownload}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">High-resolution PNG for printing and display</p>
                    </CardContent>
                </Card>

                {/* Configuration & Links Card */}
                <Card className="order-2 overflow-hidden border-none shadow-xl lg:col-span-7">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg font-semibold text-[#074463]">Deployment & Settings</CardTitle>
                        <CardDescription>Manage how visitors access your check-in portal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {/* URL Management */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                Public Scan Link
                            </Label>
                            <div className="relative group">
                                <div className="flex overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50/50 transition-all focus-within:border-[#3882a5]/30 focus-within:bg-white group-hover:border-slate-200">
                                    <div className="flex items-center bg-slate-100/80 px-4 text-slate-500">
                                        <ExternalLink className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={scanUrl}
                                        readOnly
                                        className="border-none bg-transparent py-6 font-mono text-xs focus-visible:ring-0 sm:text-sm"
                                    />
                                    <Button
                                        variant="ghost"
                                        className="h-auto rounded-none border-l bg-white px-4 text-[#3882a5] hover:bg-slate-50"
                                        type="button"
                                        onClick={handleCopy}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="rounded-lg bg-blue-50/50 p-3 text-xs leading-relaxed text-[#3882a5]">
                                <strong>Pro-Tip:</strong> Print the QR code and place it at your reception desk or
                                gate entrance for easy visitor self-check-in.
                            </div>
                        </div>

                        {/* Slug Configuration */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-slate-700">QR Slug (Identifier)</Label>
                                {editing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-slate-500 hover:text-slate-700"
                                        onClick={cancelEditing}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>

                            {!editing ? (
                                <div className="flex items-center justify-between gap-4 rounded-xl border bg-white p-3">
                                    <code className="bg-slate-100 px-2 py-1 rounded text-sm font-bold text-[#074463]">
                                        {currentSlug}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-dashed text-[#3882a5] hover:bg-[#3882a5]/5"
                                        onClick={startEditing}
                                    >
                                        <RefreshCw className="mr-2 h-3 w-3" />
                                        Customize
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            value={customSlug}
                                            onChange={(e) => setCustomSlug(e.target.value)}
                                            placeholder={currentSlug}
                                            className="h-11 rounded-xl border-2 focus-visible:ring-[#3882a5]/20"
                                            autoComplete="off"
                                        />
                                        <p className="text-[11px] text-muted-foreground italic">
                                            Characters allowed: a-z, 0-9, and hyphens.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full bg-[#3882a5] hover:bg-[#2d6a87] rounded-xl h-11"
                                        type="button"
                                        onClick={() => setIsConfirmOpen(true)}
                                        disabled={!canSaveSlug}
                                    >
                                        {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                        {isUpdating ? "Updating Profile..." : "Apply New Slug"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Actions Overlay */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/80 p-4 backdrop-blur-md sm:hidden">
                <div className="mx-auto flex max-w-md gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 border-slate-200"
                        onClick={() => window.open(scanUrl, "_blank")}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Preview
                    </Button>
                    <Button className="flex-1 h-12 bg-[#3882a5]" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
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
