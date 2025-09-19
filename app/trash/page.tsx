"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { TrashTable } from "@/components/trash/trashTable"
import { PageHeader } from "@/components/common/pageHeader"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw } from "lucide-react"

export default function TrashPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <PageHeader 
          title="Trash" 
          description="Manage deleted appointments and employees"
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore All
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
            </Button>
          </div>
        </PageHeader>
        
        <div className="space-y-6">
          <TrashTable type="all" />
        </div>
      </div>
    </ProtectedLayout>
  )
}
