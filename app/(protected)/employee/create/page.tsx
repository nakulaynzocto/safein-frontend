"use client";

import { NewEmployeeModal } from "@/components/employee/EmployeeForm";
import { UserPlus } from "lucide-react";

// Page: Employeecreat (non-modal page version)
export default function Employeecreat() {
    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-3">
                <h1 className="text-foreground text-lg leading-tight font-semibold">Add New Employee</h1>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    Fill in the employee details to add them to the system
                </p>
            </div>
            <div className="w-full">
                <NewEmployeeModal layout="page" />
            </div>
        </div>
    );
}
