import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Employee } from "@/store/api/employeeApi";
import { User, Mail, Phone, Building, Briefcase, Calendar, Clock } from "lucide-react";
import { StatusBadge } from "@/components/common/statusBadge";
import { formatName } from "@/utils/helpers";

const formatDate = (value: string | null | undefined, formatStr: string, fallback: string = "N/A"): string => {
    if (!value) return fallback;
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, formatStr);
};

const employee_details_config = [
    { key: "_id", label: "Employee ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Position" },
    { key: "status", label: "Status" },
    {
        key: "createdAt",
        label: "Created At",
        format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm"),
    },
    {
        key: "updatedAt",
        label: "Updated At",
        format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm"),
    },
];

interface EmployeeDetailsDialogProps {
    employee: Employee | null;
    mode: "active";
    open: boolean;
    on_close: () => void;
}

export function EmployeeDetailsDialog({ employee, mode, open, on_close }: EmployeeDetailsDialogProps) {
    if (!employee) return null;

    const renderFieldValue = (key: string, value: any, formatFn?: (val: string) => string) => {
        if (key === "status") {
            return <StatusBadge status={value} />;
        }

        if (formatFn && value) {
            return formatFn(value);
        }

        return value || "N/A";
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    on_close();
                }
            }}
        >
            <DialogContent className="max-w-4xl bg-white dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle>Employee Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
                    {/* Profile Header - LinkedIn/Facebook Style */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b pb-6">
                        {/* Left Side - Employee Photo/Avatar */}
                        <div className="shrink-0">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                <AvatarFallback className="text-xl sm:text-2xl">{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Right Side - Employee Info & Status */}
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold">{formatName(employee.name)}</h3>
                                <div className="mt-2 flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="text-muted-foreground h-3.5 w-3.5" />
                                        <span className="text-muted-foreground text-xs sm:text-sm">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-muted-foreground h-3.5 w-3.5" />
                                        <span className="text-muted-foreground text-xs sm:text-sm">{employee.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center sm:justify-start">
                                {renderFieldValue("status", employee.status)}
                            </div>
                        </div>
                    </div>

                    {/* Employee Details - Bottom Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {employee_details_config.map(({ key, label, format: formatFn }) => {
                            if (key === "name" || key === "email" || key === "phone" || key === "status") return null;

                            const value = employee[key as keyof Employee];
                            let icon = null;
                            if (key === "_id") icon = <User className="h-4 w-4" />;
                            else if (key === "department") icon = <Building className="h-4 w-4" />;
                            else if (key === "designation") icon = <Briefcase className="h-4 w-4" />;
                            else if (key === "createdAt") icon = <Calendar className="h-4 w-4" />;
                            else if (key === "updatedAt") icon = <Clock className="h-4 w-4" />;

                            return (
                                <div key={key} className="space-y-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                        {icon}
                                        {label}
                                    </div>
                                    <div className="text-foreground text-sm font-semibold break-all">
                                        {key === "_id" ? (
                                            <span className="font-mono text-xs break-all">{value}</span>
                                        ) : (
                                            key === "department" || key === "designation" ? formatName(renderFieldValue(key, value, formatFn)) : renderFieldValue(key, value, formatFn)
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end border-t pt-4">
                        <Button type="button" onClick={on_close} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
