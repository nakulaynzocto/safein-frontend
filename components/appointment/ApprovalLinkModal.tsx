"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, Copy, Link2 } from "lucide-react";
import { showSuccessToast } from "@/utils/toast";

interface ApprovalLinkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    approvalLink: string;
    onCancel?: () => void;
}

export function ApprovalLinkModal({ open, onOpenChange, approvalLink, onCancel }: ApprovalLinkModalProps) {
    const [linkCopied, setLinkCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setLinkCopied(true);
            showSuccessToast("Link copied to clipboard!");
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            showSuccessToast("Failed to copy link");
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-md dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Approval Link Generated</DialogTitle>
                    <DialogDescription>
                        Share this one-time link with the employee to approve or reject the appointment.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 rounded border border-green-200 bg-white p-2 dark:border-green-700 dark:bg-gray-800">
                                    <Link2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                    <input
                                        type="text"
                                        readOnly
                                        value={approvalLink}
                                        className="flex-1 border-none bg-transparent text-xs text-green-900 outline-none dark:text-green-100"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(approvalLink)}
                                        className="h-7 flex-shrink-0 px-2"
                                    >
                                        {linkCopied ? (
                                            <>
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-1 h-3 w-3" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
