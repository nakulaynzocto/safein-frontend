"use client";

import { Wallet, History, ArrowUpRight, Coins, Phone, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface CreditWalletCardProps {
  balance: number;
  creditRate: number;
  callCost: number;
  currency?: string;
}

export function CreditWalletCard({ 
  balance = 0, 
  creditRate = 1, 
  callCost = 5,
  currency = "INR" 
}: CreditWalletCardProps) {
  const router = useRouter();
  
  const equivalentAmount = balance / creditRate;
  const callsPossible = Math.floor(balance / callCost);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Credit Wallet</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/subscription-plans")}
            className="gap-1"
          >
            <ArrowUpRight className="h-4 w-4" />
            Recharge
          </Button>
        </div>
        <CardDescription>
          Manage your voice call credits and view usage history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{balance}</span>
                <span className="text-lg text-muted-foreground">credits</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Equivalent to ₹{equivalentAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-background p-4 rounded-full shadow-sm">
              <Coins className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Voice Calls</span>
            </div>
            <p className="text-2xl font-bold">{callsPossible}</p>
            <p className="text-xs text-muted-foreground">calls possible</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Credit Rate</span>
            </div>
            <p className="text-2xl font-bold">{creditRate}</p>
            <p className="text-xs text-muted-foreground">credits per ₹1</p>
          </div>
        </div>

        <Separator />

        {/* Pricing Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Voice Call Pricing
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost per call attempt</span>
              <Badge variant="secondary">{callCost} credits</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary call</span>
              <span className="font-medium">{callCost} credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backup call</span>
              <span className="font-medium">{callCost} credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manual retry</span>
              <span className="font-medium">{callCost} credits</span>
            </div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {balance < callCost * 5 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Low Balance Warning:</strong> Your balance is running low. 
              Recharge soon to ensure uninterrupted voice call service.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => router.push("/settings/credit-transactions")}
          >
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
