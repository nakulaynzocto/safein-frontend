"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/dataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime } from "@/utils/helpers";
import { Calendar, Phone, Mail, Building, Maximize2 } from "lucide-react";

interface AppointmentsTableProps {
    title: string;
    description: string;
    data: any[];
    isLoading: boolean;
    showDateTime?: boolean;
    emptyData: {
        title: string;
        description: string;
        primaryActionLabel: string;
    };
    onPrimaryAction: () => void;
}

/**
 * AppointmentsTable component displays appointments in a table format
 * Optimized with React.memo and useMemo for column definitions
 */
export const AppointmentsTable = memo(function AppointmentsTable({
    title,
    description,
    data,
    isLoading,
    showDateTime = false,
    emptyData,
    onPrimaryAction,
}: AppointmentsTableProps) {
    const columns = useMemo(
        () => [
            {
                key: "visitorName",
                header: "Visitor",
                sortable: false,
                render: (appointment: any) => {
                    const visitor = appointment.visitorId || appointment.visitor;
                    const visitorName = visitor?.name || "Unknown Visitor";
                    const visitorPhone = visitor?.phone || "N/A";
                    const visitorCompany = visitor?.company || "";

                    return (
                        <div className="flex items-center gap-3">
                            <div className="group relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={visitor?.photo} alt={visitorName} />
                                    <AvatarFallback>
                                        {visitorName
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                {visitor?.photo && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(visitor.photo, "_blank");
                                        }}
                                        className="absolute -right-1 -bottom-1 rounded-full bg-[#3882a5] p-1 text-white opacity-0 shadow-md transition-colors group-hover:opacity-100 hover:bg-[#2d6a87]"
                                        title="View full image"
                                    >
                                        <Maximize2 className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-medium">{visitorName}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    {visitorPhone}
                                </div>
                                {visitorCompany && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Building className="h-3 w-3" />
                                        {visitorCompany}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "employeeName",
                header: "Meeting With",
                sortable: false,
                render: (appointment: any) => {
                    const employee = appointment.employeeId || appointment.employee;
                    const employeeName = employee?.name || "Unknown Employee";
                    const employeeEmail = employee?.email || "N/A";
                    const employeeDepartment = employee?.department || "";

                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {employeeName
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-sm font-medium">{employeeName}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    {employeeEmail}
                                </div>
                                {employeeDepartment && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Building className="h-3 w-3" />
                                        {employeeDepartment}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            ...(showDateTime
                ? [
                      {
                          key: "appointmentDate",
                          header: "Date & Time",
                          sortable: false,
                          render: (appointment: any) => (
                              <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateTime(
                                      appointment.appointmentDetails?.scheduledDate,
                                      appointment.appointmentDetails?.scheduledTime,
                                  )}
                              </div>
                          ),
                      },
                  ]
                : [
                      {
                          key: "appointmentTime",
                          header: "Time",
                          sortable: false,
                          render: (appointment: any) => (
                              <div className="text-sm">{appointment.appointmentDetails?.scheduledTime || "N/A"}</div>
                          ),
                      },
                  ]),
        ],
        [showDateTime],
    );

    return (
        <Card className="card-hostinger p-2 sm:p-4">
            <CardHeader className="p-2 pb-2 sm:p-4 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-medium sm:text-lg">
                    <Calendar className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="truncate">{title}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="-mx-2 overflow-x-auto sm:mx-0">
                    <div className="min-w-[500px] sm:min-w-0">
                        <DataTable
                            data={data}
                            columns={columns}
                            isLoading={isLoading}
                            emptyMessage={`No ${title.toLowerCase()}`}
                            showCard={false}
                            enableSorting={false}
                            emptyData={emptyData}
                            onPrimaryAction={onPrimaryAction}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
