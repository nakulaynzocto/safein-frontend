"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    useGetUserActiveSubscriptionQuery,
    useGetSubscriptionHistoryQuery,
    ISubscriptionHistory,
} from "@/store/api/userSubscriptionApi";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { ActiveSubscriptionCard } from "./subscription/activeSubscriptionCard";
import { SubscriptionHistoryTable } from "./subscription/subscriptionHistoryTable";

export function ProfileSubscription() {
    const router = useRouter();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const { user, isAuthenticated } = useAuthSubscription();

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

    const subscriptionHistory: ISubscriptionHistory[] = subscriptionHistoryData?.data || [];
    const subscription = activeSubscriptionData?.data;

    // Handle initial loading state
    if (isSubscriptionLoading) {
        return <PageSkeleton />;
    }

    if (subscriptionError) {
        return (
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
        );
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Client-side pagination logic
    const totalItems = subscriptionHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = subscriptionHistory.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-6">
            <ActiveSubscriptionCard
                subscription={subscription}
                onManageClick={() => setIsUpgradeModalOpen(true)}
            />

            <SubscriptionHistoryTable
                data={currentItems.map(item => ({
                    ...item,
                    planId: { name: item.planName || item.planType }, // Map planName to planId.name for Display
                })) as any[]} // Cast to match expected type if strictly typed, or adjust type
                isLoading={isHistoryLoading}
                currentPage={currentPage}
                totalPages={totalPages > 0 ? totalPages : 1}
                onPageChange={handlePageChange}
                user={user}
            />

            <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}

