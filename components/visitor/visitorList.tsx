"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { routes } from "@/utils/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/searchInput";
import { DataTable } from "@/components/common/dataTable";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    MoreVertical,
    RefreshCw,
    Maximize2,
} from "lucide-react";
import {
    useGetVisitorsQuery,
    useDeleteVisitorMutation,
    useCheckVisitorHasAppointmentsQuery,
    Visitor,
    GetVisitorsQuery,
} from "@/store/api/visitorApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

import { formatDate, formatName, getInitials } from "@/utils/helpers";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { VisitorDetailsDialog } from "./visitorDetailsDialog";
import { APIErrorState } from "@/components/common/APIErrorState";

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const createColumns = (
    handleDeleteClick: (visitor: Visitor) => void,
    handleEditVisitor: (visitor: Visitor) => void,
    handleViewVisitor: (visitor: Visitor) => void,
) => [
        {
            key: "visitor",
            header: "Visitor",
            render: (visitor: Visitor) => (
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="group relative shrink-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={visitor.photo} alt={visitor.name} />
                            <AvatarFallback className="text-xs sm:text-sm">
                                {getInitials(formatName(visitor.name))}
                            </AvatarFallback>
                        </Avatar>
                        {visitor.photo && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(visitor.photo, "_blank");
                                }}
                                className="absolute -right-1 -bottom-1 rounded-full bg-[#3882a5] p-1 text-white opacity-0 shadow-md transition-colors group-hover:opacity-100 hover:bg-[#2d6a87]"
                                title="View full image"
                            >
                                <Maximize2 className="h-2.5 w-2.5" />
                            </button>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="max-w-[100px] truncate text-sm font-medium sm:max-w-[150px] sm:text-base">
                            {formatName(visitor.name)}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "contact",
            header: "Contact",
            render: (visitor: Visitor) => (
                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{visitor.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:gap-2 sm:text-sm">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span>{visitor.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "address",
            header: "Address",
            className: "hidden lg:table-cell",
            render: (visitor: Visitor) => (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                        {visitor.address.city}, {visitor.address.state}
                    </span>
                </div>
            ),
        },
        {
            key: "idProof",
            header: "ID Proof",
            className: "hidden md:table-cell",
            render: (visitor: Visitor) =>
                visitor.idProof?.type || visitor.idProof?.number ? (
                    <div className="space-y-1">
                        {visitor.idProof.type && (
                            <Badge variant="outline" className="text-xs">
                                {visitor.idProof.type.replace("_", " ").toUpperCase()}
                            </Badge>
                        )}
                        {visitor.idProof.number && (
                            <div className="max-w-[100px] truncate text-xs text-gray-500">{visitor.idProof.number}</div>
                        )}
                    </div>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                ),
        },
        {
            key: "createdAt",
            header: "Registered",
            className: "hidden xl:table-cell",
            render: (visitor: Visitor) => (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {formatDate(visitor.createdAt)}
                </div>
            ),
        },
        {
            key: "actions",
            header: "Action",
            className: "w-10",
            render: (visitor: Visitor) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewVisitor(visitor)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditVisitor(visitor)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(visitor)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

export function VisitorList() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
    const { hasReachedVisitorLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
        showAddonModal,
        openAddonModal,
        closeAddonModal
    } = useSubscriptionActions();

    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const queryParams: GetVisitorsQuery = {
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm || undefined,
    };

    const { data: visitorsData, isLoading, error, refetch } = useGetVisitorsQuery(queryParams);

    const [deleteVisitor, { isLoading: isDeleting }] = useDeleteVisitorMutation();

    const visitorId = selectedVisitor?._id || "";
    const shouldCheckAppointments = Boolean(selectedVisitor && showDeleteDialog);

    const { data: appointmentCheck } = useCheckVisitorHasAppointmentsQuery(visitorId, {
        skip: !shouldCheckAppointments,
    });

    const disabledMessage = useMemo(() => {
        if (!appointmentCheck?.hasAppointments) return undefined;
        return `Cannot delete visitor. ${appointmentCheck.count} appointment(s) have been created with this visitor. Please delete or reassign the appointments first.`;
    }, [appointmentCheck]);

    const handleDeleteClick = (visitor: Visitor) => {
        // Close other modals
        setShowViewDialog(false);

        setSelectedVisitor(visitor);
        setShowDeleteDialog(true);
    };

    const handleDeleteVisitor = async () => {
        if (!selectedVisitor) return;

        try {
            await deleteVisitor(selectedVisitor._id).unwrap();
            showSuccessToast("Visitor deleted successfully!");
            setShowDeleteDialog(false);
            setSelectedVisitor(null);
            refetch();
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to delete visitor");
        }
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleEditVisitor = (visitor: Visitor) => {
        router.push(routes.privateroute.VISITOREDIT.replace("[id]", visitor._id));
    };

    const handleViewVisitor = (visitor: Visitor) => {
        // Close other modals
        setShowDeleteDialog(false);

        setSelectedVisitor(visitor);
        setShowViewDialog(true);
    };

    const visitors = visitorsData?.visitors || [];
    const pagination = visitorsData?.pagination;
    const columns = createColumns(handleDeleteClick, handleEditVisitor, handleViewVisitor);
    const emptyPrimaryLabel = isEmployee
        ? "Register Visitor"
        : (isExpired ? "Upgrade Plan" : (hasReachedVisitorLimit ? "Buy Extra Invites" : "Register Visitor"));

    const handlePrimaryAction = () => {
        if (!isEmployee && isExpired) {
            openUpgradeModal();
        } else if (!isEmployee && hasReachedVisitorLimit) {
            openAddonModal();
        } else {
            router.push(routes.privateroute.VISITORREGISTRATION);
        }
    };

    if (error) {
        return (
            <APIErrorState
                title="Failed to load visitors"
                error={error}
                onRetry={handleRefresh}
            />
        );
    }

    return (
        <div className="space-y-6">


            {/* Visitors Table */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
                    <SearchInput
                        placeholder="Search visitors..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        debounceDelay={500}
                        className="flex-1 min-w-[120px] sm:w-[260px] sm:flex-none"
                    />
                    <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
                        <SubscriptionActionButtons
                            isExpired={isExpired}
                            hasReachedLimit={hasReachedVisitorLimit}
                            limitType="appointment"
                            showUpgradeModal={showUpgradeModal}
                            openUpgradeModal={openUpgradeModal}
                            closeUpgradeModal={closeUpgradeModal}
                            showAddonModal={showAddonModal}
                            openAddonModal={openAddonModal}
                            closeAddonModal={closeAddonModal}
                            upgradeLabel="Upgrade Plan"
                            buyExtraLabel="Buy Extra Invites"
                            icon={Plus}
                            isEmployee={isEmployee}
                            className="rounded-xl px-6 min-w-[150px] text-[10px] sm:text-sm h-12"
                        >
                            <Button
                                variant="outline-primary"
                                className="flex h-12 shrink-0 items-center gap-1 rounded-xl px-4 text-[10px] bg-muted/30 whitespace-nowrap sm:gap-2 sm:text-sm"
                                onClick={() => router.push(routes.privateroute.VISITORREGISTRATION)}
                            >
                                <Plus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Add Visitor</span>
                            </Button>
                        </SubscriptionActionButtons>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                    <DataTable
                        data={visitors}
                        columns={columns}
                        emptyMessage="No visitors found. Try adjusting your search criteria."
                        emptyData={{
                            title: "No visitors yet",
                            description: "Register your first visitor to get started.",
                            primaryActionLabel: emptyPrimaryLabel,
                        }}
                        onPrimaryAction={handlePrimaryAction}
                        showCard={false}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalVisitors}
                        pageSize={10}
                        onPageChange={setCurrentPage}
                        hasNextPage={pagination.hasNextPage}
                        hasPrevPage={pagination.hasPrevPage}
                    />
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Visitor"
                description={`Are you sure you want to delete ${selectedVisitor?.name}?`}
                onConfirm={handleDeleteVisitor}
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                variant="destructive"
                disabled={appointmentCheck?.hasAppointments || false}
                disabledMessage={disabledMessage}
            />

            {/* View Visitor Details Dialog */}
            <VisitorDetailsDialog
                visitor={selectedVisitor}
                open={showViewDialog}
                onClose={() => {
                    setShowViewDialog(false);
                    setSelectedVisitor(null);
                }}
            />
        </div>
    );
}
