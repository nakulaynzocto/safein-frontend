"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicLayout } from "@/components/layout/publicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { routes } from "@/utils/routes";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { userSubscriptionApi } from "@/store/api/userSubscriptionApi";

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const { user, isAuthenticated, token } = useAuthSubscription();

    const [pollingInterval, setPollingInterval] = useState(5000);
    const [maxPollAttempts] = useState(12);
    const [pollAttempts, setPollAttempts] = useState(0);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const {
        data: activeSubscriptionData,
        isFetching: isSubscriptionFetching,
        refetch: refetchSubscription,
    } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
        skip: !isAuthenticated || !user?.id,
        pollingInterval: pollingInterval,
    });

    const subscriptionIsActive = (() => {
        if (!activeSubscriptionData?.data) return false;

        const subscription = activeSubscriptionData.data;

        // ✅ PREFERRED: Use backend-provided flag if available (backend calculates this securely)
        if (subscription.hasActiveSubscription !== undefined) {
            return subscription.hasActiveSubscription;
        }

        // ✅ ALTERNATIVE: Use backend-provided canAccessDashboard flag
        if (subscription.canAccessDashboard !== undefined) {
            return subscription.canAccessDashboard;
        }

        // ⚠️ FALLBACK: Frontend calculation (less secure, but works until backend adds flags)
        // Explicitly reject cancelled, failed, or pending payments
        if (
            subscription.paymentStatus === "cancelled" ||
            subscription.paymentStatus === "failed" ||
            subscription.paymentStatus === "pending"
        ) {
            return false;
        }

        // Must be active AND payment must be succeeded
        return subscription.isActive === true && subscription.paymentStatus === "succeeded";
    })();

    useEffect(() => {
        if (subscriptionIsActive && !isRedirecting) {
            setIsRedirecting(true);
            // Invalidate subscription query to ensure fresh data on dashboard
            // Use correct tag types: 'User' and 'Subscription' as defined in the API
            if (user?.id) {
                dispatch(userSubscriptionApi.util.invalidateTags(["User", "Subscription"]));
            }
            // Refetch subscription before redirect
            refetchSubscription();
            setTimeout(() => {
                router.replace(routes.privateroute.DASHBOARD);
            }, 1500);
        }
    }, [subscriptionIsActive, isRedirecting, router, user?.id, dispatch, refetchSubscription]);

    useEffect(() => {
        if (isSubscriptionFetching && !subscriptionIsActive) {
            setPollAttempts((prev) => prev + 1);
        }
    }, [isSubscriptionFetching, subscriptionIsActive]);

    useEffect(() => {
        if (pollAttempts >= maxPollAttempts && !subscriptionIsActive) {
            setPollingInterval(0);
        }
    }, [pollAttempts, maxPollAttempts, subscriptionIsActive]);

    useEffect(() => {
        if (!isAuthenticated || !token || !user?.id) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isAuthenticated, token, user, router]);

    if (!isAuthenticated || !token || !user?.id) {
        return null;
    }

    if (isRedirecting) {
        return (
            <PublicLayout>
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-brand text-2xl">Subscription Activated!</CardTitle>
                            <CardDescription>Redirecting to dashboard...</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                        </CardContent>
                    </Card>
                </div>
            </PublicLayout>
        );
    }

    if (subscriptionIsActive) {
        return (
            <PublicLayout>
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-brand text-2xl">Payment Successful!</CardTitle>
                            <CardDescription>Your subscription has been activated</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-muted-foreground text-sm">Redirecting you to the dashboard...</p>
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                        </CardContent>
                    </Card>
                </div>
            </PublicLayout>
        );
    }

    const hasExceededMaxAttempts = pollAttempts >= maxPollAttempts;

    return (
        <PublicLayout>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            {hasExceededMaxAttempts ? (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                                </div>
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-brand text-2xl">
                            {hasExceededMaxAttempts ? "Verification Taking Longer" : "Verifying Your Payment"}
                        </CardTitle>
                        <CardDescription>
                            {hasExceededMaxAttempts
                                ? "Your payment is being processed. This may take a few minutes."
                                : "Please wait while we verify your subscription..."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        {hasExceededMaxAttempts ? (
                            <>
                                <p className="text-muted-foreground text-sm">
                                    Your payment has been received and is being processed. You will receive an email
                                    confirmation once your subscription is activated.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setPollAttempts(0);
                                            setPollingInterval(5000);
                                        }}
                                    >
                                        Check Again
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push(routes.publicroute.PRICING)}
                                    >
                                        Go to Pricing
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground text-sm">
                                    We're verifying your payment with our payment processor. This usually takes a few
                                    seconds.
                                </p>
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                                <p className="text-muted-foreground text-xs">
                                    Attempt {pollAttempts} of {maxPollAttempts}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
