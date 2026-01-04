"use client"

import { Suspense, lazy, useEffect } from "react"

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
      // Use correct tag types: 'User' and 'Subscription' as defined in the API
      dispatch(userSubscriptionApi.util.invalidateTags(['User', 'Subscription']))
    }
  }, [user?.id, dispatch])

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
  )
}
