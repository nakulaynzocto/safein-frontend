import { useCallback } from "react";
import { useLazyGetEmployeesQuery, type Employee } from "@/store/api/employeeApi";
import type { Option } from "@/components/common/asyncSelectField";

/**
 * Common hook for employee search in async dropdowns
 * Returns a function to load employee options with server-side search
 */
export function useEmployeeSearch() {
    const [triggerGetEmployees] = useLazyGetEmployeesQuery();

    const loadEmployeeOptions = useCallback(
        async (inputValue: string): Promise<Option[]> => {
            try {
                const result = await triggerGetEmployees({
                    search: inputValue,
                    limit: 50,
                    status: "Active" as const,
                }).unwrap();

                return (
                    result.employees
                        ?.filter((emp: Employee) => !emp.isDeleted && emp.status === "Active")
                        .map((emp: Employee) => ({
                            value: emp._id,
                            label: `${emp.name} (${emp.email})`,
                            image: emp.photo,
                        })) || []
                );
            } catch (error) {
                console.error("Failed to load employees:", error);
                return [];
            }
        },
        [triggerGetEmployees]
    );

    return { loadEmployeeOptions };
}
