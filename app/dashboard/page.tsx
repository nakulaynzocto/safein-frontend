"use client"

import { Suspense, lazy, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { DashboardSkeleton } from "@/components/common/tableSkeleton"
import { useAppDispatch } from "@/store/hooks"
import { userSubscriptionApi } from "@/store/api/userSubscriptionApi"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"

const DashboardOverview = lazy(() => 
  import("@/components/dashboard").then(module => ({ default: module.DashboardOverview }))
)

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAuthSubscription()

  // Refetch subscription data when landing on dashboard (e.g., after payment success)
  useEffect(() => {
    if (user?.id) {
      // Invalidate and refetch subscription data to ensure fresh state
      dispatch(userSubscriptionApi.util.invalidateTags([{ type: 'UserSubscription', id: user.id }]))
      dispatch(userSubscriptionApi.util.invalidateTags(['UserSubscription']))
    }
  }, [user?.id, dispatch])

  return (
    <ProtectedLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </ProtectedLayout>
  )
}
