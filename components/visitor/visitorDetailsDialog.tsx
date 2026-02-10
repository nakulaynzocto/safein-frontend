import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate, formatDateTime, formatName } from "@/utils/helpers";
import { Visitor } from "@/store/api/visitorApi";
import {
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    Building,
    ExternalLink,
    Maximize2,
    ShieldAlert,
    ShieldCheck,
    Tag,
    Users,
} from "lucide-react";

const visitor_details_config = [
    { key: "name", label: "Full Name", icon: User },
    { key: "email", label: "Email", icon: Mail },
    { key: "phone", label: "Phone", icon: Phone },
    {
        key: "createdAt",
        label: "Registered On",
        icon: Calendar,
        format: (value: string) => {
            if (!value) return "N/A";
            const date = new Date(value);
            return isNaN(date.getTime()) ? "Invalid Date" : formatDateTime(date);
        },
    },
];

interface VisitorDetailsDialogProps {
    visitor: Visitor | null;
    open: boolean;
    onClose: () => void;
}

export function VisitorDetailsDialog({ visitor, open, onClose }: VisitorDetailsDialogProps) {
    if (!visitor) return null;

    const getFieldValue = (key: string): string => {
        const value = visitor[key as keyof Visitor];
        if (typeof value === "string") return value;
        if (typeof value === "boolean") return value.toString();
        return "N/A";
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-4xl bg-white dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle>Visitor Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
                    {/* Profile Header - LinkedIn/Facebook Style */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b pb-6">
                        {/* Left Side - Visitor Photo */}
                        <div className="group relative shrink-0">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                <AvatarImage src={visitor.photo} alt={visitor.name} />
                                <AvatarFallback className="text-xl sm:text-2xl">
                                    {visitor.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {visitor.photo && (
                                <button
                                    onClick={() => window.open(visitor.photo, "_blank")}
                                    className="absolute right-0 bottom-0 rounded-full bg-[#3882a5] p-1.5 text-white opacity-0 shadow-lg transition-colors group-hover:opacity-100 hover:bg-[#2d6a87]"
                                    title="View full image"
                                >
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Right Side - Visitor Info */}
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold">{formatName(visitor.name)}</h3>
                                {visitor._id && (
                                    <p className="text-muted-foreground mt-1 font-mono text-[10px] sm:text-xs break-all">ID: {visitor._id}</p>
                                )}
                                <div className="mt-2 flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-1 sm:gap-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="text-muted-foreground h-3.5 w-3.5" />
                                        <span className="text-muted-foreground text-xs sm:text-sm break-all">{visitor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-muted-foreground h-3.5 w-3.5" />
                                        <span className="text-muted-foreground text-xs sm:text-sm break-all">{visitor.phone}</span>
                                    </div>
                                    {visitor.gender && (
                                        <Badge variant="secondary" className="h-5 text-[9px] sm:text-[10px] capitalize">
                                            {visitor.gender}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blacklist Alert */}
                    {visitor.blacklisted && (
                        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertDescription className="flex flex-col gap-1">
                                <span className="font-bold">Blacklisted Visitor</span>
                                <span className="text-xs">{visitor.blacklistReason || "No reason provided"}</span>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Visitor Details - Bottom Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Registered On */}
                        <div className="space-y-1">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Registered On
                            </div>
                            <div className="text-foreground text-sm font-semibold">
                                {visitor.createdAt ? formatDateTime(visitor.createdAt) : "N/A"}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                <MapPin className="h-4 w-4" />
                                Address
                            </div>
                            <div className="text-foreground text-sm font-semibold">
                                <div>{visitor.address.street || "N/A"}</div>
                                <div>
                                    {visitor.address.city}, {visitor.address.state}
                                </div>
                                <div>{visitor.address.country}</div>
                            </div>
                        </div>

                        {/* ID Proof Type */}
                        {visitor.idProof?.type && (
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="h-4 w-4" />
                                    ID Proof Type
                                </div>
                                <div className="text-foreground text-sm font-semibold">
                                    <Badge variant="outline" className="text-sm">
                                        {visitor.idProof.type.replace("_", " ").toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* ID Proof Number */}
                        {(visitor.idProof?.number || visitor.idProof?.image) && (
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="h-4 w-4" />
                                    ID Proof Number
                                </div>
                                <div className="text-foreground text-sm font-semibold">
                                    {visitor.idProof.image ? (
                                        <button
                                            onClick={() => window.open(visitor?.idProof?.image, "_blank")}
                                            className="flex cursor-pointer items-center gap-2 font-mono text-[#3882a5] hover:text-[#2d6a87] hover:underline"
                                        >
                                            <span>{visitor.idProof.number || "N/A"}</span>
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <span className="font-mono">{visitor.idProof.number || "N/A"}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Emergency Contact */}
                        {visitor.emergencyContacts && visitor.emergencyContacts.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                    <Users className="h-4 w-4" />
                                    Emergency Contact
                                </div>
                                <div className="text-foreground text-sm font-semibold">
                                    {formatName(visitor.emergencyContacts[0].name)} ({visitor.emergencyContacts[0].phone || "No phone"})
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {visitor.tags && visitor.tags.length > 0 && (
                            <div className="space-y-1 md:col-span-2">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                    <Tag className="h-4 w-4" />
                                    Tags
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                    {visitor.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="bg-muted/30 text-[10px]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end border-t pt-4">
                        <Button type="button" onClick={onClose} variant="outline" size="xl" className="px-8">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
