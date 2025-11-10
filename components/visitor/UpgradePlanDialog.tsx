"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Crown, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface UpgradePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradePlanDialog({ open, onOpenChange }: UpgradePlanDialogProps) {
  const plans = [
    {
      name: "1 Month Plan",
      price: "₹8,499",
      features: [
        "Unlimited Visitors & Employees",
        "Aadhaar & ID Verification",
        "Real-time Email & SMS Alerts",
        "Photo Capture & Smart Logs",
        "Secure Cloud Storage",
        "24/7 Priority Support",
        "Advanced Analytics & Reporting",
        "Custom Branding Options",
        "API Access",
        "Multi-location Support",
      ],
      buttonText: "Choose 1 Month Plan",
    },
    {
      name: "3 Months Plan",
      price: "₹23,999", // Example discounted price
      features: [
        "All 1 Month Plan Features",
        "Save 5%",
        "Quarterly Billing",
      ],
      buttonText: "Choose 3 Months Plan",
      popular: true,
    },
    {
      name: "1 Year Plan",
      price: "₹89,999", // Example discounted price
      features: [
        "All 3 Months Plan Features",
        "Save 10%",
        "Annual Billing",
      ],
      buttonText: "Choose 1 Year Plan",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-3xl font-bold text-center">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            Unlock unlimited features and enhance your visitor management experience.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-6 rounded-lg shadow-lg border-2 ${
                plan.popular ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                  Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center">
                {plan.popular && <Crown className="h-6 w-6 text-blue-500 mr-2" />}
                {plan.name}
              </h3>
              <div className="text-center text-4xl font-extrabold mb-4">
                {plan.price}
                <span className="text-lg font-medium text-gray-500">/period</span>
              </div>
              <Separator className="mb-4" />
              <ul className="flex-grow space-y-2 text-sm text-gray-600 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.popular ? "btn-hostinger-primary" : "btn-hostinger-secondary"}`}>
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-center p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            No Thanks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
