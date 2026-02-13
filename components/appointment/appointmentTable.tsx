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
    isAppointmentTimedOut,
} from "@/utils/helpers";
import {
    Trash2,
    Eye,
    Clock,
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
    Edit,
    Maximize2,
    Send,
} from "lucide-react";
import { Appointment, useResendAppointmentNotificationMutation } from "@/store/api/appointmentApi";
import { SearchInput } from "@/components/common/searchInput";
import DateRangePicker from "@/components/common/dateRangePicker";
import { AppointmentDetailsDialog } from "./appointmentDetailsDialog";
import { CheckOutDialog } from "./checkOutDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { routes } from "@/utils/routes";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useCooldown } from "@/hooks/useCooldown";

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
    onCheckOut?: (appointmentId: string, notes?: string) => void;
    onApprove?: (appointmentId: string) => void;
    onReject?: (appointmentId: string) => void;
    isDeleting?: boolean;
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
    onCheckOut,
    onApprove,
    onReject,
    isDeleting = false,
    isCheckingOut = false,
    isApproving = false,
    isRejecting = false,
    showHeader = true,
    title,
    onDateFromChange,
    onDateToChange,
}: AppointmentTableProps) {
    const router = useRouter();
    const { hasReachedAppointmentLimit, refetch: refetchSubscriptionStatus } = useSubscriptionStatus();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
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
                                    <AvatarImage
                                        src={visitorPhoto}
                                        alt={visitorName}
                                        onError={(e) => {
                                            // Hide image on error, fallback will show
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
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
                                    <AvatarImage
                                        src={employeePhoto}
                                        alt={employeeName}
                                        onError={(e) => {
                                            // Hide image on error, fallback will show
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
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
                            {appointment.appointmentDetails?.meetingRoom && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Building className="h-3 w-3" />
                                    {appointment.appointmentDetails.meetingRoom}
                                </div>
                            )}
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
                                <span className="text-sm text-gray-500">Processing...</span>
                            </div>
                        );
                    }

                    const effectiveStatus = getAppointmentStatus(appointment) as
                        | "pending"
                        | "approved"
                        | "rejected"
                        | "completed"
                        | "time_out";
                    return <StatusBadge status={effectiveStatus} />;
                },
            },
        ];

        baseColumns.push({
            key: "actions",
            header: "Actions",
            render: (appointment: Appointment) => {
                const status = typeof appointment.status === "string" ? appointment.status : "pending";
                const isTimedOut = isAppointmentTimedOut(appointment);
                const isPending = status === "pending" && !isTimedOut;
                const isApproved = status === "approved";
                const isRejected = status === "rejected";
                const isCompleted = status === "completed";

                const showOnlyView = isRejected || isCompleted;

                return (
                    <div className="flex justify-center">
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
                                        {onApprove && (
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedAppointment(appointment);
                                                    setShowApproveDialog(true);
                                                }}
                                                disabled={isAppointmentLoading(appointment._id)}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setShowRejectDialog(true);
                                            }}
                                            disabled={isAppointmentLoading(appointment._id)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Reject
                                        </DropdownMenuItem>
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

                                {isApproved && onCheckOut && isAppointmentDatePast(appointment) && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setShowCheckOutDialog(true);
                                            }}
                                            disabled={isAppointmentLoading(appointment._id)}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Check Out
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
            <div className="space-y-6">
                <Card className="card-hostinger p-4">
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <p className="mb-4 text-red-500">Failed to load appointments</p>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">


            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
                    <SearchInput
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        debounceDelay={500}
                        className="flex-1 min-w-[120px] sm:w-[260px] sm:flex-none"
                    />
                    <div className="flex shrink-0 items-center gap-2">
                        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
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
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                            {hasReachedAppointmentLimit ? (
                                <>
                                    <Button
                                        variant="default"
                                        className="flex h-12 min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl px-4 text-xs whitespace-nowrap sm:gap-2 sm:text-sm bg-[#3882a5] hover:bg-[#2d6a87] text-white shadow-md hover:shadow-lg transition-all"
                                        onClick={() => setShowUpgradeModal(true)}
                                    >
                                        <Plus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                        <span className="hidden sm:inline">Upgrade to Schedule More</span>
                                    </Button>
                                    <UpgradePlanModal
                                        isOpen={showUpgradeModal}
                                        onClose={() => setShowUpgradeModal(false)}
                                    />
                                </>
                            ) : (
                                <>
                                    {!isEmployee && (
                                        <Button
                                            variant="outline"
                                            className="flex h-12 min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl px-4 text-xs whitespace-nowrap sm:gap-2 sm:text-sm border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5]/10 bg-white"
                                            onClick={() => {
                                                if (hasReachedAppointmentLimit) {
                                                    setShowUpgradeModal(true);
                                                } else {
                                                    router.push(routes.privateroute.APPOINTMENTCREATE);
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                            <span className="hidden sm:inline">Schedule Appointment</span>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
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
                            } else if (hasReachedAppointmentLimit) {
                                setShowUpgradeModal(true);
                            } else {
                                router.push(routes.privateroute.APPOINTMENTCREATE);
                            }
                        }}
                        showCard={false}
                        isLoading={isLoading}
                    />
                </div>
            </div >

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center">
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
                        description={`Are you sure you want to delete appointment ${selectedAppointment?._id}? This will move the appointment to trash.`}
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
                        description={`Are you sure you want to approve appointment ${selectedAppointment?._id}? This will change the status to approved.`}
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
                description={`Are you sure you want to reject appointment ${selectedAppointment?._id}? This will change the status to rejected.`}
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
