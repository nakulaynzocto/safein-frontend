"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    useGetVisitorQuery, 
    useUpdateVisitorMutation, 
    useDeleteVisitorMutation,
    useCheckVisitorHasAppointmentsQuery
} from "@/store/api/visitorApi";
import { 
    ArrowLeft, 
    Mail, 
    Phone, 
    ShieldCheck, 
    MapPin, 
    User, 
    Edit, 
    Trash2, 
    Clock,
    AlertCircle,
    UserMinus,
    UserCheck,
    Calendar,
    Clipboard,
    FileText,
    CheckCircle2,
    XCircle,
    Smartphone,
    CreditCard
} from "lucide-react";
import { formatName, getInitials, formatDate } from "@/utils/helpers";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { routes } from "@/utils/routes";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { Textarea } from "@/components/ui/textarea";

export default function VisitorSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const visitorId = params.id as string;

    const { data: visitor, isLoading, isError, refetch } = useGetVisitorQuery(visitorId);
    const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
    const [deleteVisitor, { isLoading: isDeleting }] = useDeleteVisitorMutation();
    const { data: appointmentCheck } = useCheckVisitorHasAppointmentsQuery(visitorId);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [blacklistReason, setBlacklistReason] = useState("");

    useEffect(() => {
        if (visitor?.blacklistReason) {
            setBlacklistReason(visitor.blacklistReason);
        }
    }, [visitor]);

    if (isLoading) {
        return <SettingsSkeleton />;
    }

    if (isError || !visitor) {
        return (
            <div className="p-8 text-center text-foreground">
                <h2 className="text-xl font-bold">Visitor not found</h2>
                <Button onClick={() => router.push(routes.privateroute.VISITORLIST)} className="mt-4">
                    Back to List
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        try {
            await deleteVisitor(visitor._id).unwrap();
            showSuccessToast("Visitor deleted successfully");
            router.push(routes.privateroute.VISITORLIST);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to delete visitor");
        }
    };

    const handleToggleBlacklist = async () => {
        try {
            const isBlocking = !visitor.blacklisted;
            await updateVisitor({
                id: visitor._id,
                blacklisted: isBlocking,
                blacklistReason: isBlocking ? blacklistReason : "",
            }).unwrap();
            
            showSuccessToast(`Visitor ${isBlocking ? "blocked" : "unblocked"} successfully!`);
            setShowStatusDialog(false);
            if (!isBlocking) setBlacklistReason("");
            refetch();
        } catch (error: any) {
            showErrorToast(error?.data?.message || `Failed to update status`);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-foreground">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-xl bg-background hover:bg-accent/50"
                        onClick={() => router.push(routes.privateroute.VISITORLIST)}
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div>
                        <h1 className="text-foreground text-lg leading-tight font-semibold">Visitor Management</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                            Control and monitor visitor profile for {visitor.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <Card className="overflow-hidden border-none bg-background/60 backdrop-blur-md shadow-sm ring-1 ring-border/50 text-foreground">
                        <div className="h-32 bg-gradient-to-br from-[#074463]/10 via-[#3882a5]/[0.05] to-transparent relative text-foreground">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] text-foreground" />
                        </div>
                        <CardContent className="relative pt-0 text-foreground">
                            <div className="absolute -top-12 left-6 text-foreground">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl text-foreground">
                                    <AvatarImage src={visitor.photo} alt={visitor.name} />
                                    <AvatarFallback className="text-2xl bg-[#074463]/10 text-[#074463] text-foreground">
                                        {getInitials(visitor.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="pt-16 pb-4 text-foreground">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-foreground">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                            {formatName(visitor.name)}
                                            {visitor.blacklisted && (
                                                <Badge variant="destructive" className="rounded-full px-3">Blacklisted</Badge>
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1 text-foreground">
                                            <Badge variant="secondary" className="bg-[#3882a5]/5 text-[#3882a5] hover:bg-[#3882a5]/10 border-[#3882a5]/20 gap-1.5 py-1 px-3 rounded-full text-foreground">
                                                <Clipboard className="h-3.5 w-3.5" />
                                                <span className="font-bold">{appointmentCheck?.count || 0}</span>
                                                <span className="text-[10px] opacity-70 border-l pl-1.5 ml-0.5">Total Visits</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-1 text-sm bg-muted/50 p-3 rounded-xl border border-border/50 text-foreground">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">{visitor.phone}</span>
                                        </div>
                                        {visitor.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{visitor.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visitor Details Card */}
                    <Card className="border-none bg-background/50 backdrop-blur-sm shadow-sm ring-1 ring-border text-foreground">
                        <CardHeader>
                            <CardTitle>Visitor Details</CardTitle>
                            <CardDescription>Comprehensive identification and location information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Personal</p>
                                            <div className="space-y-1 mt-1">
                                                <p className="text-sm font-bold capitalize">{visitor.gender || "N/A"}</p>
                                                <p className="text-[11px] text-muted-foreground">Gender Identity</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location</p>
                                            <div className="space-y-1 mt-1">
                                                <p className="text-sm font-bold">
                                                    {[visitor.address?.city, visitor.address?.state, visitor.address?.country].filter(Boolean).join(", ")}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">{visitor.address?.street || "No street address provided"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Identification</p>
                                            <div className="space-y-1 mt-1">
                                                <p className="text-sm font-bold uppercase">{visitor.idProof?.type?.replace("_", " ") || "N/A"}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono">{visitor.idProof?.number || "No ID number on file"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {visitor.photo && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Documents</p>
                                                <div className="mt-1">
                                                    <button 
                                                        onClick={() => window.open(visitor.photo, "_blank")}
                                                        className="text-xs font-bold text-[#3882a5] hover:underline flex items-center gap-1"
                                                    >
                                                        View Profile Photo <ArrowLeft className="h-3 w-3 rotate-180" />
                                                    </button>
                                                    {visitor.idProof?.image && (
                                                        <button 
                                                            onClick={() => window.open(visitor.idProof?.image, "_blank")}
                                                            className="text-xs font-bold text-[#3882a5] hover:underline flex items-center gap-1 mt-1"
                                                        >
                                                            View ID Document <ArrowLeft className="h-3 w-3 rotate-180" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Blacklist Warning */}
                    {visitor.blacklisted && (
                        <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800 rounded-xl">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm font-bold uppercase tracking-wider">Access Restricted</AlertTitle>
                            <AlertDescription className="text-xs mt-1">
                                This visitor has been blacklisted. Reason: <strong>{visitor.blacklistReason || "No reason specified"}</strong>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-none bg-background/50 backdrop-blur-sm shadow-sm ring-1 ring-border text-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                            <CardDescription>Manage visitor status</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button 
                                variant="outline" 
                                className="justify-start h-12 rounded-xl group"
                                onClick={() => router.push(routes.privateroute.VISITOREDIT.replace("[id]", visitor._id))}
                            >
                                <Edit className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                Update Profile
                            </Button>

                            {visitor.blacklisted ? (
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-12 rounded-xl group border-green-200/50 bg-green-50/50 hover:bg-green-100/50 hover:border-green-300 text-green-700 transition-all"
                                    onClick={() => setShowStatusDialog(true)}
                                >
                                    <UserCheck className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                                    Unblock Visitor
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-12 rounded-xl group border-orange-200/50 bg-orange-50/50 hover:bg-orange-100/50 hover:border-orange-300 text-orange-700 transition-all"
                                    onClick={() => setShowStatusDialog(true)}
                                >
                                    <UserMinus className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                                    Block Visitor
                                </Button>
                            )}
                            
                            <div className="pt-2">
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200/50"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={appointmentCheck?.hasAppointments}
                                >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    {appointmentCheck?.hasAppointments ? 'Deletion Restricted' : 'Delete Record'}
                                </Button>
                                {appointmentCheck?.hasAppointments && (
                                    <p className="text-[10px] text-muted-foreground mt-2 px-1 italic">
                                        * Cannot delete visitors with active appointment history.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata Card */}
                    <Card className="border-none bg-muted/30 shadow-none ring-1 ring-border/50 text-foreground">
                        <CardContent className="pt-6 space-y-4 text-foreground">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Registered On</p>
                                    <p className="font-medium">{formatDate(visitor.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-0.5 text-foreground">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Last Profile Update</p>
                                    <p className="font-medium">{formatDate(visitor.updatedAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <ConfirmationDialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
                title={visitor.blacklisted ? "Unblock Visitor" : "Block Visitor"}
                description={
                    visitor.blacklisted 
                        ? `Are you sure you want to unblock ${visitor.name}? They will be able to book appointments again.`
                        : `Are you sure you want to block ${visitor.name}? They will not be able to book any further appointments.`
                }
                onConfirm={handleToggleBlacklist}
                confirmText={isUpdating ? "Processing..." : visitor.blacklisted ? "Unblock Now" : "Confirm Block"}
                variant={visitor.blacklisted ? "default" : "destructive"}
            >
                {!visitor.blacklisted && (
                    <div className="space-y-3 mt-4">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Reason for Blocking</p>
                         <Textarea 
                            placeholder="Enter reason for blocking..."
                            value={blacklistReason}
                            onChange={(e) => setBlacklistReason(e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl min-h-[100px]"
                         />
                    </div>
                )}
            </ConfirmationDialog>

            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Visitor Record"
                description={`Are you sure you want to permanentely delete ${visitor.name}? All personal data will be erased and this action cannot be undone.`}
                onConfirm={handleDelete}
                confirmText={isDeleting ? "Deleting..." : "Delete Permanently"}
                variant="destructive"
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
                        <Skeleton className="h-32 w-full" />
                        <div className="p-6 pt-16 relative">
                            <Skeleton className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-background" />
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-full max-w-md" />
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
                        </div>
                    </div>
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
