"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/searchInput";
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
    Users,
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
import { DataTable } from "@/components/common/dataTable";
import { VisitorDetailsDialog } from "./visitorDetailsDialog";
import { APIErrorState } from "@/components/common/APIErrorState";

// ─── Main VisitorList ────────────────────────────────────────────────────────
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
        closeAddonModal,
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

    const handleEditVisitor = (visitor: Visitor) => {
        router.push(routes.privateroute.VISITOREDIT.replace("[id]", visitor._id));
    };

    const handleViewVisitor = (visitor: Visitor) => {
        setShowDeleteDialog(false);
        setSelectedVisitor(visitor);
        setShowViewDialog(true);
    };

    const visitors = visitorsData?.visitors || [];
    const pagination = visitorsData?.pagination;

    const emptyPrimaryLabel = isEmployee
        ? "Register Visitor"
        : isExpired
            ? "Upgrade Plan"
            : hasReachedVisitorLimit
                ? "Buy Extra Invites"
                : "Register Visitor";

    const handlePrimaryAction = () => {
        if (!isEmployee && isExpired) {
            openUpgradeModal();
        } else if (!isEmployee && hasReachedVisitorLimit) {
            openAddonModal();
        } else {
            router.push(routes.privateroute.VISITORREGISTRATION);
        }
    };

    const getColumns = () => {
        return [
            {
                key: "name",
                header: "Visitor",
                render: (visitor: Visitor) => (
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0 group/avatar">
                            <Avatar className="h-10 w-10 ring-2 ring-[#3882a5]/10 group-hover/avatar:ring-[#3882a5]/30 transition-all">
                                <AvatarImage src={visitor.photo} alt={visitor.name} />
                                <AvatarFallback className="bg-[#3882a5]/10 text-[#3882a5] text-xs font-semibold">
                                    {getInitials(formatName(visitor.name))}
                                </AvatarFallback>
                            </Avatar>
                            {visitor.photo && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(visitor.photo, "_blank");
                                    }}
                                    className="absolute -right-1 -bottom-1 rounded-full bg-[#3882a5] p-1 text-white opacity-0 shadow-md transition-all group-hover/avatar:opacity-100 hover:bg-[#2d6a87]"
                                    title="View full image"
                                >
                                    <Maximize2 className="h-2.5 w-2.5" />
                                </button>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[150px]">
                                {formatName(visitor.name)}
                            </p>
                            {visitor.blacklisted && (
                                <Badge variant="destructive" className="mt-0.5 text-[9px] px-1.5 py-0 h-4">
                                    Blacklisted
                                </Badge>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: "contact",
                header: "Contact",
                render: (visitor: Visitor) => (
                    <div className="space-y-1">
                        {visitor.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                                <Phone className="h-3 w-3 shrink-0 text-[#3882a5]" />
                                <span>{visitor.phone}</span>
                            </div>
                        )}
                        {visitor.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0 text-[#3882a5]" />
                                <span className="truncate max-w-[150px]">{visitor.email}</span>
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: "address",
                header: "Address",
                render: (visitor: Visitor) => (
                    (visitor.address?.city || visitor.address?.state) ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0 text-[#3882a5]" />
                            <span>{[visitor.address.city, visitor.address.state].filter(Boolean).join(", ")}</span>
                        </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>
                ),
            },
            {
                key: "idProof",
                header: "ID Proof",
                render: (visitor: Visitor) => (
                    visitor.idProof?.type ? (
                        <Badge variant="outline" className="text-[10px]">
                            {visitor.idProof.type.replace("_", " ").toUpperCase()}
                        </Badge>
                    ) : <span className="text-xs text-muted-foreground">—</span>
                ),
            },
            {
                key: "createdAt",
                header: "Registered",
                render: (visitor: Visitor) => (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {formatDate(visitor.createdAt)}
                    </div>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (visitor: Visitor) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
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
                ),
            },
        ];
    };

    if (error) {
        return (
            <APIErrorState
                title="Failed to load visitors"
                error={error}
                onRetry={refetch}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex w-full items-center justify-between gap-1.5 sm:gap-4">
                    <SearchInput
                        placeholder="Search visitors..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        debounceDelay={500}
                        className="flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[300px]"
                    />
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
                            upgradeLabel="Upgrade"
                            buyExtraLabel="Buy Extra"
                            icon={Plus}
                            isEmployee={isEmployee}
                            className="h-12 w-12 sm:w-auto sm:px-6 rounded-xl"
                        >
                            <Button
                                variant="outline"
                                className="flex h-12 w-12 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5]/10 bg-white sm:px-6 sm:min-w-[160px] transition-all"
                                onClick={() => router.push(routes.privateroute.VISITORREGISTRATION)}
                            >
                                <Plus className="h-5 w-5 shrink-0" />
                                <span className="hidden sm:inline font-medium">Add Visitor</span>
                            </Button>
                        </SubscriptionActionButtons>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                    <DataTable
                        data={visitors}
                        columns={getColumns()}
                        emptyMessage="No visitors found."
                        emptyData={{
                            title: "No visitors yet",
                            description: "Register your first visitor to get started.",
                            primaryActionLabel: emptyPrimaryLabel,
                        }}
                        onPrimaryAction={handlePrimaryAction}
                        showCard={false}
                        isLoading={isLoading}
                        minWidth="800px"
                    />
                </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="pt-4">
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
