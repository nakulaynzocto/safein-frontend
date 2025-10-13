"use client"

import { useParams } from "next/navigation"
import { NewVisitorModal } from "@/components/visitor/NewVisitorModal"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { PageHeader } from "@/components/common/pageHeader"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export default function VisitorEditPage() {
  const params = useParams()
  const visitorId = params.id as string
  
  if (!visitorId) {
    return (
      <ProtectedLayout>
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground">Visitor Not Found</h2>
            <p className="text-muted-foreground">Please select a visitor to edit.</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }
  
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <PageHeader 
          title="Edit Visitor" 
          description="Update visitor information and details"
        />
        <div className="flex justify-center">
          <NewVisitorModal 
            visitorId={visitorId}
            trigger={
              <Button size="lg" className="text-lg px-8 py-6">
                <Edit className="mr-2 h-5 w-5" />
                Edit Visitor Details
              </Button>
            }
          />
        </div>
      </div>
    </ProtectedLayout>
  )
}
