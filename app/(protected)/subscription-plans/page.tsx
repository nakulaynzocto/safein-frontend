"use client"


import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGetAllSubscriptionPlansQuery, ISubscriptionPlan } from "@/store/api/subscriptionApi"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubscriptionPlansPage() {
  const { data, isLoading, error } = useGetAllSubscriptionPlansQuery({ isActive: true })

  const plans: ISubscriptionPlan[] = data?.data?.plans || []

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Subscription Plans</h1>
            <p className="text-sm text-muted-foreground">
              View and compare all available plans for this account.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <Card>
            <CardContent className="py-6">
              <p className="text-red-500 text-sm">
                Failed to load subscription plans. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className={`relative ${plan.isPopular ? "border-2 border-brand shadow-lg" : ""}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-1 bg-brand text-white text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-lg font-semibold text-brand">
                    {plan.name}
                  </CardTitle>
                  {plan.description && (
                    <CardDescription className="text-xs mt-1">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold">
                      ₹{Math.round(plan.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {plan.planType === "free" ? "Card verification - 3 Days Trial (Non-refundable)" : `per ${plan.planType.replace("ly", "")}`}
                    </div>
                    {plan.trialDays && plan.trialDays > 0 && (
                      <div className="text-xs text-green-600">
                        {plan.trialDays} days trial
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 min-h-[80px]">
                    {plan.features?.slice(0, 4).map((feature, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {feature}
                      </div>
                    ))}
                    {plan.features && plan.features.length > 4 && (
                      <div className="text-xs text-muted-foreground">
                        + {plan.features.length - 4} more features
                      </div>
                    )}
                  </div>

                  <Button
                    disabled
                    className={`w-full ${plan.isPopular ? "bg-brand text-white" : ""}`}
                  >
                    Current UI View Only
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



