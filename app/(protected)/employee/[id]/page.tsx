"use client";

import { useParams } from "next/navigation";

import { NewEmployeeModal } from "@/components/employee/EmployeeForm";

export default function EmployeeEditPage() {
    const params = useParams();
    const employeeId = params.id as string;

    if (!employeeId) {
        return (
            <div className="container mx-auto max-w-4xl py-3 sm:py-4">
                <div className="py-8 text-center">
                    <h2 className="text-foreground text-lg font-semibold">Employee Not Found</h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">Please select an employee to edit.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-3">
                <h1 className="text-foreground text-lg leading-tight font-semibold">Edit Employee</h1>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    Update employee details and information
                </p>
            </div>
            <div className="w-full">
                <NewEmployeeModal employeeId={employeeId} layout="page" />
            </div>
        </div>
    );
}
