"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useGetUserActiveSubscriptionQuery,
    useGetSubscriptionHistoryQuery,
    ISubscriptionHistory,
} from "@/store/api/userSubscriptionApi";
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { routes } from "@/utils/routes";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { formatCurrency } from "@/utils/helpers";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    CreditCard,
    AlertCircle,
    Package,
    TrendingUp,
    Eye,
    FileText,
    Sparkles,
    Zap,
    Shield,
    History,
    ArrowRight,
    Check,
    X,
} from "lucide-react";

export default function ActivePlanPage() {
    const router = useRouter();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<ISubscriptionHistory | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const { user, isAuthenticated, token } = useAuthSubscription();

    const {
        data: activeSubscriptionData,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
    } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
        skip: !isAuthenticated || !user?.id,
    });

    const { data: subscriptionHistoryData, isLoading: isHistoryLoading } = useGetSubscriptionHistoryQuery(undefined, {
        skip: !isAuthenticated || !user?.id,
    });

    const { data: subscriptionPlansData, isLoading: isPlansLoading } = useGetAllSubscriptionPlansQuery(
        { isActive: true },
        {
            skip: !isAuthenticated,
        },
    );

    const subscriptionHistory: ISubscriptionHistory[] = subscriptionHistoryData?.data || [];
    const subscriptionPlans: ISubscriptionPlan[] = subscriptionPlansData?.data?.plans || [];

    useEffect(() => {
        if (!isAuthenticated || !token || !user?.id) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isAuthenticated, token, user, router]);

    if (!isAuthenticated || !token || !user?.id) {
        return null;
    }

    const subscription = activeSubscriptionData?.data;

    // Get features from database based on current subscription plan type
    const currentPlan = subscription ? subscriptionPlans.find((plan) => plan.planType === subscription.planType) : null;
    const planFeatures = currentPlan?.features || [];

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const formatDateFull = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = () => {
        if (!subscription) return null;

        let status: "active" | "trialing" | "cancelled" | "expired" | "pending" = "pending";

        if (subscription.subscriptionStatus) {
            status = subscription.subscriptionStatus as "active" | "trialing" | "cancelled" | "expired" | "pending";
        } else if (subscription.isTrialing) {
            status = "trialing";
        } else if (subscription.isActive && subscription.paymentStatus === "succeeded") {
            status = "active";
        } else if (subscription.paymentStatus === "cancelled") {
            status = "cancelled";
        } else if (subscription.paymentStatus === "failed") {
            status = "expired";
        } else {
            status = "pending";
        }

        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-500 px-3 py-1 text-white hover:bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                    </Badge>
                );
            case "trialing":
                return (
                    <Badge className="bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Trial
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-500 px-3 py-1 text-white hover:bg-red-600">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelled
                    </Badge>
                );
            case "expired":
                return (
                    <Badge className="bg-gray-500 px-3 py-1 text-white hover:bg-gray-600">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Expired
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getPlanTypeLabel = (planType: string) => {
        const labels: Record<string, string> = {
            free: "Free Trial",
            weekly: "Weekly",
            monthly: "Monthly",
            quarterly: "Quarterly",
            yearly: "Yearly",
        };
        return labels[planType] || planType.charAt(0).toUpperCase() + planType.slice(1);
    };

    const handleViewInvoice = (e: MouseEvent<HTMLButtonElement>, historyItem: ISubscriptionHistory) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedInvoice(historyItem);
        setIsInvoiceModalOpen(true);
    };

    if (isSubscriptionLoading) {
        return <PageSkeleton />;
    }

    if (subscriptionError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Card>
                        <CardContent className="p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                                <h2 className="text-xl font-semibold">Error Loading Subscription</h2>
                            </div>
                            <p className="mb-4 text-gray-600">
                                Unable to load your subscription details. Please try again later.
                            </p>
                            <Button onClick={() => router.refresh()}>Retry</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Card className="shadow-xl">
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto max-w-md">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                    <Package className="h-10 w-10 text-gray-400" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold text-gray-900">No Active Subscription</h2>
                                <p className="mb-8 text-gray-600">
                                    You don't have an active subscription plan. Subscribe to unlock all features.
                                </p>
                                <Button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    className="bg-[#3882a5] px-8 py-6 text-lg text-white hover:bg-[#2d6a87]"
                                    size="lg"
                                >
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    View Plans
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const isExpired = new Date(subscription.endDate) < new Date();
    const daysRemaining = Math.ceil(
        (new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Subscription & Billing</h1>
                        <p className="mt-2 text-sm text-gray-600 sm:text-base">
                            Manage your subscription and view billing history
                        </p>
                    </div>
                    <div className="self-start sm:self-auto">{getStatusBadge()}</div>
                </div>

                {/* Active Plan Card - Prominent Display */}
                <Card className="overflow-hidden border-0 shadow-xl">
                    <div className="bg-gradient-to-r from-[#3882a5] to-[#2d6a87] p-4 text-white sm:p-6 lg:p-8">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="w-full flex-1">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
                                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <div>
                                        <h2 className="mb-1 text-xl font-bold sm:text-2xl">Current Plan</h2>
                                        <p className="text-xs text-blue-100 sm:text-sm">Your active subscription</p>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-6">
                                    <div className="mb-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                                        {getPlanTypeLabel(subscription.planType)}
                                    </div>
                                    <p className="text-sm text-blue-100 sm:text-base">
                                        {subscription.isTrialing
                                            ? "Free trial period - Full access to all features"
                                            : "Premium subscription with all features included"}
                                    </p>
                                </div>
                            </div>
                            {!isExpired && daysRemaining > 0 && (
                                <div className="w-full rounded-lg bg-white/20 px-3 py-2 text-center backdrop-blur-sm sm:w-auto sm:px-4 sm:py-3 sm:text-right">
                                    <div className="mb-1 text-xs text-blue-100 sm:text-sm">Days Remaining</div>
                                    <div className="text-2xl font-bold sm:text-3xl">{daysRemaining}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <CardContent className="p-4 sm:p-6 lg:p-8">
                        {/* Plan Details Grid */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>Start Date</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatDateFull(subscription.startDate)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>End Date</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatDateFull(subscription.endDate)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Payment Status</span>
                                </div>
                                <Badge
                                    variant={subscription.paymentStatus === "succeeded" ? "default" : "secondary"}
                                    className={
                                        subscription.paymentStatus === "succeeded"
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : ""
                                    }
                                >
                                    {subscription.paymentStatus.charAt(0).toUpperCase() +
                                        subscription.paymentStatus.slice(1)}
                                </Badge>
                            </div>
                        </div>

                        {/* Status Alert */}
                        {!isExpired && daysRemaining > 0 && (
                            <div className="mb-4 rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-3 sm:mb-6 sm:p-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-blue-900 sm:text-base">
                                            Subscription Active
                                        </p>
                                        <p className="mt-1 text-xs text-blue-700 sm:text-sm">
                                            Your subscription will renew automatically on{" "}
                                            {formatDateFull(subscription.endDate)}.{daysRemaining}{" "}
                                            {daysRemaining === 1 ? "day" : "days"} remaining.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isExpired && (
                            <div className="mb-4 rounded-r-lg border-l-4 border-red-500 bg-red-50 p-3 sm:mb-6 sm:p-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 sm:h-5 sm:w-5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-red-900 sm:text-base">
                                            Subscription Expired
                                        </p>
                                        <p className="mt-1 text-xs text-red-700 sm:text-sm">
                                            Your subscription has expired. Please renew to continue using our services.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
                            <Button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="flex-1 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                                size="lg"
                            >
                                <TrendingUp className="mr-2 h-5 w-5" />
                                {isExpired ? "Renew Plan" : "Upgrade Plan"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push(routes.privateroute.DASHBOARD)}
                                className="flex-1"
                                size="lg"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Plan Features */}
                    <Card className="shadow-lg lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-[#3882a5]" />
                                Plan Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isPlansLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-6 w-full" />
                                    ))}
                                </div>
                            ) : planFeatures.length > 0 ? (
                                <div className="space-y-3">
                                    {planFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No features available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subscription Details */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#3882a5]" />
                                Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Subscription ID</p>
                                <p className="font-mono text-xs break-all text-gray-900">{subscription._id}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Created</p>
                                <p className="text-gray-900">{formatDate(subscription.createdAt)}</p>
                            </div>
                            {subscription.updatedAt && (
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">Last Updated</p>
                                    <p className="text-gray-900">{formatDate(subscription.updatedAt)}</p>
                                </div>
                            )}
                            {subscription.canAccessDashboard !== undefined && (
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">Dashboard Access</p>
                                    <Badge variant={subscription.canAccessDashboard ? "default" : "secondary"}>
                                        {subscription.canAccessDashboard ? "Allowed" : "Restricted"}
                                    </Badge>
                                </div>
                            )}
                            {subscription.trialDays && subscription.trialDays > 0 && (
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">Trial Days</p>
                                    <p className="font-semibold text-gray-900">{subscription.trialDays} days</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Billing History Section */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-[#3882a5]" />
                                Billing History
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isHistoryLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : subscriptionHistory.length > 0 ? (
                            <div className="space-y-3">
                                {subscriptionHistory.map((historyItem) => {
                                    const isCurrentPlan = subscription?._id === historyItem.subscriptionId;
                                    return (
                                        <div
                                            key={historyItem._id}
                                            className="flex flex-col items-stretch justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3882a5]/10 sm:h-10 sm:w-10">
                                                    <FileText className="h-4 w-4 text-[#3882a5] sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                                            {historyItem.planName}
                                                        </p>
                                                        {isCurrentPlan && (
                                                            <Badge className="shrink-0 bg-green-100 text-xs text-green-800 hover:bg-green-100">
                                                                Current
                                                            </Badge>
                                                        )}
                                                        {historyItem.remainingDaysFromPrevious &&
                                                            historyItem.remainingDaysFromPrevious > 0 && (
                                                                <Badge variant="outline" className="shrink-0 text-xs">
                                                                    +{historyItem.remainingDaysFromPrevious} days
                                                                </Badge>
                                                            )}
                                                    </div>
                                                    <p className="text-xs break-words text-gray-500 sm:text-sm">
                                                        {formatDate(historyItem.startDate)} -{" "}
                                                        {formatDate(historyItem.endDate)}
                                                    </p>
                                                    {historyItem.amount > 0 && (
                                                        <p className="mt-1 text-xs font-medium text-gray-700 sm:text-sm">
                                                            {formatCurrency(historyItem.amount, historyItem.currency)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-end sm:gap-2">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                                        {historyItem.paymentStatus === "succeeded"
                                                            ? "Paid"
                                                            : historyItem.paymentStatus}
                                                    </p>
                                                    <p className="text-xs text-gray-500 sm:text-sm">
                                                        {formatDate(historyItem.purchaseDate)}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={(e) => handleViewInvoice(e, historyItem)}
                                                    className="shrink-0 text-xs sm:text-sm"
                                                >
                                                    <Eye className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">View Invoice</span>
                                                    <span className="sm:hidden">View</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <History className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                <p className="text-sm">No billing history</p>
                                <p className="mt-1 text-xs">Your invoices will appear here after successful payments</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upgrade Plan Modal */}
            <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />

            {/* Invoice View Modal */}
            <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
                <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden p-0">
                    <DialogHeader className="border-b px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <FileText className="h-5 w-5 text-[#3882a5] sm:h-6 sm:w-6" />
                            Invoice Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 sm:space-y-4 sm:px-6 sm:py-4">
                            {/* Invoice Header - Compact */}
                            <div className="rounded-lg bg-gradient-to-r from-[#3882a5] to-[#2d6a87] p-3 text-white sm:p-4">
                                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                                    <div>
                                        <p className="mb-0.5 text-xs text-blue-100 sm:text-sm">Invoice Number</p>
                                        <p className="text-lg font-bold break-all sm:text-xl">
                                            #
                                            {selectedInvoice.razorpayOrderId ||
                                                selectedInvoice._id.slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="mb-0.5 text-xs text-blue-100 sm:text-sm">Invoice Date</p>
                                        <p className="text-sm font-semibold sm:text-base">
                                            {formatDateFull(selectedInvoice.purchaseDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Billed To & Plan Details - Combined Compact */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                {/* Billed To - Compact */}
                                <div className="rounded-lg border p-3 sm:p-4">
                                    <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Billed To</h3>
                                    <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                        {user?.companyName || user?.name || "User"}
                                    </p>
                                    <p className="truncate text-xs text-gray-600 sm:text-sm">{user?.email}</p>
                                </div>

                                {/* Plan Details - Compact */}
                                <div className="rounded-lg border p-3 sm:p-4">
                                    <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Plan Details</h3>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Plan:</span>
                                            <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                                                {selectedInvoice.planName}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Type:</span>
                                            <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                                                {getPlanTypeLabel(selectedInvoice.planType)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Period:</span>
                                            <span className="text-xs font-semibold text-gray-900">
                                                {formatDate(selectedInvoice.startDate)} -{" "}
                                                {formatDate(selectedInvoice.endDate)}
                                            </span>
                                        </div>
                                        {selectedInvoice.remainingDaysFromPrevious &&
                                            selectedInvoice.remainingDaysFromPrevious > 0 && (
                                                <div className="flex items-center justify-between border-t pt-1">
                                                    <span className="text-xs text-gray-500">Carried Forward:</span>
                                                    <span className="text-xs font-semibold text-blue-600">
                                                        {selectedInvoice.remainingDaysFromPrevious} days
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information - Compact */}
                            <div className="rounded-lg border bg-gray-50 p-3 sm:p-4">
                                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                                    Payment Information
                                </h3>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Amount</span>
                                    <span className="text-xl font-bold text-[#3882a5] sm:text-2xl">
                                        {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <Badge
                                        className={
                                            selectedInvoice.paymentStatus === "succeeded"
                                                ? "bg-green-100 text-xs text-green-800 hover:bg-green-100"
                                                : "bg-yellow-100 text-xs text-yellow-800 hover:bg-yellow-100"
                                        }
                                    >
                                        {selectedInvoice.paymentStatus.charAt(0).toUpperCase() +
                                            selectedInvoice.paymentStatus.slice(1)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Transaction Details - Compact */}
                            <div className="rounded-lg border p-3 sm:p-4">
                                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                                    Transaction Details
                                </h3>
                                <div className="space-y-1.5">
                                    {selectedInvoice.razorpayOrderId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Order ID:</span>
                                            <span className="ml-2 text-right font-mono text-xs break-all text-gray-900">
                                                {selectedInvoice.razorpayOrderId}
                                            </span>
                                        </div>
                                    )}
                                    {selectedInvoice.razorpayPaymentId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Payment ID:</span>
                                            <span className="ml-2 text-right font-mono text-xs break-all text-gray-900">
                                                {selectedInvoice.razorpayPaymentId}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Subscription ID:</span>
                                        <span className="ml-2 text-right font-mono text-xs break-all text-gray-900">
                                            {selectedInvoice.subscriptionId.slice(-12)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end border-t px-4 py-3 sm:px-6">
                        <Button
                            onClick={() => setIsInvoiceModalOpen(false)}
                            className="bg-[#3882a5] px-4 py-2 text-sm text-white hover:bg-[#2d6a87]"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
