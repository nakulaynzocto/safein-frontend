"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PublicLayout } from "@/components/layout/publicLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"
import { routes } from "@/utils/routes"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    user,
    isAuthenticated,
    token,
  } = useAuthSubscription()

  const [pollingInterval, setPollingInterval] = useState(5000)
  const [maxPollAttempts] = useState(12)
  const [pollAttempts, setPollAttempts] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const {
    data: activeSubscriptionData,
    isFetching: isSubscriptionFetching,
  } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
    skip: !isAuthenticated || !user?.id,
    pollingInterval: pollingInterval,
  })

  const subscriptionIsActive = !!(
    activeSubscriptionData?.data &&
    activeSubscriptionData.data.isActive === true &&
    activeSubscriptionData.data.paymentStatus === 'succeeded'
  )

  useEffect(() => {
    if (subscriptionIsActive && !isRedirecting) {
      setIsRedirecting(true)
      setTimeout(() => {
        router.replace(routes.privateroute.DASHBOARD)
      }, 1500)
    }
  }, [subscriptionIsActive, isRedirecting, router])

  useEffect(() => {
    if (isSubscriptionFetching && !subscriptionIsActive) {
      setPollAttempts((prev) => prev + 1)
    }
  }, [isSubscriptionFetching, subscriptionIsActive])

  useEffect(() => {
    if (pollAttempts >= maxPollAttempts && !subscriptionIsActive) {
      setPollingInterval(0)
    }
  }, [pollAttempts, maxPollAttempts, subscriptionIsActive])

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      router.replace(routes.publicroute.LOGIN)
    }
  }, [isAuthenticated, token, user, router])

  if (!isAuthenticated || !token || !user?.id) {
    return null
  }

  if (isRedirecting) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-brand">Subscription Activated!</CardTitle>
              <CardDescription>Redirecting to dashboard...</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-[#3882a5] border-t-transparent rounded-full"></div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  if (subscriptionIsActive) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-brand">Payment Successful!</CardTitle>
              <CardDescription>Your subscription has been activated</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting you to the dashboard...
              </p>
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-[#3882a5] border-t-transparent rounded-full"></div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  const hasExceededMaxAttempts = pollAttempts >= maxPollAttempts

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {hasExceededMaxAttempts ? (
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl text-brand">
              {hasExceededMaxAttempts ? "Verification Taking Longer" : "Verifying Your Payment"}
            </CardTitle>
            <CardDescription>
              {hasExceededMaxAttempts
                ? "Your payment is being processed. This may take a few minutes."
                : "Please wait while we verify your subscription..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {hasExceededMaxAttempts ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Your payment has been received and is being processed. You will receive an email confirmation once your subscription is activated.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setPollAttempts(0)
                      setPollingInterval(5000)
                    }}
                  >
                    Check Again
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(routes.publicroute.SUBSCRIPTION_PLAN)}
                  >
                    Go to Subscription Plan
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  We're verifying your payment with our payment processor. This usually takes a few seconds.
                </p>
                <div className="animate-spin mx-auto h-8 w-8 border-4 border-[#3882a5] border-t-transparent rounded-full"></div>
                <p className="text-xs text-muted-foreground">
                  Attempt {pollAttempts} of {maxPollAttempts}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
