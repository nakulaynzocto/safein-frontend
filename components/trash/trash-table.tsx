"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/data-table"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, RotateCcw, Eye } from "lucide-react"
import { format } from "date-fns"

interface TrashItem {
  id: string
  type: "appointment" | "employee"
  name: string
  email: string
  deletedAt: string
  deletedBy: string
  originalData: any
}

// Mock data - in real app, this would come from API
const mockTrashData: TrashItem[] = [
  {
    id: "1",
    type: "appointment",
    name: "John Doe",
    email: "john.doe@example.com",
    deletedAt: "2024-01-15T10:30:00Z",
    deletedBy: "Admin User",
    originalData: {
      visitorName: "John Doe",
      purpose: "Business Meeting",
      appointmentDate: "2024-01-20",
      appointmentTime: "14:00"
    }
  },
  {
    id: "2",
    type: "employee",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    deletedAt: "2024-01-14T16:45:00Z",
    deletedBy: "HR Manager",
    originalData: {
      name: "Jane Smith",
      department: "Marketing",
      position: "Marketing Manager"
    }
  },
  {
    id: "3",
    type: "appointment",
    name: "Mike Johnson",
    email: "mike.johnson@client.com",
    deletedAt: "2024-01-13T09:15:00Z",
    deletedBy: "Admin User",
    originalData: {
      visitorName: "Mike Johnson",
      purpose: "Product Demo",
      appointmentDate: "2024-01-18",
      appointmentTime: "11:00"
    }
  }
]

interface TrashTableProps {
  type?: "employee" | "appointment" | "all"
}

export function TrashTable({ type = "all" }: TrashTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null)

  // Filter data based on type
  const filteredData = type === "all" 
    ? mockTrashData 
    : mockTrashData.filter(item => item.type === type)

  const columns = [
    {
      key: "type",
      header: "Type",
      render: (item: TrashItem) => (
        <Badge variant={item.type === "appointment" ? "default" : "secondary"}>
          {item.type === "appointment" ? "Appointment" : "Employee"}
        </Badge>
      )
    },
    {
      key: "name",
      header: "Name",
      render: (item: TrashItem) => (
        <div className="font-medium">{item.name}</div>
      )
    },
    {
      key: "email",
      header: "Email",
      render: (item: TrashItem) => (
        <div className="text-muted-foreground">{item.email}</div>
      )
    },
    {
      key: "deletedAt",
      header: "Deleted At",
      render: (item: TrashItem) => (
        <div className="text-sm">
          <div>{format(new Date(item.deletedAt), "MMM dd, yyyy")}</div>
          <div className="text-muted-foreground">
            {format(new Date(item.deletedAt), "HH:mm")}
          </div>
        </div>
      )
    },
    {
      key: "deletedBy",
      header: "Deleted By",
      render: (item: TrashItem) => (
        <div className="text-sm text-muted-foreground">{item.deletedBy}</div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: TrashItem) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(item)
              setShowViewDialog(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(item)
              setShowRestoreDialog(true)
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedItem(item)
              setShowDeleteDialog(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handleRestore = () => {
    // Implement restore logic
    setShowRestoreDialog(false)
    setSelectedItem(null)
  }

  const handlePermanentDelete = () => {
    // Implement permanent delete logic
    setShowDeleteDialog(false)
    setSelectedItem(null)
  }

  const handleBulkRestore = () => {
    // Implement bulk restore logic
  }

  const handleBulkDelete = () => {
    // Implement bulk delete logic
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedItems.length} item(s) selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkRestore}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Selected
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type === "all" ? "Deleted Items" : `Deleted ${type.charAt(0).toUpperCase() + type.slice(1)}s`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage={`No deleted ${type === "all" ? "items" : type + "s"} found`}
            showCard={false}
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        title="Restore Item"
        description={`Are you sure you want to restore ${selectedItem?.name}? This will move the item back to its original location.`}
        onConfirm={handleRestore}
        confirmText="Restore"
        variant="default"
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Permanently Delete"
        description={`Are you sure you want to permanently delete ${selectedItem?.name}? This action cannot be undone.`}
        onConfirm={handlePermanentDelete}
        confirmText="Delete Forever"
        variant="destructive"
      />

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              View {selectedItem?.type === "appointment" ? "Appointment" : "Employee"} Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="font-medium">Name:</div>
                <div className="text-muted-foreground">{selectedItem.name}</div>
              </div>
              <div className="grid gap-2">
                <div className="font-medium">Email:</div>
                <div className="text-muted-foreground">{selectedItem.email}</div>
              </div>
              <div className="grid gap-2">
                <div className="font-medium">Deleted At:</div>
                <div className="text-muted-foreground">
                  {format(new Date(selectedItem.deletedAt), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              </div>
              <div className="grid gap-2">
                <div className="font-medium">Deleted By:</div>
                <div className="text-muted-foreground">{selectedItem.deletedBy}</div>
              </div>
              <div className="grid gap-2">
                <div className="font-medium">Original Data:</div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(selectedItem.originalData, null, 2)}
                </pre>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
