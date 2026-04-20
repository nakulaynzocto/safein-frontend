"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { DataTable } from "@/components/common/dataTable";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/statusBadge";
import { format } from "date-fns";
import {
    formatDate,
    formatTime,
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
    CheckCircle,
    X,
    XCircle,
    Edit,
    Maximize2,
    Send,
    UserPlus,
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
import { useAppDispatch } from "@/store/hooks";
import { setAssistantOpen, setAssistantMessage } from "@/store/slices/uiSlice";

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
    onCheckIn?: (appointmentId: string, notes?: string, visitorPhoto?: string) => void;
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
    const dispatch = useAppDispatch();
    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
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
        : (isExpired ? "Upgrade Plan" : (hasReachedAppointmentLimit ? "Support Chat" : "Schedule Appointment"));
    const emptyTitle = isToday() ? "No appointments for today" : "No appointments yet";

    const handleDelete = async () => {
        if (!selectedAppointment || !onDelete) return;
        await onDelete(selectedAppointment._id);
        setShowDeleteDialog(false);
        setSelectedAppointment(null);
    };

    const handleCheckIn = async (appointmentId: string, notes?: string, visitorPhoto?: string) => {
        if (!onCheckIn) return;
        setAppointmentLoading(appointmentId, true);
        try {
            await onCheckIn(appointmentId, notes, visitorPhoto);
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

    const columns = useMemo(() => {
        const baseColumns = [
            {
                key: "visitorName",
                header: "Visitor",
                render: (appointment: Appointment) => {
                    const visitor = (appointment as any).visitorId || appointment.visitor;
                    const visitorNameRaw = visitor?.name || "Unknown Visitor";
                    const visitorName = formatName(visitorNameRaw) || visitorNameRaw;
                    const visitorPhone = visitor?.phone || "N/A";
                    const visitorPhoto = visitor?.photo || (visitor as any)?.profilePicture || "";

                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar
                                src={visitorPhoto}
                                name={visitorName}
                                size="md"
                                allowExpand
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{visitorName}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span>{visitorPhone}</span>
                                </div>
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
                    const employeePhone = employee?.phone || "N/A";
                    const employeePhoto = employee?.photo || (employee as any)?.profilePicture || "";

                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar
                                src={employeePhoto}
                                name={employeeName}
                                size="md"
                                allowExpand
                                fallbackClassName="bg-blue-100 text-blue-600"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{employeeName}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span>{employeePhone}</span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "purpose",
                header: "Purpose",
                render: (appointment: Appointment) => (
                    <div className="max-w-[200px] truncate text-sm" title={appointment.appointmentDetails?.purpose || "N/A"}>
                        {formatName(appointment.appointmentDetails?.purpose) || "N/A"}
                    </div>
                ),
            },
            {
                key: "appointmentDate",
                header: "Date & Time",
                render: (appointment: Appointment) => {
                    const date = formatDate(appointment.appointmentDetails?.scheduledDate || "");
                    const time = appointment.appointmentDetails?.scheduledTime
                        ? formatTime(appointment.appointmentDetails.scheduledTime)
                        : "";

                    return (
                        <div className="flex items-start gap-2 text-sm group/date">
                            <div className="mt-1 bg-muted/50 p-1 rounded-md text-muted-foreground group-hover/date:text-primary transition-colors">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-foreground/90 tabular-nums">
                                    {date || "N/A"}
                                </span>
                                {time && (
                                    <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                                        {time}
                                    </span>
                                )}
                            </div>
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
                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                                <span className="text-[11px] text-gray-500">Processing...</span>
                            </div>
                        );
                    }
                    return <StatusBadge status={getAppointmentStatus(appointment) as any} />;
                },
            },
            {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (appointment: Appointment) => {
                    const status = typeof appointment.status === "string" ? appointment.status : "pending";
                    const isTimedOut = !!appointment.isTimedOut;
                    const isPending = status === "pending" && !isTimedOut;
                    const isApproved = status === "approved";
                    const isCheckedIn = status === "checked_in";

                    return (
                        <div className="flex items-center gap-1.5 justify-end">
                            {!isTimedOut && (
                                <>
                                    {isPending && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 w-8 p-0 bg-emerald-50/50 border-emerald-500/50 text-emerald-600 hover:bg-emerald-100/50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAppointment(appointment);
                                                    setShowApproveDialog(true);
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 w-8 p-0 bg-rose-50/50 border-rose-500/50 text-rose-600 hover:bg-rose-100/50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAppointment(appointment);
                                                    setShowRejectDialog(true);
                                                }}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    {isApproved && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-8 p-0 bg-indigo-50 border-indigo-500/50 text-indigo-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAppointment(appointment);
                                                setShowCheckInDialog(true);
                                            }}
                                        >
                                            <LogOut className="h-4 w-4 rotate-180" />
                                        </Button>
                                    )}
                                    {isCheckedIn && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-8 p-0 bg-orange-50/50 border-orange-500/50 text-orange-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAppointment(appointment);
                                                setShowCheckOutDialog(true);
                                            }}
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
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                    )}
                                    {isPending && (
                                        <>
                                            <DropdownMenuSeparator />
                                            {!isEmployee && (
                                                <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => handleResend(appointment._id)}
                                                disabled={!!cooldowns[appointment._id]}
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                {cooldowns[appointment._id] ? `Resend (${cooldowns[appointment._id]}s)` : 'Resend'}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ];

        return baseColumns;
    }, [onView, handleEdit, handleResend, isEmployee, cooldowns, loadingAppointments, router]);


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


            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 sm:gap-4">
                        <SearchInput
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            debounceDelay={500}
                            className="w-full lg:max-w-[320px]"
                        />
                    </div>
                    
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3">
                        <div className="flex-1 sm:flex-none">
                            <DateRangePicker
                                onDateRangeChange={(r) => {
                                    onDateFromChange?.(r.startDate || "");
                                    onDateToChange?.(r.endDate || "");
                                    onPageChange?.(1);
                                }}
                                initialValue={dateFrom && dateTo ? { startDate: dateFrom, endDate: dateTo } : undefined}
                                className="w-full sm:w-[240px]"
                            />
                        </div>
                        
                        <SubscriptionActionButtons
                            isExpired={isExpired}
                            hasReachedLimit={hasReachedAppointmentLimit}
                            limitType="appointment"
                            showUpgradeModal={showUpgradeModal}
                            openUpgradeModal={openUpgradeModal}
                            closeUpgradeModal={closeUpgradeModal}
                            upgradeLabel="Upgrade Plan"
                            icon={UserPlus}
                            isEmployee={isEmployee}
                            className="flex-1 sm:flex-none h-11 sm:h-12 rounded-xl"
                        >
                            {!isEmployee && (
                                <Button
                                    variant="outline"
                                    className="flex w-full sm:w-auto h-11 sm:h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-accent text-accent hover:bg-accent/10 bg-white sm:px-6 transition-all font-bold shadow-sm"
                                    onClick={() => router.push(routes.privateroute.APPOINTMENTCREATE)}
                                >
                                    <Plus className="h-5 w-5 shrink-0" />
                                    <span className="sm:inline font-bold">Schedule Appointment</span>
                                </Button>
                            )}
                        </SubscriptionActionButtons>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                    <DataTable
                        data={appointments}
                        columns={columns}
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
                                dispatch(setAssistantMessage(`Hi, I've reached my appointment limit. Please help me upgrade my plan.`));
                                dispatch(setAssistantOpen(true));
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
