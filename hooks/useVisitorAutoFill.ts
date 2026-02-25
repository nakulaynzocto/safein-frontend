"use client";

import { useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useVisitorExistenceCheck } from "@/hooks/useVisitorExistenceCheck";
import { showSuccessToast } from "@/utils/toast";

interface UseVisitorAutoFillOptions {
    emailFieldName?: string;
    phoneFieldName?: string;
    nameFieldName?: string;
    methods?: any;
}

/**
 * Hook to automatically check if a visitor exists buy email/phone and auto-fill the form.
 */
export function useVisitorAutoFill({
    emailFieldName = "email",
    phoneFieldName = "phone",
    nameFieldName = "name",
    methods: providedMethods
}: UseVisitorAutoFillOptions = {}) {
    const contextMethods = useFormContext();
    const methods = providedMethods || contextMethods;

    if (!methods) {
        throw new Error("useVisitorAutoFill must be used within a FormProvider or provided with methods");
    }

    const { watch, getValues, reset } = methods;

    // Watch relevant fields from the form
    const watchedEmail = watch(emailFieldName);
    const watchedPhone = watch(phoneFieldName);

    // Use common hook for existence check and auto-fill data
    const { emailExists, phoneExists, foundVisitor } = useVisitorExistenceCheck(watchedEmail, watchedPhone);

    // Auto-fill logic when a visitor is found
    useEffect(() => {
        if (foundVisitor) {
            const currentValues = getValues();
            const currentName = currentValues[nameFieldName];
            const currentPhone = currentValues[phoneFieldName];
            const currentEmail = currentValues[emailFieldName];

            // Valid match found, auto-fill if name or other fields are empty
            if (!currentName || !currentPhone || !currentEmail) {
                reset({
                    ...currentValues,
                    [nameFieldName]: currentName || foundVisitor.name,
                    [phoneFieldName]: currentPhone || foundVisitor.phone,
                    [emailFieldName]: currentEmail || foundVisitor.email,
                });
                showSuccessToast("Visitor details found and auto-filled!");
            }
        }
    }, [foundVisitor, reset, getValues, emailFieldName, phoneFieldName, nameFieldName]);

    return { emailExists, phoneExists, foundVisitor };
}
