"use client";

import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { AsyncSelectField } from "@/components/common/asyncSelectField";
import { useEmployeeSearch } from "@/hooks/useEmployeeSearch";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { Briefcase } from "lucide-react";

interface EmployeeSelectionFieldProps {
    name?: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    hideForEmployees?: boolean;
}

/**
 * Common component for selecting an employee to meet.
 * Automatically handles different behavior for Admin vs Employee users.
 * - For Admins: Shows a searchable AsyncSelectField.
 * - For Employees: Hides the field but ensures the employeeId is set in the form.
 */
export function EmployeeSelectionField({
    name = "employeeId",
    label = "Meeting With",
    required = true,
    placeholder = "Search employees...",
    hideForEmployees = true,
}: EmployeeSelectionFieldProps) {
    const { control, setValue, watch } = useFormContext();
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    const currentEmployeeId = user?.employeeId || null;
    const { loadEmployeeOptions } = useEmployeeSearch();

    const selectedValue = watch(name);

    // Sync employeeId for employees
    useEffect(() => {
        if (isEmployee && currentEmployeeId) {
            if (selectedValue !== currentEmployeeId) {
                setValue(name, currentEmployeeId, {
                    shouldValidate: true,
                    shouldDirty: true
                });
            }
        }
    }, [isEmployee, currentEmployeeId, name, setValue, selectedValue]);

    if (isEmployee && hideForEmployees) {
        return (
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <input type="hidden" {...field} value={currentEmployeeId || ""} />
                )}
            />
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState: { error } }) => (
                    <div className="space-y-1">
                        <AsyncSelectField
                            value={field.value || ""}
                            onChange={field.onChange}
                            loadOptions={loadEmployeeOptions}
                            placeholder={placeholder}
                            isClearable={false}
                            error={error?.message}
                            cacheOptions={true}
                            defaultOptions={true}
                        />
                    </div>
                )}
            />
        </div>
    );
}
