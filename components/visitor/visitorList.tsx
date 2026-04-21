"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/searchInput";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Plus,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Maximize2,
    UserPlus,
    Settings,
} from "lucide-react";
import {
    useGetVisitorsQuery,
    useDeleteVisitorMutation,
    useUpdateVisitorMutation,
    Visitor,
    GetVisitorsQuery,
} from "@/store/api/visitorApi";

import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

import { formatDate, formatName, getInitials } from "@/utils/helpers";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAssistantOpen, setAssistantMessage } from "@/store/slices/uiSlice";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { DataTable } from "@/components/common/dataTable";
import { APIErrorState } from "@/components/common/APIErrorState";

// ─── Main VisitorList ────────────────────────────────────────────────────────
export function VisitorList() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const { hasReachedVisitorLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
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
    const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();



    const visitors = visitorsData?.visitors || [];
    const pagination = visitorsData?.pagination;

    const emptyPrimaryLabel = useMemo(() => {
        if (isEmployee) return "Register Visitor";
        if (isExpired) return "Upgrade Plan";
        if (hasReachedVisitorLimit) return "Support Chat";
        return "Register Visitor";
    }, [isEmployee, isExpired, hasReachedVisitorLimit]);

    const handlePrimaryAction = () => {
        if (!isEmployee) {
            if (isExpired) {
                openUpgradeModal();
            } else if (hasReachedVisitorLimit) {
                dispatch(setAssistantMessage(`Hi, I've reached my visitor limit. Please help me upgrade my plan.`));
                dispatch(setAssistantOpen(true));
            } else {
                router.push(routes.privateroute.VISITORREGISTRATION);
            }
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
                                <span className="truncate max-w-[140px]" title={visitor.email}>
                                    {visitor.email}
                                </span>
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
                className: "text-center min-w-[150px] whitespace-nowrap",
                render: (visitor: Visitor) => (
                    <div className="mx-auto w-[120px]">
                        <div className="flex items-center justify-center">
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="h-8 px-4 rounded-lg gap-1.5 font-bold transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
                                onClick={() => router.push(routes.privateroute.VISITORSETTINGS.replace("[id]", visitor._id))}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </Button>
                        </div>
                    </div>
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
                <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
                    <SearchInput
                        placeholder="Search visitors..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        debounceDelay={500}
                        className="flex-1 min-w-[120px] sm:w-[260px] sm:flex-none"
                    />
                    <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
                        <SubscriptionActionButtons
                            isExpired={isExpired}
                            hasReachedLimit={hasReachedVisitorLimit}
                            limitType="visitor"
                            showUpgradeModal={showUpgradeModal}
                            openUpgradeModal={openUpgradeModal}
                            closeUpgradeModal={closeUpgradeModal}
                            upgradeLabel="Upgrade Plan"
                            icon={UserPlus}
                            isEmployee={isEmployee}
                        >
                            <Button
                                variant="primary"
                                className="flex h-11 sm:h-12 w-11 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl sm:px-8 font-bold transition-all shadow-md active:scale-95 hover:scale-105"
                                onClick={() => router.push(routes.privateroute.VISITORREGISTRATION)}
                            >
                                <Plus className="h-5 w-5 shrink-0" />
                                <span className="hidden sm:inline">Add Visitor</span>
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


        </div>
    );
}
