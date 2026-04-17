"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    useGetEmployeeQuery, 
    useUpdateEmployeeMutation, 
    useDeleteEmployeeMutation 
} from "@/store/api/employeeApi";
import { 
    ArrowLeft, 
    Mail, 
    MessageSquare, 
    Phone, 
    PhoneCall, 
    Bell, 
    ShieldCheck, 
    Building, 
    User, 
    Edit, 
    Trash2, 
    Clock,
    AlertCircle,
    UserMinus,
    UserCheck,
    Eye,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clipboard
} from "lucide-react";
import { formatName, getInitials } from "@/utils/helpers";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { routes } from "@/utils/routes";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { EmployeeDetailsDialog } from "@/components/employee/employeeDetailsDialog";
import { EmployeeVerificationModal } from "@/components/employee/EmployeeVerificationModal";

export default function EmployeeSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const employeeId = params.id as string;

    const { data: employee, isLoading, isError, refetch } = useGetEmployeeQuery(employeeId);
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

    const [settings, setSettings] = useState({
        email: true,
        whatsapp: true,
        sms: true,
        call: true,
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);
    const [verifyType, setVerifyType] = useState<'email' | 'phone'>('email');
    const [showViewDialog, setShowViewDialog] = useState(false);

    useEffect(() => {
        if (employee?.notificationSettings) {
            setSettings({
                email: employee.notificationSettings.email ?? true,
                whatsapp: employee.notificationSettings.whatsapp ?? true,
                sms: employee.notificationSettings.sms ?? true,
                call: employee.notificationSettings.call ?? true,
            });
        }
    }, [employee]);

    if (isLoading) {
        return <SettingsSkeleton />;
    }

    if (isError || !employee) {
        return (
            <div className="p-8 text-center text-foreground">
                <h2 className="text-xl font-bold">Employee not found</h2>
                <Button onClick={() => router.push(routes.privateroute.EMPLOYEELIST)} className="mt-4">
                    Back to List
                </Button>
            </div>
        );
    }

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateEmployee({
                id: employee._id,
                notificationSettings: settings,
            }).unwrap();
            showSuccessToast("Notification settings updated");
            refetch();
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to update settings");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteEmployee(employee._id).unwrap();
            showSuccessToast("Employee deleted successfully");
            router.push(routes.privateroute.EMPLOYEELIST);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to delete employee");
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = employee.status === "Active" ? "Inactive" : "Active";
        try {
            await updateEmployee({
                id: employee._id,
                status: newStatus,
            }).unwrap();
            showSuccessToast(`Employee marked as ${newStatus}`);
            setShowStatusDialog(false);
        } catch (error: any) {
            showErrorToast(error?.data?.message || `Failed to update status to ${newStatus}`);
        }
    };

    const notificationOptions = [
        {
            id: "email",
            label: "Email Notifications",
            description: "Receive visitor arrival alerts via email",
            icon: <Mail className="h-5 w-5 text-primary" />,
            enabled: settings.email,
        },
        {
            id: "whatsapp",
            label: "WhatsApp Alerts",
            description: "Real-time updates delivered to your WhatsApp",
            icon: <MessageSquare className="h-5 w-5 text-primary" />,
            enabled: settings.whatsapp,
        },
        {
            id: "sms",
            label: "SMS Notifications",
            description: "Traditional text messages for instant alerts",
            icon: <Phone className="h-5 w-5 text-primary" />,
            enabled: settings.sms,
        },
        {
            id: "call",
            label: "Voice Call Notification",
            description: "Automated call when a visitor arrives",
            icon: <PhoneCall className="h-5 w-5 text-primary" />,
            enabled: settings.call,
        },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-foreground">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-xl bg-background hover:bg-accent/50"
                        onClick={() => router.push(routes.privateroute.EMPLOYEELIST)}
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div>
                        <h1 className="text-foreground text-lg leading-tight font-semibold">Employee Settings</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                            Manage notifications and account actions for {employee.name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleSaveSettings} 
                        disabled={isUpdating} 
                        className="rounded-xl px-6 h-11 bg-primary/90 text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] font-medium"
                    >
                        {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Save Preferences
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Notifications */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <Card className="overflow-hidden border-none bg-background/60 backdrop-blur-md shadow-sm ring-1 ring-border/50 text-foreground">
                        <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent relative text-foreground">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] text-foreground" />
                        </div>
                        <CardContent className="relative pt-0 text-foreground">
                            <div className="absolute -top-12 left-6 text-foreground">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl text-foreground">
                                    <AvatarImage src={employee.photo} alt={employee.name} />
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary text-foreground">
                                        {getInitials(employee.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="pt-16 pb-4 text-foreground">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-foreground">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                            {formatName(employee.name)}
                                            {employee.isVerified && (
                                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1 text-foreground">
                                            <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/20 gap-1.5 py-1 px-3 rounded-full text-foreground">
                                                <Clipboard className="h-3.5 w-3.5" />
                                                <span className="font-bold">{employee.appointmentCount || 0}</span>
                                                <span className="text-[10px] opacity-70 border-l pl-1.5 ml-0.5">Appointments</span>
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5" />
                                                {formatName(employee.department)}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-foreground">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {formatName(employee.designation || "Employee")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-1 text-sm bg-muted/50 p-3 rounded-xl border border-border/50 text-foreground">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${employee.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                            <span className="font-bold uppercase tracking-wider text-[10px]">{employee.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">{employee.phone}</span>
                                            {employee.isPhoneVerified ? (
                                                <ShieldCheck className="h-3 w-3 text-green-500 ml-1" />
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setVerifyType('phone');
                                                        setShowVerifyDialog(true);
                                                    }}
                                                    className="text-[10px] text-blue-500 hover:underline ml-1 font-bold"
                                                >
                                                    Verify Now
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{employee.email}</span>
                                            {employee.isEmailVerified ? (
                                                <ShieldCheck className="h-3 w-3 text-green-500 ml-1" />
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setVerifyType('email');
                                                        setShowVerifyDialog(true);
                                                    }}
                                                    className="text-[10px] text-blue-500 hover:underline ml-1 font-bold"
                                                >
                                                    Verify Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card className="border-none bg-background/50 backdrop-blur-sm shadow-sm ring-1 ring-border text-foreground">
                        <CardHeader className="text-foreground">
                            <div className="flex items-center gap-2 text-foreground">
                                <Bell className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle>Notification Channels</CardTitle>
                                    <CardDescription>Configure how this employee receives visitor alerts</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 text-foreground">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-foreground">
                                {notificationOptions.map((option) => (
                                    <div 
                                        key={option.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                            option.enabled 
                                                ? "bg-primary/[0.03] border-primary/20" 
                                                : "bg-muted/20 border-transparent shadow-inner"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${option.enabled ? "bg-background shadow-sm" : "bg-muted/50"}`}>
                                                {option.icon}
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label htmlFor={option.id} className="font-semibold cursor-pointer">
                                                    {option.label}
                                                </Label>
                                                <p className="text-[11px] text-muted-foreground leading-tight">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch 
                                            id={option.id} 
                                            checked={option.enabled}
                                            onCheckedChange={() => handleToggle(option.id as any)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deletion Warning if applicable */}
                    {employee.canDelete === false && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-xl">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm font-bold">Cannot delete employee</AlertTitle>
                            <AlertDescription className="text-xs">
                                {employee.appointmentCount} appointment(s) are linked to this employee. Because of this linked data, you cannot delete this record. 
                                <span className="font-bold block mt-1 underline">You can only change the employee status to 'Inactive' instead of deleting.</span>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-none bg-background/50 backdrop-blur-sm shadow-sm ring-1 ring-border text-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                            <CardDescription>Manage employee record</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {employee.status === "Active" ? (
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-12 rounded-xl group border-amber-200/50 bg-amber-50/50 hover:bg-amber-100/50 hover:border-amber-300 text-amber-700 transition-all"
                                    onClick={() => setShowStatusDialog(true)}
                                >
                                    <UserMinus className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                                    Mark as Inactive
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-12 rounded-xl group border-green-200/50 bg-green-50/50 hover:bg-green-100/50 hover:border-green-300 text-green-700 transition-all"
                                    onClick={() => setShowStatusDialog(true)}
                                >
                                    <UserCheck className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                                    Mark as Active
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                className="justify-start h-12 rounded-xl group"
                                onClick={() => router.push(routes.privateroute.EMPLOYEEEDIT.replace("[id]", employee._id))}
                            >
                                <Edit className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                Edit Basic Info
                            </Button>
                            <div className="pt-2">
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200/50"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={employee.canDelete === false}
                                >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    {employee.canDelete === false ? 'Delete Restricted' : 'Delete Employee'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata Card */}
                    <Card className="border-none bg-muted/30 shadow-none ring-1 ring-border/50 text-foreground">
                        <CardContent className="pt-6 space-y-4 text-foreground">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Created</p>
                                    <p className="font-medium">{new Date(employee.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-0.5 text-foreground">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Last Activity</p>
                                    <p className="font-medium">{new Date(employee.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-0.5 text-foreground">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Verified Status</p>
                                    <p className={`font-bold ${employee.isVerified ? "text-green-600" : "text-amber-600"}`}>
                                        {employee.isVerified ? "Authenticated" : "Pending Verification"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <EmployeeDetailsDialog 
                employee={employee}
                mode="active"
                open={showViewDialog}
                on_close={() => setShowViewDialog(false)}
            />

            <ConfirmationDialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
                title={employee.status === "Active" ? "Deactivate Employee" : "Activate Employee"}
                description={
                    employee.status === "Active" 
                    ? `Are you sure you want to deactivate ${employee.name}? They will no longer be able to receive notifications or be selected for appointments.`
                    : `Are you sure you want to reactivate ${employee.name}?`
                }
                onConfirm={handleToggleStatus}
                confirmText={employee.status === "Active" ? "Yes, Deactivate" : "Yes, Activate"}
                variant={employee.status === "Active" ? "destructive" : "default"}
            />

            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Employee"
                description={`Are you sure you want to permanentely delete ${employee.name}? This action cannot be undone.`}
                onConfirm={handleDelete}
                confirmText={isDeleting ? "Deleting..." : "Delete Permanently"}
                variant="destructive"
            />

            <EmployeeVerificationModal
                open={showVerifyDialog}
                onOpenChange={setShowVerifyDialog}
                employeeId={employee._id}
                employeeName={employee.name}
                email={employee.email}
                phone={employee.phone}
                type={verifyType}
                onSuccess={() => {
                    refetch();
                    showSuccessToast(`${verifyType === 'phone' ? 'Mobile' : 'Email'} verification successful`);
                }}
            />
        </div>
    );
}

function SettingsSkeleton() {
    return (
        <div className="w-full space-y-6 animate-pulse p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Skeleton className="h-11 w-40 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
                        <Skeleton className="h-32 w-full" />
                        <div className="p-6 pt-16 relative">
                            <Skeleton className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-background" />
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full max-w-md" />
                                    <Skeleton className="h-4 w-full max-w-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-background/50 p-6">
                        <Skeleton className="h-6 w-48 mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-background/50 p-6">
                        <Skeleton className="h-6 w-32 mb-6" />
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
