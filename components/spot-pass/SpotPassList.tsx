"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { DataTable } from "@/components/common/dataTable";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
    Plus,
    LogOut,
    User,
    CheckCircle2,
    Trash2,
    MoreVertical,
    Eye,
    Maximize2
} from "lucide-react";
import { getInitials, formatName } from "@/utils/helpers";
import { StatusBadge } from "@/components/common/statusBadge";
import { SearchInput } from "@/components/common/searchInput";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import {
    useGetSpotPassesQuery,
    useCheckOutPassMutation,
    useDeletePassMutation,
    SpotPass
} from "@/store/api/spotPassApi";
import { Pagination } from "@/components/common/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdownMenu";
import { SpotPassDetailsDialog } from "./SpotPassDetailsDialog";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";

export function SpotPassList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [selectedPass, setSelectedPass] = useState<SpotPass | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { hasReachedSpotPassLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
        showAddonModal,
        openAddonModal,
        closeAddonModal
    } = useSubscriptionActions();

    // Queries & Mutations
    const { data, isLoading, refetch } = useGetSpotPassesQuery({
        page,
        limit: 10,
        search: searchQuery
    });

    const [checkOutPass] = useCheckOutPassMutation();
    const [deletePass] = useDeletePassMutation();

    // State for Confirmation Dialogs
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null,
    });
    const [checkOutModal, setCheckOutModal] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null,
    });

    const handleViewDetails = (pass: SpotPass) => {
        setSelectedPass(pass);
        setIsDetailsOpen(true);
    };

    const handleCheckOut = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCheckOutModal({ isOpen: true, id });
    };

    const confirmCheckOut = async () => {
        if (!checkOutModal.id) return;
        try {
            await checkOutPass(checkOutModal.id).unwrap();
            showSuccessToast("Visitor checked out successfully");
            setCheckOutModal({ isOpen: false, id: null });
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to check out");
        }
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await deletePass(deleteModal.id).unwrap();
            showSuccessToast("Spot Pass deleted successfully");
            setDeleteModal({ isOpen: false, id: null });
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to delete");
        }
    };

    const columns = [
        {
            header: "Visitor",
            key: "name",
            render: (item: SpotPass) => (
                <div className="flex items-center gap-3">
                    <div className="group relative shrink-0">
                        <Avatar className="h-10 w-10 border border-[#3882a5]/10 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={item.photo} className="object-cover" />
                            <AvatarFallback className="bg-[#3882a5]/5 text-[#3882a5]">
                                <User className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        {item.photo && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(item.photo, "_blank");
                                }}
                                className="absolute -right-1.5 -bottom-1.5 rounded-full bg-[#3882a5] p-1.5 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-[#2d6a87] hover:scale-110"
                                title="View full image"
                            >
                                <Maximize2 className="h-2.5 w-2.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-gray-900 truncate">{formatName(item.name)}</span>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">{item.phone}</span>
                            {item.vehicleNumber && (
                                <span className="text-[10px] font-bold text-[#3882a5] uppercase tracking-wider">
                                    {item.vehicleNumber}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Meet To",
            key: "employeeId",
            render: (item: SpotPass) => (
                <div className="flex items-center gap-2">
                    {/* @ts-ignore - employeeId might be populated object or string */}
                    {item.employeeId && typeof item.employeeId === 'object' && item.employeeId.photo ? (
                        <Avatar className="h-8 w-8 border border-gray-200">
                            {/* @ts-ignore */}
                            <AvatarImage src={item.employeeId.photo} className="object-cover" />
                            {/* @ts-ignore */}
                            <AvatarFallback className="bg-[#3882a5]/10 text-[#3882a5] text-[10px] font-bold flex items-center justify-center leading-none">
                                {/* @ts-ignore */}
                                {getInitials(item.employeeId.name)}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User className="h-4 w-4" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                        {/* @ts-ignore */}
                        {formatName(item.employeeId?.name || "") || "N/A"}
                    </span>
                </div>
            )
        },
        {
            header: "Address",
            key: "address",
            render: (item: SpotPass) => (
                <span className="text-sm text-gray-600 truncate max-w-[150px] inline-block">
                    {item.address}
                </span>
            )
        },
        {
            header: "Check-in",
            key: "checkInTime",
            render: (item: SpotPass) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                        {format(new Date(item.checkInTime), "hh:mm a")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                        {format(new Date(item.checkInTime), "MMM dd, yyyy")}
                    </span>
                </div>
            ),
        },
        {
            header: "Status",
            key: "status",
            render: (item: SpotPass) => (
                <StatusBadge status={item.status} />
            ),
        },
        {
            header: "Actions",
            key: "actions",
            render: (item: SpotPass) => (
                <div className="flex items-center justify-center gap-2">
                    {item.status === "checked-in" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleCheckOut(item._id, e)}
                            className="h-8 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-500 transition-all shadow-sm"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Check Out</span>
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#3882a5]/10 hover:text-[#3882a5] rounded-full transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 border-none shadow-xl rounded-xl p-1.5 bg-white dark:bg-gray-900">
                            <DropdownMenuItem
                                onClick={() => handleViewDetails(item)}
                                className="rounded-lg gap-2 cursor-pointer transition-colors"
                            >
                                <Eye className="h-4 w-4 text-[#3882a5]" />
                                <span className="font-medium">View Info</span>
                            </DropdownMenuItem>

                            {item.status === "checked-in" && (
                                <>
                                    <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />
                                    <DropdownMenuItem
                                        onClick={(e) => handleDelete(item._id, e)}
                                        className="rounded-lg gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="font-medium">Delete Pass</span>
                                    </DropdownMenuItem>
                                </>
                            )}

                            {item.status === "checked-out" && (
                                <div className="px-2 py-1.5 flex items-center gap-2 text-xs text-muted-foreground bg-gray-50/50 rounded-lg mt-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Visit Completed</span>
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex w-full items-center justify-between gap-1.5 sm:gap-4">
                    <SearchInput
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(val: string) => setSearchQuery(val)}
                        debounceDelay={500}
                        className="flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[300px]"
                    />
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                        <SubscriptionActionButtons
                            isExpired={isExpired}
                            hasReachedLimit={hasReachedSpotPassLimit}
                            limitType="spotPass"
                            showUpgradeModal={showUpgradeModal}
                            openUpgradeModal={openUpgradeModal}
                            closeUpgradeModal={closeUpgradeModal}
                            showAddonModal={showAddonModal}
                            openAddonModal={openAddonModal}
                            closeAddonModal={closeAddonModal}
                            upgradeLabel="Upgrade"
                            buyExtraLabel="Buy Extra"
                            icon={Plus}
                            className="h-12 w-12 sm:w-auto sm:px-6 rounded-xl"
                        >
                            <Button
                                variant="outline"
                                className="flex h-12 w-12 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5]/10 bg-white sm:px-6 sm:min-w-[160px] transition-all"
                                onClick={() => router.push(routes.privateroute.SPOT_PASS_CREATE)}
                            >
                                <Plus className="h-5 w-5 shrink-0" />
                                <span className="hidden sm:inline font-medium">New Spot Pass</span>
                            </Button>
                        </SubscriptionActionButtons>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                    <DataTable
                        columns={columns}
                        data={data?.spotPasses || []}
                        isLoading={isLoading}
                        showCard={false}
                        emptyMessage="No spot passes found."
                        emptyData={{
                            title: searchQuery ? "No results found" : "No spot passes yet",
                            description: searchQuery
                                ? "We couldn't find any spot passes matching your search."
                                : "Give instant entry to walk-in visitors by creating a spot pass.",
                            primaryActionLabel: "New Spot Pass",
                        }}
                        onPrimaryAction={() => router.push(routes.privateroute.SPOT_PASS_CREATE)}
                        minWidth="1000px"
                    />
                </div>
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="pt-4">
                    <Pagination
                        currentPage={data.pagination.currentPage}
                        totalPages={data.pagination.totalPages}
                        totalItems={data.pagination.totalPasses}
                        pageSize={10}
                        onPageChange={setPage}
                        hasNextPage={data.pagination.hasNextPage}
                        hasPrevPage={data.pagination.hasPrevPage}
                    />
                </div>
            )}

            {/* Details Dialog */}
            <SpotPassDetailsDialog
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                spotPass={selectedPass}
            />

            {/* Check Out Confirmation */}
            <ConfirmationDialog
                open={checkOutModal.isOpen}
                onOpenChange={(open) => setCheckOutModal({ ...checkOutModal, isOpen: open })}
                title="Confirm Check Out"
                description="Are you sure you want to check out this visitor? This action cannot be undone."
                confirmText="Check Out"
                onConfirm={confirmCheckOut}
                variant="default"
            />

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={deleteModal.isOpen}
                onOpenChange={(open) => setDeleteModal({ ...deleteModal, isOpen: open })}
                title="Delete Spot Pass"
                description="Are you sure you want to delete this spot pass? All related information will be permanently removed."
                confirmText="Delete"
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}
