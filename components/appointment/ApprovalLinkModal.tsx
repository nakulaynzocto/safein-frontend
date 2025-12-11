"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"
import { CheckCircle2, Copy, Link2 } from "lucide-react"
import { showSuccessToast } from "@/utils/toast"

interface ApprovalLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  approvalLink: string
  onCancel?: () => void
}

export function ApprovalLinkModal({ 
  open, 
  onOpenChange, 
  approvalLink,
  onCancel 
}: ApprovalLinkModalProps) {
  const [linkCopied, setLinkCopied] = React.useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setLinkCopied(true)
      showSuccessToast("Link copied to clipboard!")
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      showSuccessToast("Failed to copy link")
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Approval Link Generated
          </DialogTitle>
          <DialogDescription>
            Share this one-time link with the employee to approve or reject the appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                  <Link2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={approvalLink}
                    className="flex-1 text-xs bg-transparent border-none outline-none text-green-900 dark:text-green-100"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(approvalLink)}
                    className="h-7 px-2 flex-shrink-0"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
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
          <Button 
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}





