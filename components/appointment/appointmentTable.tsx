"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/common/dataTable";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/statusBadge";
import { format } from "date-fns";
import {
    formatDateTime,
    formatName,
    getInitials,
    getAppointmentStatus,
    getAppointmentDateTime,
} from "@/utils/helpers";
import {
    Eye,
    LogOut,
    Calendar,
    MoreVertical,
    Plus,
    RefreshCw,
    Phone,
    Mail,
    Building,
    CheckCircle,
    X,
    XCircle,
    Edit,
    Maximize2,
    Send,
} from "lucide-react";
import { Appointment, useResendAppointmentNotificationMutation } from "@/store/api/appointmentApi";
import { SearchInput } from "@/components/common/searchInput";
import DateRangePicker from "@/components/common/dateRangePicker";
import { AppointmentDetailsDialog } from "./appointmentDetailsDialog";
import { CheckInDialog } from "./checkInDialog";
import { CheckOutDialog } from "./checkOutDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { routes } from "@/utils/routes";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useCooldown } from "@/hooks/useCooldown";
import { APIErrorState } from "@/components/common/APIErrorState";

export interface AppointmentTableProps {
    appointments: Appointment[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalAppointments: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    isLoading?: boolean;
    error?: any;
    searchTerm: string;
    currentPage: number;
    pageSize: number;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onDelete?: (appointmentId: string) => void;
    onView?: (appointment: Appointment) => void;
    onCheckIn?: (appointmentId: string, notes?: string) => void;
    onCheckOut?: (appointmentId: string, notes?: string) => void;
    onApprove?: (appointmentId: string) => void;
    onReject?: (appointmentId: string) => void;
    isDeleting?: boolean;
    isCheckingIn?: boolean;
    isCheckingOut?: boolean;
    isApproving?: boolean;
    isRejecting?: boolean;
    onRefresh?: () => void;
    showHeader?: boolean;
    title?: string;
    description?: string;
    statusFilter?: string;
    employeeFilter?: string;
    dateFrom?: string;
    dateTo?: string;
    onDateFromChange?: (value: string) => void;
    onDateToChange?: (value: string) => void;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onStatusFilterChange?: (value: string) => void;
    onEmployeeFilterChange?: (value: string) => void;
    onPageSizeChange?: (value: number) => void;
    onSortChange?: (field: string) => void;
}

export function AppointmentTable({
    appointments,
    pagination,
    isLoading,
    error,
    searchTerm,
    currentPage,
    pageSize,
    dateFrom,
    dateTo,
    onSearchChange,
    onPageChange,
    onDelete,
    onView,
    onCheckIn,
    onCheckOut,
    onApprove,
    onReject,
    isDeleting = false,
    isCheckingIn = false,
    isCheckingOut = false,
    isApproving = false,
    isRejecting = false,
    showHeader = true,
    title,
    onDateFromChange,
    onDateToChange,
}: AppointmentTableProps) {
    const router = useRouter();
    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
        showAddonModal,
        openAddonModal,
        closeAddonModal
    } = useSubscriptionActions();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const [loadingAppointments, setLoadingAppointments] = useState<Set<string>>(new Set());

    // Resend functionality - use cooldown hook
    const [resendNotification] = useResendAppointmentNotificationMutation();
    const { cooldowns, startCooldown, isOnCooldown } = useCooldown();

    const setAppointmentLoading = (appointmentId: string, isLoading: boolean) => {
        setLoadingAppointments((prev) => {
            const newSet = new Set(prev);
            if (isLoading) {
                newSet.add(appointmentId);
            } else {
                newSet.delete(appointmentId);
            }
            return newSet;
        });
    };

    const isAppointmentLoading = (appointmentId: string) => {
        return loadingAppointments.has(appointmentId);
    };

    const isToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;
        return dateFrom === todayStr && dateTo === todayStr;
    };

    // Check if user is employee
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);

    const emptyPrimaryLabel = isEmployee
        ? "Create Appointment Link"
        : (hasReachedAppointmentLimit ? "Upgrade Plan" : "Schedule Appointment");
    const emptyTitle = isToday() ? "No appointments for today" : "No appointments yet";

    const handleDelete = async () => {
        if (!selectedAppointment || !onDelete) return;
        await onDelete(selectedAppointment._id);
        setShowDeleteDialog(false);
        setSelectedAppointment(null);
    };

    const handleCheckIn = async (appointmentId: string, notes?: string) => {
        if (!onCheckIn) return;
        setAppointmentLoading(appointmentId, true);
        try {
            await onCheckIn(appointmentId, notes);
            setShowCheckInDialog(false);
            setSelectedAppointment(null);
        } finally {
            setAppointmentLoading(appointmentId, false);
        }
    };

    const handleCheckOut = async (appointmentId: string, notes?: string) => {
        if (!onCheckOut) return;
        setAppointmentLoading(appointmentId, true);
        try {
            await onCheckOut(appointmentId, notes);
            setShowCheckOutDialog(false);
            setSelectedAppointment(null);
        } finally {
            setAppointmentLoading(appointmentId, false);
        }
    };

    const handleApprove = async (appointmentId: string) => {
        if (!onApprove) return;
        setAppointmentLoading(appointmentId, true);
        try {
            await onApprove(appointmentId);
        } finally {
            setAppointmentLoading(appointmentId, false);
        }
    };

    const handleReject = async (appointmentId: string) => {
        if (!onReject) return;
        setAppointmentLoading(appointmentId, true);
        try {
            await onReject(appointmentId);
        } finally {
            setAppointmentLoading(appointmentId, false);
        }
    };

    const handleView = (appointment: Appointment) => {
        // Close all other modals first
        setShowCheckInDialog(false);
        setShowCheckOutDialog(false);
        setShowApproveDialog(false);
        setShowRejectDialog(false);
        setShowDeleteDialog(false);

        // Then set the appointment and open view dialog
        setSelectedAppointment(appointment);
        setShowViewDialog(true);
    };

    const handleEdit = (appointment: Appointment) => {
        router.push(routes.privateroute.APPOINTMENTEDIT.replace("[id]", appointment._id));
    };

    const handleResend = async (appointmentId: string) => {
        if (isOnCooldown(appointmentId)) return;

        try {
            await resendNotification(appointmentId).unwrap();
            // Success toast will be shown automatically if needed
            startCooldown(appointmentId);
        } catch (error: any) {
            // Error toast will be shown automatically if needed
        }
    };

    // Using common functions from utils/helpers
    const isAppointmentDatePast = (appointment: Appointment): boolean => {
        const scheduledDateTime = getAppointmentDateTime(appointment);
        if (!scheduledDateTime) return false;
        const now = new Date();
        return scheduledDateTime < now;
    };

    const getColumns = () => {
        const baseColumns = [
            {
                key: "visitorName",
                header: "Visitor",
                render: (appointment: Appointment) => {
                    const visitor = (appointment as any).visitorId || appointment.visitor;
                    const visitorNameRaw = visitor?.name || "Unknown Visitor";
                    const visitorName = formatName(visitorNameRaw) || visitorNameRaw;
                    const visitorPhone = visitor?.phone || "N/A";
                    const visitorEmail = visitor?.email || "N/A";
                    const visitorCompany = visitor?.company || "";
                    // Get photo from visitor object, handle both populated and non-populated cases
                    const visitorPhoto = visitor?.photo || (visitor as any)?.profilePicture || "";

                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="group relative shrink-0">
                                <Avatar className="h-10 w-10">
                                    {visitorPhoto ? (
                                        <AvatarImage
                                            key={visitorPhoto}
                                            src={visitorPhoto}
                                            alt={visitorName}
                                        />
                                    ) : null}
                                    <AvatarFallback className="flex items-center justify-center leading-none text-xs">
                                        {getInitials(visitorName, 2)}
                                    </AvatarFallback>
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
                                <div className="truncate font-medium">{visitorName}</div>
                                {visitorEmail !== "N/A" && (
                                    <div className="flex items-center gap-1 truncate text-xs text-gray-500">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{visitorEmail}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span>{visitorPhone}</span>
                                </div>
                                {visitorCompany && (
                                    <div className="mt-0.5 truncate text-xs text-gray-400">{formatName(visitorCompany)}</div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "employeeName",
                header: "Meeting With",
                render: (appointment: Appointment) => {
                    const employee = (appointment as any).employeeId || appointment.employee;
                    const employeeNameRaw = employee?.name || "Unknown Employee";
                    const employeeName = formatName(employeeNameRaw) || employeeNameRaw;
                    const employeeEmail = employee?.email || "N/A";
                    const employeeDepartment = employee?.department || "";
                    // Get photo from employee object, handle both populated and non-populated cases
                    const employeePhoto = employee?.photo || (employee as any)?.profilePicture || "";

                    return (
                        <div className="flex items-center gap-3">
                            <div className="group relative shrink-0">
                                <Avatar className="h-10 w-10">
                                    {employeePhoto ? (
                                        <AvatarImage
                                            key={employeePhoto}
                                            src={employeePhoto}
                                            alt={employeeName}
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-blue-100 text-blue-600 flex items-center justify-center leading-none text-xs">
                                        {getInitials(employeeName, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                {employeePhoto && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(employeePhoto, "_blank");
                                        }}
                                        className="absolute -right-1 -bottom-1 rounded-full bg-[#3882a5] p-1 text-white opacity-0 shadow-md transition-colors group-hover:opacity-100 hover:bg-[#2d6a87]"
                                        title="View full image"
                                    >
                                        <Maximize2 className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <div className="font-medium">{employeeName}</div>
                                <div className="text-sm text-gray-500">{formatName(employeeDepartment) || "N/A"}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    {employeeEmail}
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "purpose",
                header: "Purpose",
                render: (appointment: Appointment) => {
                    const visitor = (appointment as any).visitorId || appointment.visitor;
                    return (
                        <div className="space-y-1">
                            <div
                                className="max-w-[200px] truncate text-sm"
                                title={appointment.appointmentDetails?.purpose || "N/A"}
                            >
                                {formatName(appointment.appointmentDetails?.purpose) || "N/A"}
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "appointmentDate",
                header: "Date & Time",
                render: (appointment: Appointment) => {
                    const dateTime = formatDateTime(
                        appointment.appointmentDetails?.scheduledDate || "",
                        appointment.appointmentDetails?.scheduledTime,
                    );
                    return (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="text-muted-foreground h-3 w-3 shrink-0" />
                            <span>{dateTime || "N/A"}</span>
                        </div>
                    );
                },
            },
            {
                key: "status",
                header: "Status",
                render: (appointment: Appointment) => {
                    if (isAppointmentLoading(appointment._id)) {
                        return (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></div>
                                <span className="text-sm text-gray-500 text-[11px]">Processing...</span>
                            </div>
                        );
                    }

                    const effectiveStatus = getAppointmentStatus(appointment) as
                        | "pending"
                        | "approved"
                        | "rejected"
                        | "completed"
                        | "time_out"
                        | "checked_in";

                    const isTimedOut = effectiveStatus === "time_out";
                    const status = effectiveStatus;

                    return (
                        <div className="flex py-1">
                            <StatusBadge status={effectiveStatus} />
                        </div>
                    );
                },
            },
        ];

        baseColumns.push({
            key: "actions",
            header: "Actions",
            render: (appointment: Appointment) => {
                const status = typeof appointment.status === "string" ? appointment.status : "pending";
                const isTimedOut = !!appointment.isTimedOut;
                const isPending = status === "pending" && !isTimedOut;
                const isApproved = status === "approved";
                const isRejected = status === "rejected";
                const isCompleted = status === "completed";
                const showOnlyView = isRejected || isCompleted;

                return (
                    <div className="flex items-center gap-1.5 justify-end">
                        {/* Quick Actions */}
                        {!isTimedOut && (
                            <>
                                {status === "pending" && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-8 p-0 bg-emerald-50/50 border-emerald-500/50 text-emerald-600 hover:bg-emerald-100/50 hover:text-emerald-700 rounded-md shadow-sm transition-all duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAppointment(appointment);
                                                setShowApproveDialog(true);
                                            }}
                                            title="Approve"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-8 p-0 bg-rose-50/50 border-rose-500/50 text-rose-600 hover:bg-rose-100/50 hover:text-rose-700 rounded-md shadow-sm transition-all duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAppointment(appointment);
                                                setShowRejectDialog(true);
                                            }}
                                            title="Reject"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                {status === "approved" && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-8 p-0 bg-indigo-50 border-indigo-500/50 text-indigo-600 hover:bg-indigo-100/50 hover:text-indigo-700 rounded-md shadow-sm transition-all duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAppointment(appointment);
                                            setShowCheckInDialog(true);
                                        }}
                                        title="Check In"
                                    >
                                        <LogOut className="h-4 w-4 rotate-180" />
                                    </Button>
                                )}
                                {status === "checked_in" && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-8 p-0 bg-orange-50/50 border-orange-500/50 text-orange-600 hover:bg-orange-100/50 hover:text-orange-700 rounded-md shadow-sm transition-all duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAppointment(appointment);
                                            setShowCheckOutDialog(true);
                                        }}
                                        title="Check Out"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {onView && (
                                    <DropdownMenuItem onClick={() => handleView(appointment)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                )}

                                {isPending && (
                                    <>
                                        <DropdownMenuSeparator />
                                        {!isEmployee && (
                                            <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleResend(appointment._id)}
                                            disabled={!!cooldowns[appointment._id]}
                                            className={cooldowns[appointment._id] ? 'opacity-50' : ''}
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {cooldowns[appointment._id] ? `Resend (${cooldowns[appointment._id]}s)` : 'Resend'}
                                        </DropdownMenuItem>
                                    </>
                                )}


                                {showOnlyView && null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        });

        return baseColumns;
    };

    if (error) {
        return (
            <APIErrorState
                title="Failed to load appointments"
                error={error}
            />
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">


            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <SearchInput
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        debounceDelay={500}
                        className="w-full sm:max-w-[300px]"
                    />
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex-1 sm:flex-none">
                            <DateRangePicker
                                onDateRangeChange={(r) => {
                                    onDateFromChange?.(r.startDate || "");
                                    onDateToChange?.(r.endDate || "");
                                    onPageChange?.(1);
                                }}
                                initialValue={dateFrom && dateTo ? { startDate: dateFrom, endDate: dateTo } : undefined}
                                className="w-full sm:w-auto"
                            />
                        </div>
                        
                        <SubscriptionActionButtons
                            isExpired={isExpired}
                            hasReachedLimit={hasReachedAppointmentLimit}
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
                            className="h-10 w-10 sm:h-12 sm:w-auto sm:px-6 rounded-xl shrink-0"
                        >
                            {!isEmployee && (
                                <Button
                                    variant="outline"
                                    className="flex h-10 w-10 sm:h-12 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5]/10 bg-white sm:px-6 sm:min-w-[160px] transition-all"
                                    onClick={() => router.push(routes.privateroute.APPOINTMENTCREATE)}
                                >
                                    <Plus className="h-5 w-5 shrink-0" />
                                    <span className="hidden sm:inline font-medium">Schedule Appointment</span>
                                </Button>
                            )}
                        </SubscriptionActionButtons>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                    <DataTable
                        data={appointments}
                        columns={getColumns()}
                        emptyMessage="No appointments found. Try adjusting your search criteria."
                        emptyData={{
                            title: emptyTitle,
                            description: "Get started by scheduling your first appointment.",
                            primaryActionLabel: emptyPrimaryLabel,
                        }}
                        onPrimaryAction={() => {
                            if (isEmployee) {
                                router.push(routes.privateroute.APPOINTMENT_LINKS);
                            } else if (isExpired) {
                                openUpgradeModal();
                            } else if (hasReachedAppointmentLimit) {
                                openAddonModal();
                            } else {
                                router.push(routes.privateroute.APPOINTMENTCREATE);
                            }
                        }}
                        showCard={false}
                        isLoading={isLoading}
                        minWidth="1000px"
                    />
                </div>
            </div >

            {pagination && pagination.totalPages > 1 && (
                <div className="pt-4">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalAppointments}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                        hasNextPage={pagination.hasNextPage}
                        hasPrevPage={pagination.hasPrevPage}
                    />
                </div>
            )}

            {
                onDelete && (
                    <ConfirmationDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        title="Delete Appointment"
                        description={<>Are you sure you want to delete the appointment for <strong>{formatName(selectedAppointment?.visitor?.name || (selectedAppointment as any)?.visitorId?.name || "this visitor")}</strong>? This will move it to trash.</>}
                        onConfirm={handleDelete}
                        confirmText={isDeleting ? "Deleting..." : "Delete"}
                        variant="destructive"
                    />
                )
            }

            {
                onApprove && (
                    <ConfirmationDialog
                        open={showApproveDialog}
                        onOpenChange={setShowApproveDialog}
                        title="Approve Appointment"
                        description={<>Are you sure you want to approve the appointment for <strong>{formatName(selectedAppointment?.visitor?.name || (selectedAppointment as any)?.visitorId?.name || "this visitor")}</strong>? This will change the status to approved.</>}
                        onConfirm={() => {
                            if (selectedAppointment) {
                                handleApprove(selectedAppointment._id);
                                setShowApproveDialog(false);
                            }
                        }}
                        confirmText={
                            isApproving || isAppointmentLoading(selectedAppointment?._id || "") ? "Approving..." : "Approve"
                        }
                        variant="default"
                    />
                )
            }

            <ConfirmationDialog
                open={showRejectDialog}
                onOpenChange={setShowRejectDialog}
                title="Reject Appointment"
                description={<>Are you sure you want to reject the appointment for <strong>{formatName(selectedAppointment?.visitor?.name || (selectedAppointment as any)?.visitorId?.name || "this visitor")}</strong>? This will change the status to rejected.</>}
                onConfirm={() => {
                    if (selectedAppointment) {
                        handleReject(selectedAppointment._id);
                        setShowRejectDialog(false);
                    }
                }}
                confirmText={
                    isRejecting || isAppointmentLoading(selectedAppointment?._id || "") ? "Rejecting..." : "Reject"
                }
                variant="destructive"
            />

            {
                onCheckIn && (
                    <CheckInDialog
                        appointment={selectedAppointment}
                        open={showCheckInDialog}
                        onClose={() => setShowCheckInDialog(false)}
                        onConfirm={handleCheckIn}
                        isLoading={isCheckingIn}
                    />
                )
            }

            {
                onCheckOut && (
                    <CheckOutDialog
                        appointment={selectedAppointment}
                        open={showCheckOutDialog}
                        onClose={() => setShowCheckOutDialog(false)}
                        onConfirm={handleCheckOut}
                        isLoading={isCheckingOut}
                    />
                )
            }

            <AppointmentDetailsDialog
                appointment={selectedAppointment}
                mode="active"
                open={showViewDialog}
                on_close={() => setShowViewDialog(false)}
                onCheckOut={
                    onCheckOut
                        ? () => {
                            setShowViewDialog(false);
                            setShowCheckOutDialog(true);
                        }
                        : undefined
                }
            />
        </div >
    );
}
