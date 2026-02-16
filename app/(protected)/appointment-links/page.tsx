"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { routes } from "@/utils/routes";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/dataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputField } from "@/components/common/inputField";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/common/searchInput";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { Pagination } from "@/components/common/pagination";
import { useGetAllAppointmentLinksQuery, useDeleteAppointmentLinkMutation, useResendAppointmentLinkMutation } from "@/store/api/appointmentLinkApi";
import { useGetAllSpecialBookingsQuery, useVerifySpecialBookingOtpMutation, useUpdateSpecialBookingNoteMutation, useResendOtpMutation } from "@/store/api/specialBookingApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { formatDate, formatDateTime, isEmployee as checkIsEmployee } from "@/utils/helpers";
import {
    Plus,
    LayoutGrid,
    List,
    Trash2,
    Search,
    Filter,
    RefreshCw,
    MoreVertical,
    Copy,
    QrCode,
    Mail,
    Link as LinkIcon,
    Download,
    Check,
    AlertCircle,
    ShieldAlert,
    Link2,
    User,
    CheckCircle,
    XCircle,
    Phone,
    Calendar,
    Maximize2,
    MessageSquare,
    Key,
    Send
} from "lucide-react";
import { AppointmentLink } from "@/store/api/appointmentLinkApi";
import { getInitials, formatName } from "@/utils/helpers";
import { AppointmentLinkSelectionModal } from "@/components/appointment/AppointmentLinkSelectionModal";
import { useCooldown } from "@/hooks/useCooldown";
import { CreateAppointmentLinkModal } from "@/components/appointment/CreateAppointmentLinkModal";
import { QuickAppointmentModal } from "@/components/appointment/QuickAppointmentModal";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { StatusBadge } from "@/components/common/statusBadge";
import { ActionButton } from "@/components/common/actionButton";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";

export default function AppointmentLinksPage() {
    // ALL HOOKS MUST BE CALLED AT TOP LEVEL - BEFORE ANY CONDITIONAL RETURNS
    const router = useRouter();
    const { user: authUser, isAuthenticated, subscriptionLimits, isLoading: isAuthLoading } = useAuthSubscription();
    const user = authUser; // Maintain compatibility with existing code
    const [isChecking, setIsChecking] = useState(true);
    const isEmployee = checkIsEmployee(user);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isBooked, setIsBooked] = useState<boolean | undefined>(undefined);
    const [filterType, setFilterType] = useState<string>("link");
    const [search, setSearch] = useState("");
    const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showVipModal, setShowVipModal] = useState(false);
    const { hasReachedAppointmentLimit } = useSubscriptionStatus();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // OTP Modal states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [otpValue, setOtpValue] = useState("");

    // Note Modal states
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState("");
    const [showEditNoteModal, setShowEditNoteModal] = useState(false);
    const [noteValue, setNoteValue] = useState("");

    // Use cooldown hook
    const { cooldowns, startCooldown, isOnCooldown } = useCooldown();

    // ... hooks ...

    const [updateSpecialBookingNote, { isLoading: isUpdatingNote }] = useUpdateSpecialBookingNoteMutation();

    const handleUpdateNote = async () => {
        if (!selectedBookingId) return;
        try {
            await updateSpecialBookingNote({ bookingId: selectedBookingId, notes: noteValue }).unwrap();
            showSuccessToast("Note updated successfully");
            setShowEditNoteModal(false);
            setNoteValue("");
            refetchAll();
        } catch (error: any) {
            showErrorToast(error.data?.message || "Failed to update note");
        }
    };

    // Fetch Appointment Links
    // Fetch Appointment Links
    const { data: linksData, isLoading: isLoadingLinks, error: linksError, refetch: refetchLinks } = useGetAllAppointmentLinksQuery({
        page,
        limit,
        isBooked,
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
    }, {
        skip: !isAuthenticated || isChecking || filterType === "special",
    });

    // Fetch Special Bookings
    const { data: specialData, isLoading: isLoadingSpecial, refetch: refetchSpecial } = useGetAllSpecialBookingsQuery({
        page,
        limit,
        search: search || undefined,
    }, {
        skip: !isAuthenticated || isChecking || filterType === "link",
    });

    const [verifyOtp, { isLoading: isVerifying }] = useVerifySpecialBookingOtpMutation();
    const [deleteAppointmentLink, { isLoading: isDeleting }] = useDeleteAppointmentLinkMutation();
    const [resendLink] = useResendAppointmentLinkMutation();
    const [resendOtp] = useResendOtpMutation();

    const handleResend = useCallback(async (item: any) => {
        if (isOnCooldown(item._id)) return;

        try {
            if (item.entryType === 'special') {
                await resendOtp({ bookingId: item._id }).unwrap();
            } else {
                await resendLink(item._id).unwrap();
            }
            showSuccessToast("Notification resent successfully");
            startCooldown(item._id);
        } catch (error: any) {
            showErrorToast(error.data?.message || "Failed to resend notification");
        }
    }, [isOnCooldown, startCooldown, resendOtp, resendLink]);

    // Combined Data
    const combinedList = useMemo(() => {
        if (filterType === "link") {
            return (linksData?.links || []).map(l => ({ ...l, entryType: 'link' }));
        }

        return (specialData?.bookings || []).map(b => ({
            ...b,
            entryType: 'special',
            visitorEmail: b.visitorEmail,
            isBooked: b.status === 'verified',
        }));
    }, [linksData, specialData, filterType]);

    const isLoading = filterType === "link" ? isLoadingLinks : isLoadingSpecial;
    const paginationData = filterType === "link" ? linksData?.pagination : specialData?.pagination;

    // Refetch both
    // Refetch active query
    const refetchAll = useCallback(() => {
        if (filterType === "link") refetchLinks();
        if (filterType === "special") refetchSpecial();
    }, [refetchLinks, refetchSpecial, filterType]);

    // ALL HOOKS (useCallback, useMemo) MUST BE CALLED BEFORE CONDITIONAL RETURNS
    const handleDelete = useCallback(async () => {
        if (!deleteLinkId) return;

        try {
            await deleteAppointmentLink(deleteLinkId).unwrap();
            showSuccessToast("Appointment link deleted successfully");
            setDeleteLinkId(null);
            refetchAll();
        } catch (error: any) {
            const message = error?.data?.message || error?.message || "Failed to delete appointment link";
            showErrorToast(message);
        }
    }, [deleteLinkId, deleteAppointmentLink, refetchAll]);

    const handleVerifyOtp = async () => {
        if (!selectedBookingId || !otpValue) return;
        try {
            await verifyOtp({ bookingId: selectedBookingId, otp: otpValue }).unwrap();
            showSuccessToast("OTP verified and appointment scheduled!");
            setShowOtpModal(false);
            setOtpValue("");
            refetchAll();
        } catch (error: any) {
            showErrorToast(error.data?.message || "Invalid OTP");
        }
    };

    const handleCopyLink = useCallback((link: AppointmentLink) => {
        // Generate booking URL if not provided by backend
        const bookingUrl = link.bookingUrl || `${window.location.origin}/book-appointment/${link.secureToken}`;

        if (!bookingUrl) {
            showErrorToast("Unable to generate booking link");
            return;
        }

        navigator.clipboard.writeText(bookingUrl);
        showSuccessToast("Link copied to clipboard!");
    }, []);

    const columns = useMemo(
        () => [
            {
                key: "visitorEmail",
                header: "Visitor",
                render: (item: any) => {
                    const isSpecial = item.entryType === 'special';
                    const visitorId = item.visitorId;
                    const visitor = !isSpecial
                        ? (item.visitor || (typeof visitorId === "object" && visitorId !== null ? visitorId : null))
                        : { name: item.visitorName, phone: item.visitorPhone };

                    const visitorName = visitor?.name || "Unknown Visitor";
                    const formattedName = formatName(visitorName) || visitorName;
                    const visitorEmail = item.visitorEmail;
                    const visitorPhone = visitor?.phone || "N/A";
                    const visitorPhoto = (visitor as any)?.photo || "";

                    return (
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <div className="group relative shrink-0">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarImage
                                        src={visitorPhoto}
                                        alt={formattedName}
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <AvatarFallback>{getInitials(formattedName, 2)}</AvatarFallback>
                                </Avatar>
                                {visitorPhoto && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(visitorPhoto, "_blank");
                                        }}
                                        className="absolute -right-1 -bottom-1 rounded-full bg-[#3882a5] p-1 text-white opacity-0 shadow-md transition-colors group-hover:opacity-100 hover:bg-[#2d6a87]"
                                        title="View full image"
                                    >
                                        <Maximize2 className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium sm:text-base flex items-center gap-1">
                                    {formattedName}
                                    {isSpecial && <span className="text-[10px] bg-purple-100/50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider shadow-sm">VIP</span>}
                                </div>
                                <div className="flex items-center gap-1 truncate text-xs text-gray-500">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{visitorEmail}</span>
                                </div>
                                {visitorPhone !== "N/A" && (
                                    <div className="flex items-center gap-1 truncate text-xs text-gray-500">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{visitorPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "employee",
                header: "Meeting With",
                className: "table-cell min-w-[150px]",
                render: (item: any) => {
                    const employeeId = item.employeeId;
                    const employee =
                        item.employee || (typeof employeeId === "object" && employeeId !== null ? employeeId : null);

                    if (!employee || typeof employee === "string") {
                        return <span className="text-gray-400">N/A</span>;
                    }

                    const employeeNameRaw = employee.name || "Unknown Employee";
                    const employeeName = formatName(employeeNameRaw) || employeeNameRaw;
                    const employeeEmail = employee.email || "N/A";

                    return (
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
                                <AvatarFallback className="bg-accent/10 text-accent">
                                    {getInitials(employeeName, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium sm:text-base">{employeeName}</div>
                                <div className="flex items-center gap-1 truncate text-xs text-gray-500">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{employeeEmail}</span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "status",
                header: "Status",
                className: "table-cell",
                render: (item: any) => (
                    <StatusBadge status={item.isBooked ? "booked" : "pending"} className="w-fit" />
                ),
            },
            {
                key: "purpose",
                header: "Purpose",
                className: filterType === "special" ? "table-cell min-w-[150px]" : "hidden",
                render: (item: any) => (
                    <span className="text-sm text-gray-600 italic">
                        {item.purpose || "-"}
                    </span>
                ),
            },
            {
                key: "notes",
                header: "Notes",
                className: filterType === "special" ? "table-cell min-w-[120px]" : "hidden",
                render: (item: any) => (
                    item.notes ? (
                        <button
                            onClick={() => {
                                setSelectedNote(item.notes);
                                setShowNoteModal(true);
                            }}
                            className="flex items-center gap-1 text-xs text-[#3882a5] hover:underline"
                        >
                            <MessageSquare className="h-3 w-3" />
                            View Note
                        </button>
                    ) : (
                        <span className="text-gray-300">-</span>
                    )
                ),
            },
            {
                key: "createdAt",
                header: "Created",
                className: "table-cell min-w-[140px]",
                render: (item: any) => (
                    <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                        <Calendar className="text-muted-foreground h-3 w-3 shrink-0" />
                        <span className="whitespace-nowrap">{formatDateTime(item.createdAt)}</span>
                    </div>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                className: "text-right",
                sticky: 'right' as const,
                render: (item: any) => {
                    const isCreator = user?._id && (
                        item.createdBy === user._id ||
                        (typeof item.createdBy === 'object' && item.createdBy?._id === user._id)
                    );

                    return (
                        <div className="flex justify-end gap-1">
                            {item.entryType === 'special' && isCreator && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        // Close other modals
                                        setDeleteLinkId(null);
                                        setShowOtpModal(false);

                                        setSelectedBookingId(item._id);
                                        setNoteValue(item.notes || "");
                                        setShowEditNoteModal(true);
                                    }}
                                    className="text-blue-600 hover:bg-blue-50"
                                    title="Add/Edit Note"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            )}
                            {item.entryType === 'special' && !item.isBooked && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        // Close other modals
                                        setDeleteLinkId(null);
                                        setShowEditNoteModal(false);

                                        setSelectedBookingId(item._id);
                                        setShowOtpModal(true);
                                    }}
                                    className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                    title="Fill OTP"
                                >
                                    <Key className="h-4 w-4" />
                                </Button>
                            )}
                            {item.entryType === 'link' && !item.isBooked && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyLink(item)}
                                    className="text-[#3882a5] hover:bg-[#3882a5]/10 hover:text-[#3882a5]"
                                    title="Copy Link"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            )}
                            {!item.isBooked && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleResend(item)}
                                    disabled={!!cooldowns[item._id]}
                                    className={`${cooldowns[item._id] ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
                                    title={cooldowns[item._id] ? `Wait ${cooldowns[item._id]}s` : "Resend"}
                                >
                                    <Send className="h-4 w-4" />
                                    {cooldowns[item._id] && <span className="ml-1 text-[10px] tabular-nums">{cooldowns[item._id]}s</span>}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    // Close other modals
                                    setShowOtpModal(false);
                                    setShowEditNoteModal(false);

                                    setDeleteLinkId(item._id);
                                }}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        // Don't include cooldowns in dependencies to prevent re-render on every tick
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handleCopyLink, handleResend, filterType, user],
    );



    const handleFilterChange = useCallback((value: string) => {
        setFilterType(value);
        setPage(1);
    }, []);

    // useEffect for redirects - must be after all other hooks
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        setIsChecking(false);
    }, [user, isAuthenticated, router]);

    // Show loading state - ALL HOOKS HAVE BEEN CALLED ABOVE
    if (!isAuthenticated || isChecking) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (isLoading || isAuthLoading) {
        return <PageSkeleton />;
    }

    const canAccessAppointmentLinks = subscriptionLimits?.modules?.visitorInvite;

    if (canAccessAppointmentLinks === false) {
        return (
            <ModuleAccessDenied
                title="Visitor Invites Not Available"
                description="Your current subscription plan does not include the Visitor Invite module. Please upgrade your plan to access this feature."
            />
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Card */}


            {/* Stats Cards */}
            {linksData?.stats && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <Card className="card-hostinger">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground mb-1 text-xs sm:text-sm">Total Invites</p>
                                    <p className="text-accent text-xl font-bold sm:text-2xl">
                                        {linksData.stats.totalBooked + linksData.stats.totalNotBooked}
                                    </p>
                                </div>
                                <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12">
                                    <Link2 className="text-accent h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hostinger">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground mb-1 text-xs sm:text-sm">Booked</p>
                                    <p className="text-xl font-bold text-green-700 sm:text-2xl">
                                        {linksData.stats.totalBooked}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 sm:h-12 sm:w-12">
                                    <CheckCircle className="h-5 w-5 text-green-700 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hostinger">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground mb-1 text-xs sm:text-sm">Pending</p>
                                    <p className="text-xl font-bold text-yellow-800 sm:text-2xl">
                                        {linksData.stats.totalNotBooked}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 sm:h-12 sm:w-12">
                                    <XCircle className="h-5 w-5 text-yellow-800 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Table Section */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col w-full gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="w-full sm:w-[260px] sm:flex-none">
                        <SearchInput
                            placeholder="Search by visitor..."
                            value={search}
                            onChange={setSearch}
                            debounceDelay={500}
                            className="w-full"
                        />
                    </div>
                    <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                        <div className="flex-1 sm:w-auto sm:flex-none">
                            <div className="flex p-1 bg-gray-100/80 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => handleFilterChange("link")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${filterType === "link"
                                        ? "bg-white text-[#3882a5] shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        }`}
                                >
                                    Send Link
                                </button>
                                <button
                                    onClick={() => handleFilterChange("special")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${filterType === "special"
                                        ? "bg-white text-[#3882a5] shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        }`}
                                >
                                    VIP Booking
                                </button>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refetchAll}
                            disabled={isLoading}
                            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 border-gray-200 hover:bg-gray-50 bg-white shadow-sm transition-all active:scale-95"
                            title="Refresh Table"
                        >
                            <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <div className="shrink-0">
                            {hasReachedAppointmentLimit ? (
                                <>
                                    <ActionButton
                                        variant="primary"
                                        size="xl"
                                        className="flex items-center justify-center gap-2 text-xs whitespace-nowrap sm:text-sm"
                                        onClick={() => setShowUpgradeModal(true)}
                                    >
                                        <Plus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                        <span className="sm:hidden">UPGRADE</span>
                                        <span className="hidden sm:inline">UPGRADE TO SCHEDULE MORE</span>
                                    </ActionButton>
                                    <UpgradePlanModal
                                        isOpen={showUpgradeModal}
                                        onClose={() => setShowUpgradeModal(false)}
                                    />
                                </>
                            ) : (
                                <>
                                    <>
                                        <CreateAppointmentLinkModal
                                            open={showLinkModal}
                                            onOpenChange={setShowLinkModal}
                                            onSuccess={() => {
                                                refetchAll();
                                            }}
                                        />
                                        <QuickAppointmentModal
                                            open={showVipModal}
                                            onOpenChange={setShowVipModal}
                                            onSuccess={() => {
                                                refetchAll();
                                            }}
                                        />
                                        <ActionButton
                                            variant="outline-primary"
                                            size="xl"
                                            className="flex items-center justify-center sm:gap-2 text-xs whitespace-nowrap sm:text-sm"
                                            onClick={() => {
                                                if (filterType === "special") {
                                                    setShowVipModal(true);
                                                } else {
                                                    setShowLinkModal(true);
                                                }
                                            }}
                                        >
                                            {filterType === "special" ? (
                                                <>
                                                    <User className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                                    <span className="hidden sm:inline">Book VIP</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                                    <span className="hidden sm:inline">Create Link</span>
                                                </>
                                            )}
                                        </ActionButton>
                                    </>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-xs">
                    <DataTable
                        data={combinedList}
                        columns={columns}
                        isLoading={isLoading}
                        showCard={false}
                        emptyData={{
                            title: "No appointment links found",
                            description: "Create your first appointment link to get started.",
                            primaryActionLabel: hasReachedAppointmentLimit
                                ? "Upgrade Plan"
                                : (filterType === "special" ? "Book VIP" : "Create Link"),
                        }}
                        onPrimaryAction={() => {
                            if (hasReachedAppointmentLimit) {
                                setShowUpgradeModal(true);
                            } else {
                                if (filterType === "special") {
                                    setShowVipModal(true);
                                } else {
                                    setShowLinkModal(true);
                                }
                            }
                        }}
                    />
                </div>

                {combinedList.length > 0 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={paginationData?.totalPages || 1}
                            totalItems={paginationData?.total || combinedList.length}
                            pageSize={limit}
                            onPageChange={setPage}
                            hasNextPage={page < (paginationData?.totalPages || 1)}
                            hasPrevPage={page > 1}
                        />
                    </div>
                )}

                <ConfirmationDialog
                    open={!!deleteLinkId}
                    onOpenChange={(open) => !open && setDeleteLinkId(null)}
                    onConfirm={handleDelete}
                    title="Delete Appointment Link"
                    description="Are you sure you want to delete this appointment link? This action cannot be undone."
                    confirmText={isDeleting ? "Deleting..." : "Delete"}
                    cancelText="Cancel"
                    variant="destructive"
                />

                {/* OTP Verification Modal */}
                <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <Key className="h-5 w-5 text-orange-600" />
                                Verify OTP
                            </DialogTitle>
                            <DialogDescription>
                                Enter the 4-digit OTP sent to the visitor's mobile.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">OTP Code</label>
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otpValue[index] || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value) {
                                                const newOtp = otpValue.split('');
                                                newOtp[index] = value;
                                                const newOtpValue = newOtp.join('');
                                                setOtpValue(newOtpValue);

                                                // Auto-focus next input
                                                if (index < 3) {
                                                    document.getElementById(`otp-${index + 1}`)?.focus();
                                                }

                                                // Auto-submit when all 4 digits are entered
                                                if (index === 3 && newOtpValue.length === 4) {
                                                    handleVerifyOtp();
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Handle backspace
                                            if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
                                                const newOtp = otpValue.split('');
                                                newOtp[index - 1] = '';
                                                setOtpValue(newOtp.join(''));
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            } else if (e.key === 'Backspace' && otpValue[index]) {
                                                const newOtp = otpValue.split('');
                                                newOtp[index] = '';
                                                setOtpValue(newOtp.join(''));
                                            }
                                            // Handle arrow keys
                                            else if (e.key === 'ArrowLeft' && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            } else if (e.key === 'ArrowRight' && index < 3) {
                                                document.getElementById(`otp-${index + 1}`)?.focus();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                                            setOtpValue(pastedData);

                                            // Focus the last filled box or the first empty one
                                            const nextIndex = Math.min(pastedData.length, 3);
                                            document.getElementById(`otp-${nextIndex}`)?.focus();

                                            // Auto-submit if 4 digits pasted
                                            if (pastedData.length === 4) {
                                                setTimeout(() => handleVerifyOtp(), 100);
                                            }
                                        }}
                                        className="w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl sm:text-3xl font-bold border-2 rounded-lg focus:border-[#3882a5] focus:ring-2 focus:ring-[#3882a5]/20 outline-none transition-all"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" onClick={() => setShowOtpModal(false)} className="w-full sm:flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleVerifyOtp}
                                disabled={otpValue.length !== 4 || isVerifying}
                                variant="primary"
                                className="w-full sm:flex-1"
                            >
                                {isVerifying ? <LoadingSpinner size="sm" className="mr-2" /> : "Verify & Schedule"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Note Viewer Modal */}
                <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <MessageSquare className="h-5 w-5 text-[#3882a5]" />
                                Visitor Note
                            </DialogTitle>
                        </DialogHeader>
                        <div className="bg-blue-50/50 p-6 rounded-xl text-gray-700 whitespace-pre-wrap min-h-[120px] text-sm leading-relaxed border border-blue-100 italic">
                            {selectedNote ? `"${selectedNote}"` : "No note provided."}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowNoteModal(false)} variant="primary" className="px-8">
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Note Modal */}
                <Dialog open={showEditNoteModal} onOpenChange={setShowEditNoteModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <MessageSquare className="h-5 w-5 text-[#3882a5]" />
                                Add/Update Note
                            </DialogTitle>
                            <DialogDescription>
                                Add special instructions or notes for this booking.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="Type your note here..."
                                value={noteValue}
                                onChange={(e) => setNoteValue(e.target.value)}
                                className="min-h-[150px] resize-none border-2 focus:border-[#3882a5]"
                            />
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" onClick={() => setShowEditNoteModal(false)} className="w-full sm:flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateNote}
                                disabled={isUpdatingNote}
                                variant="primary"
                                className="w-full sm:flex-1"
                            >
                                {isUpdatingNote ? <LoadingSpinner size="sm" className="mr-2" /> : "Save Note"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
