"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { routes } from "@/utils/routes";
import { CheckCircle, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { userSubscriptionApi } from "@/store/api/userSubscriptionApi";

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

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

    const subscriptionIsActive = useMemo(() => {
        if (!activeSubscriptionData?.data) return false;
        const subscription = activeSubscriptionData.data;
        if (subscription.hasActiveSubscription !== undefined) return subscription.hasActiveSubscription;
        if (subscription.canAccessDashboard !== undefined) return subscription.canAccessDashboard;
        
        if (["cancelled", "failed", "pending"].includes(subscription.paymentStatus)) return false;
        return subscription.isActive === true && subscription.paymentStatus === "succeeded";
    }, [activeSubscriptionData]);

    useEffect(() => {
        if (isInitialized && (!isAuthenticated || !token || !user?.id)) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isInitialized, isAuthenticated, token, user, router]);

    useEffect(() => {
        if (subscriptionIsActive && !isRedirecting) {
            setIsRedirecting(true);
            
            if (user?.id) {
                dispatch(userSubscriptionApi.util.invalidateTags(["User", "Subscription"]));
            }
            refetchSubscription();

            // Store timer in a variable that won't be cleared by the dependency change re-render
            setTimeout(() => {
                router.replace(routes.privateroute.DASHBOARD);
            }, 1500);
        }
    }, [subscriptionIsActive, router, user?.id, dispatch, refetchSubscription]);

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

    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-slate-950 p-4">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated || !token || !user?.id) return null;

    const renderContent = () => {
        if (isRedirecting || subscriptionIsActive) {
            return (
                <Card className="w-full max-w-md border-0 bg-white/70 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800 animate-in fade-in zoom-in-95 duration-500">
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="relative">
                                <div className="absolute -inset-2 rounded-full bg-green-100 animate-ping opacity-20" />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-[#3882a5] text-2xl font-black">Subscription Activated!</CardTitle>
                        <CardDescription className="font-medium">Redirecting to dashboard...</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                    </CardContent>
                </Card>
            );
        }

        const hasExceededMaxAttempts = pollAttempts >= maxPollAttempts;

        return (
            <Card className="w-full max-w-md border-0 bg-white/70 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        {hasExceededMaxAttempts ? (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                            </div>
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3882a5]/10">
                                <Loader2 className="h-8 w-8 animate-spin text-[#3882a5]" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-[#3882a5] text-2xl font-black">
                        {hasExceededMaxAttempts ? "Almost There..." : "Verifying Payment"}
                    </CardTitle>
                    <CardDescription className="font-medium">
                        {hasExceededMaxAttempts
                            ? "Your payment is being processed. This may take a few minutes."
                            : "Please wait while we sync your new subscription..."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center pb-10">
                    {hasExceededMaxAttempts ? (
                        <>
                            <p className="text-slate-500 text-sm font-medium px-4">
                                Your payment has been received. You'll receive an email once it's fully activated.
                            </p>
                            <div className="space-y-3 px-4">
                                <Button
                                    className="w-full h-11 rounded-xl bg-[#3882a5] hover:bg-[#2c6a88] shadow-lg shadow-blue-500/20"
                                    onClick={() => {
                                        setPollAttempts(0);
                                        setPollingInterval(5000);
                                    }}
                                >
                                    Check Again
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-11 rounded-xl border-slate-200"
                                    onClick={() => router.push(routes.privateroute.DASHBOARD)}
                                >
                                    Continue to Dashboard
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-slate-500 text-sm font-medium px-4">
                                Handshaking with payment processor...
                            </p>
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-[#3882a5]/40 uppercase">
                                <ShieldCheck className="h-3 w-3" />
                                Syncing Securely
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#f8fafc] dark:bg-slate-950">
            {renderContent()}
        </div>
    );
}

