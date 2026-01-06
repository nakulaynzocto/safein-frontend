"use client"

import { useState, useEffect, useCallback, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useBulkCreateEmployeesMutation } from "@/store/api/employeeApi"
import { useAppSelector } from "@/store/hooks"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv' // .csv
] as const

const FILE_ACCEPT = '.xlsx,.xls,.csv'
const TEMPLATE_FILENAME = 'employee-import-template.xlsx'

interface BulkImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ImportResult {
  successCount: number
  failedCount: number
  errors: Array<{ row: number; email?: string; errors: string[] }>
}

export function BulkImportModal({ open, onOpenChange, onSuccess }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const [bulkCreateEmployees, { isLoading: isUploading }] = useBulkCreateEmployeesMutation()
  const token = useAppSelector((state) => state.auth.token)

  // Cleanup function for download link
  const cleanupDownloadLink = useCallback((link: HTMLAnchorElement, url: string) => {
    if (document.body.contains(link)) {
      document.body.removeChild(link)
    }
    window.URL.revokeObjectURL(url)
  }, [])

  const handleDownloadTemplate = useCallback(async () => {
    try {
      setError(null)
      setIsDownloading(true)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'
      const url = `${apiUrl}/employees/template`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to download template'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          // If not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = TEMPLATE_FILENAME
      link.style.display = 'none'
      link.setAttribute('data-no-loader', 'true')
      link.setAttribute('data-skip-navigation', 'true')

      document.body.appendChild(link)
      link.click()

      // Cleanup after download
      setTimeout(() => cleanupDownloadLink(link, downloadUrl), 100)

      setIsDownloading(false)
      showSuccessToast("Template downloaded successfully")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to download template"
      setError(errorMessage)
      showErrorToast(errorMessage)
      setIsDownloading(false)
    }
  }, [token, cleanupDownloadLink])

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type as typeof ALLOWED_FILE_TYPES[number])) {
      setError("Invalid file type. Please upload an Excel file (.xlsx, .xls)")
      setFile(null)
      return
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit")
      setFile(null)
      return
    }

    setFile(selectedFile)
    setError(null)
    setImportResult(null)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    try {
      setError(null)
      setImportResult(null)

      const result = await bulkCreateEmployees(file).unwrap()
      setImportResult(result)

      // Show success/error messages
      if (result.successCount > 0) {
        showSuccessToast(`${result.successCount} employee(s) imported successfully`)
      }

      if (result.failedCount > 0) {
        const skippedCount = result.errors.filter(e =>
          e.errors.some(err => err.includes('skipped') || err.includes('already exists'))
        ).length
        const errorCount = result.failedCount - skippedCount

        if (skippedCount > 0 && errorCount === 0) {
          showSuccessToast(`${skippedCount} duplicate employee(s) skipped. Only unique emails were imported.`)
        } else if (skippedCount > 0 && errorCount > 0) {
          showErrorToast(`${skippedCount} duplicate(s) skipped, ${errorCount} error(s) occurred. Check details below.`)
        } else {
          showErrorToast(`${result.failedCount} employee(s) failed to import. Check errors below.`)
        }
      }

      // Reset file input
      setFile(null)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      // Call success callback if provided
      if (onSuccess && result.successCount > 0) {
        setTimeout(() => onSuccess(), 1000)
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to import employees"
      setError(errorMessage)
      showErrorToast(errorMessage)
    }
  }, [file, bulkCreateEmployees, onSuccess])

  const handleClose = useCallback(() => {
    setFile(null)
    setError(null)
    setImportResult(null)
    onOpenChange(false)
  }, [onOpenChange])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setFile(null)
      setError(null)
      setImportResult(null)
      setIsDownloading(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Employees</DialogTitle>
          <DialogDescription>
            Download the template, fill in employee information, and upload the Excel file to import multiple employees at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Download Template Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#3882a5]" />
              <h3 className="font-semibold text-sm">Step 1: Download Template</h3>
            </div>
            <p className="text-sm text-gray-600">
              Download the Excel template with sample data and required column format.
            </p>
            <Button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              variant="outline"
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </>
              )}
            </Button>
          </div>

          {/* Upload File Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#3882a5]" />
              <h3 className="font-semibold text-sm">Step 2: Upload Excel File</h3>
            </div>
            <p className="text-sm text-gray-600">
              Select the filled Excel file to import employees. Maximum file size: 10MB
            </p>
            <div className="space-y-2">
              <input
                id="file-upload"
                type="file"
                accept={FILE_ACCEPT}
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    {file ? file.name : "Choose File"}
                  </span>
                </Button>
              </label>
              {file && (
                <p className="text-xs text-gray-500">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Import Results</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Successful</p>
                      <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{importResult.failedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Error Details:</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-900">
                          Row {error.row} {error.email && `(${error.email})`}
                        </p>
                        <ul className="mt-1 space-y-1">
                          {error.errors.map((err, errIndex) => (
                            <li key={errIndex} className="text-xs text-red-700">
                              • {err}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {importResult ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || !!importResult}
          >
            {isUploading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}





