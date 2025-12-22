"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetUserActiveSubscriptionQuery, useGetSubscriptionHistoryQuery, ISubscriptionHistory } from "@/store/api/userSubscriptionApi"
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"
import { routes } from "@/utils/routes"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { formatCurrency } from "@/utils/helpers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  X
} from "lucide-react"

export default function ActivePlanPage() {
  const router = useRouter()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<ISubscriptionHistory | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const {
    user,
    isAuthenticated,
    token,
  } = useAuthSubscription()

  const {
    data: activeSubscriptionData,
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
  } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
    skip: !isAuthenticated || !user?.id,
  })

  const {
    data: subscriptionHistoryData,
    isLoading: isHistoryLoading,
  } = useGetSubscriptionHistoryQuery(undefined, {
    skip: !isAuthenticated || !user?.id,
  })

  const {
    data: subscriptionPlansData,
    isLoading: isPlansLoading,
  } = useGetAllSubscriptionPlansQuery({ isActive: true }, {
    skip: !isAuthenticated,
  })

  const subscriptionHistory: ISubscriptionHistory[] = subscriptionHistoryData?.data || []
  const subscriptionPlans: ISubscriptionPlan[] = subscriptionPlansData?.data?.plans || []

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      router.replace(routes.publicroute.LOGIN)
    }
  }, [isAuthenticated, token, user, router])

  if (!isAuthenticated || !token || !user?.id) {
    return null
  }

  const subscription = activeSubscriptionData?.data

  // Get features from database based on current subscription plan type
  const currentPlan = subscription 
    ? subscriptionPlans.find(plan => plan.planType === subscription.planType)
    : null
  const planFeatures = currentPlan?.features || []

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const formatDateFull = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = () => {
    if (!subscription) return null

    let status: 'active' | 'trialing' | 'cancelled' | 'expired' | 'pending' = 'pending'
    
    if (subscription.subscriptionStatus) {
      status = subscription.subscriptionStatus as 'active' | 'trialing' | 'cancelled' | 'expired' | 'pending'
    } else if (subscription.isTrialing) {
      status = 'trialing'
    } else if (subscription.isActive && subscription.paymentStatus === 'succeeded') {
      status = 'active'
    } else if (subscription.paymentStatus === 'cancelled') {
      status = 'cancelled'
    } else if (subscription.paymentStatus === 'failed') {
      status = 'expired'
    } else {
      status = 'pending'
    }

    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'trialing':
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            Trial
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600 px-3 py-1">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      case 'expired':
        return (
          <Badge className="bg-gray-500 text-white hover:bg-gray-600 px-3 py-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  const getPlanTypeLabel = (planType: string) => {
    const labels: Record<string, string> = {
      free: "Free Trial",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    }
    return labels[planType] || planType.charAt(0).toUpperCase() + planType.slice(1)
  }

  const handleViewInvoice = (e: MouseEvent<HTMLButtonElement>, historyItem: ISubscriptionHistory) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedInvoice(historyItem)
    setIsInvoiceModalOpen(true)
  }

  if (isSubscriptionLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 mb-6" />
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-32 mb-8" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (subscriptionError) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <h2 className="text-xl font-semibold">Error Loading Subscription</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Unable to load your subscription details. Please try again later.
                </p>
                <Button onClick={() => router.refresh()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!subscription) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">No Active Subscription</h2>
                  <p className="text-gray-600 mb-8">
                    You don't have an active subscription plan. Subscribe to unlock all features.
                  </p>
                  <Button 
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="bg-[#3882a5] hover:bg-[#2d6a87] text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const isExpired = new Date(subscription.endDate) < new Date()
  const daysRemaining = Math.ceil(
    (new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription & Billing</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your subscription and view billing history</p>
            </div>
            <div className="self-start sm:self-auto">
              {getStatusBadge()}
            </div>
          </div>

          {/* Active Plan Card - Prominent Display */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#3882a5] to-[#2d6a87] text-white p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-1">Current Plan</h2>
                      <p className="text-blue-100 text-xs sm:text-sm">Your active subscription</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{getPlanTypeLabel(subscription.planType)}</div>
                    <p className="text-blue-100 text-sm sm:text-base">
                      {subscription.isTrialing 
                        ? "Free trial period - Full access to all features"
                        : "Premium subscription with all features included"}
                    </p>
                  </div>
                </div>
                {!isExpired && daysRemaining > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full sm:w-auto text-center sm:text-right">
                    <div className="text-xs sm:text-sm text-blue-100 mb-1">Days Remaining</div>
                    <div className="text-2xl sm:text-3xl font-bold">{daysRemaining}</div>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Plan Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Start Date</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">{formatDateFull(subscription.startDate)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>End Date</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">{formatDateFull(subscription.endDate)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Status</span>
                  </div>
                  <Badge 
                    variant={subscription.paymentStatus === 'succeeded' ? 'default' : 'secondary'}
                    className={
                      subscription.paymentStatus === 'succeeded' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : ''
                    }
                  >
                    {subscription.paymentStatus.charAt(0).toUpperCase() + subscription.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Status Alert */}
              {!isExpired && daysRemaining > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg mb-4 sm:mb-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-blue-900 text-sm sm:text-base">Subscription Active</p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Your subscription will renew automatically on {formatDateFull(subscription.endDate)}. 
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isExpired && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-lg mb-4 sm:mb-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-red-900 text-sm sm:text-base">Subscription Expired</p>
                      <p className="text-xs sm:text-sm text-red-700 mt-1">
                        Your subscription has expired. Please renew to continue using our services.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="bg-[#3882a5] hover:bg-[#2d6a87] text-white flex-1"
                  size="lg"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  {isExpired ? 'Renew Plan' : 'Upgrade Plan'}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Features */}
            <Card className="lg:col-span-2 shadow-lg">
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
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No features available</p>
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
                  <p className="text-sm text-gray-500 mb-1">Subscription ID</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{subscription._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="text-gray-900">{formatDate(subscription.createdAt)}</p>
                </div>
                {subscription.updatedAt && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-900">{formatDate(subscription.updatedAt)}</p>
                  </div>
                )}
                {subscription.canAccessDashboard !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dashboard Access</p>
                    <Badge variant={subscription.canAccessDashboard ? 'default' : 'secondary'}>
                      {subscription.canAccessDashboard ? 'Allowed' : 'Restricted'}
                    </Badge>
                  </div>
                )}
                {subscription.trialDays && subscription.trialDays > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Trial Days</p>
                    <p className="text-gray-900 font-semibold">{subscription.trialDays} days</p>
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
                    const isCurrentPlan = subscription?._id === historyItem.subscriptionId
                    return (
                      <div
                        key={historyItem._id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#3882a5]/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#3882a5]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{historyItem.planName}</p>
                              {isCurrentPlan && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shrink-0 text-xs">
                                  Current
                                </Badge>
                              )}
                              {historyItem.remainingDaysFromPrevious && historyItem.remainingDaysFromPrevious > 0 && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  +{historyItem.remainingDaysFromPrevious} days
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 break-words">
                              {formatDate(historyItem.startDate)} - {formatDate(historyItem.endDate)}
                            </p>
                            {historyItem.amount > 0 && (
                              <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
                                {formatCurrency(historyItem.amount, historyItem.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end sm:gap-2">
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">
                              {historyItem.paymentStatus === 'succeeded' ? 'Paid' : historyItem.paymentStatus}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">{formatDate(historyItem.purchaseDate)}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={(e) => handleViewInvoice(e, historyItem)}
                            className="shrink-0 text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">View Invoice</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No billing history</p>
                  <p className="text-xs mt-1">Your invoices will appear here after successful payments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Plan Modal */}
        <UpgradePlanModal 
          isOpen={isUpgradeModalOpen} 
          onClose={() => setIsUpgradeModalOpen(false)} 
        />

        {/* Invoice View Modal */}
        <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#3882a5]" />
                Invoice Details
              </DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                {/* Invoice Header - Compact */}
                <div className="bg-gradient-to-r from-[#3882a5] to-[#2d6a87] text-white p-3 sm:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm mb-0.5">Invoice Number</p>
                      <p className="text-lg sm:text-xl font-bold break-all">
                        #{selectedInvoice.razorpayOrderId || selectedInvoice._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-blue-100 text-xs sm:text-sm mb-0.5">Invoice Date</p>
                      <p className="text-sm sm:text-base font-semibold">{formatDateFull(selectedInvoice.purchaseDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Billed To & Plan Details - Combined Compact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Billed To - Compact */}
                  <div className="border rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Billed To</h3>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user?.companyName || user?.name || 'User'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                  </div>

                  {/* Plan Details - Compact */}
                  <div className="border rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Plan Details</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Plan:</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{selectedInvoice.planName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Type:</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{getPlanTypeLabel(selectedInvoice.planType)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Period:</span>
                        <span className="text-xs font-semibold text-gray-900">{formatDate(selectedInvoice.startDate)} - {formatDate(selectedInvoice.endDate)}</span>
                      </div>
                      {selectedInvoice.remainingDaysFromPrevious && selectedInvoice.remainingDaysFromPrevious > 0 && (
                        <div className="flex justify-between items-center pt-1 border-t">
                          <span className="text-xs text-gray-500">Carried Forward:</span>
                          <span className="text-xs font-semibold text-blue-600">{selectedInvoice.remainingDaysFromPrevious} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Information - Compact */}
                <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Information</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#3882a5]">
                      {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge 
                      className={
                        selectedInvoice.paymentStatus === 'succeeded' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100 text-xs' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs'
                      }
                    >
                      {selectedInvoice.paymentStatus.charAt(0).toUpperCase() + selectedInvoice.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Transaction Details - Compact */}
                <div className="border rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Transaction Details</h3>
                  <div className="space-y-1.5">
                    {selectedInvoice.razorpayOrderId && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Order ID:</span>
                        <span className="font-mono text-xs text-gray-900 break-all text-right ml-2">{selectedInvoice.razorpayOrderId}</span>
                      </div>
                    )}
                    {selectedInvoice.razorpayPaymentId && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Payment ID:</span>
                        <span className="font-mono text-xs text-gray-900 break-all text-right ml-2">{selectedInvoice.razorpayPaymentId}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Subscription ID:</span>
                      <span className="font-mono text-xs text-gray-900 break-all text-right ml-2">{selectedInvoice.subscriptionId.slice(-12)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end px-4 sm:px-6 py-3 border-t">
              <Button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="bg-[#3882a5] hover:bg-[#2d6a87] text-white text-sm px-4 py-2"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  )
}

