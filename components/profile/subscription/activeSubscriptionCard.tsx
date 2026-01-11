"use client";

import {
    CreditCard,
    Plus,
    Calendar,
    CheckCircle2,
    AlertCircle,
    History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActiveSubscriptionCardProps {
    subscription: any;
    onManageClick: () => void;
}

export const ActiveSubscriptionCard = ({
    subscription,
    onManageClick,
}: ActiveSubscriptionCardProps) => {
    const isActive = subscription && subscription.isActive;

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const getRemainingDays = (endDate: string) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4 flex-wrap">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <CreditCard className="text-[#3882a5]" size={20} />
                    Current Plan
                </h3>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 w-full sm:w-auto"
                        onClick={onManageClick}
                    >
                        <Plus size={16} />
                        {isActive ? "Upgrade / Change Plan" : "Assign Plan"}
                    </Button>
                </div>
            </div>

            {isActive ? (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-4">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shadow-sm hidden sm:block">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-emerald-900 capitalize text-lg">
                                    {subscription.planType} Plan
                                </h4>
                                <p className="text-emerald-700 text-sm font-medium">
                                    Active Subscription
                                </p>
                            </div>
                            {subscription.source === "admin" && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                    Admin Assigned
                                </Badge>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-emerald-800">
                            <span className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-md border border-emerald-200/50">
                                <Calendar size={15} />
                                Started: <strong>{formatDate(subscription.startDate)}</strong>
                            </span>
                            <span className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-md border border-emerald-200/50">
                                <Calendar size={15} />
                                Expires: <strong>{formatDate(subscription.endDate)}</strong>
                            </span>
                            {getRemainingDays(subscription.endDate) > 0 && (
                                <span className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-md border border-emerald-200/50">
                                    <History size={15} />
                                    Remaining:{" "}
                                    <strong>{getRemainingDays(subscription.endDate)} Days</strong>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-12 text-center text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <AlertCircle className="text-gray-400" size={24} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">
                                No Active Subscription
                            </h4>
                            <p className="text-sm">
                                You do not have an active subscription plan.
                            </p>
                        </div>
                        <Button variant="outline" className="mt-2" onClick={onManageClick}>
                            <Plus size={16} className="mr-2" />
                            Subscribe Now
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
