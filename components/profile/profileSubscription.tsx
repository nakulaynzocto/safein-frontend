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
import { useGetSafeinProfileQuery } from "@/store/api/safeinProfileApi";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { ActiveSubscriptionCard } from "./subscription/activeSubscriptionCard";
import { SubscriptionHistoryTable } from "./subscription/subscriptionHistoryTable";
import { CreditTransactionsTable } from "./subscription/creditTransactionsTable";
import { useGetWalletTransactionsQuery } from "@/store/api/walletApi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ProfileSubscription() {
    const router = useRouter();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { user, isAuthenticated } = useAuthSubscription();

    const {
        data: activeSubscriptionData,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
    } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
        skip: !isAuthenticated || !user?.id,
    });

    const { data: safeinProfileResponse } = useGetSafeinProfileQuery(undefined, {
        skip: !isAuthenticated || !user?.id,
    });

    const { data: subscriptionHistoryData, isLoading: isHistoryLoading } = useGetSubscriptionHistoryQuery(undefined, {
        skip: !isAuthenticated || !user?.id,
    });

    const [walletPage, setWalletPage] = useState(1);
    const [walletType, setWalletType] = useState<string>("all");
    const { data: walletData, isLoading: isWalletLoading } = useGetWalletTransactionsQuery(
        { page: walletPage, limit: 10, type: walletType },
        { skip: !isAuthenticated || !user?.id }
    );

    const subscriptionHistory: ISubscriptionHistory[] = subscriptionHistoryData?.data || [];
    const subscription = activeSubscriptionData?.data;
    const businessProfile = safeinProfileResponse?.data;

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

            <div className="mt-8">
                <Tabs defaultValue="subscriptions" className="w-full">
                    <div className="bg-white rounded-t-xl sm:rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-4 pb-0 mb-[-1px] rounded-b-none border-b-transparent z-10 relative">
                        <TabsList className="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl bg-gray-100 p-1 text-gray-500 overflow-x-auto w-full sm:w-auto">
                            <TabsTrigger 
                                value="subscriptions"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-[#3882a5] data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-gray-200/60"
                            >
                                Subscription History
                            </TabsTrigger>
                            <TabsTrigger 
                                value="wallet"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-[#3882a5] data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-gray-200/60"
                            >
                                Credit Wallet History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="subscriptions" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <SubscriptionHistoryTable
                            data={currentItems.map(item => ({
                                ...item,
                                planId: { name: item.planName || item.planType }, // Map planName to planId.name for Display
                            })) as any[]} // Cast to match expected type if strictly typed, or adjust type
                            isLoading={isHistoryLoading}
                            currentPage={currentPage}
                            totalPages={totalPages > 0 ? totalPages : 1}
                            totalItems={totalItems}
                            pageSize={itemsPerPage}
                            onPageChange={handlePageChange}
                            user={user}
                            businessProfile={businessProfile}
                        />
                    </TabsContent>

                    <TabsContent value="wallet" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <CreditTransactionsTable
                            data={walletData?.transactions || []}
                            isLoading={isWalletLoading}
                            currentPage={walletData?.pagination?.page || 1}
                            totalPages={walletData?.pagination?.pages || 1}
                            totalItems={walletData?.pagination?.total || 0}
                            pageSize={10}
                            activeTab={walletType as any}
                            onPageChange={setWalletPage}
                            onTypeChange={(type: "all" | "recharge" | "usage") => {
                                setWalletType(type);
                                setWalletPage(1); // Reset to first page on filter change
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}

