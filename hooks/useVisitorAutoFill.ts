"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useVisitorExistenceCheck } from "@/hooks/useVisitorExistenceCheck";
import { showSuccessToast } from "@/utils/toast";

interface UseVisitorAutoFillOptions {
    phoneFieldName?: string;
    nameFieldName?: string;
    emailFieldName?: string;
    methods?: any;
    silent?: boolean;
}

/**
 * When a matching visitor is found by phone, auto-fill empty name/phone/email fields.
 */
export function useVisitorAutoFill({
    phoneFieldName = "phone",
    nameFieldName = "name",
    emailFieldName = "email",
    methods: providedMethods,
    silent = false,
}: UseVisitorAutoFillOptions = {}) {
    const contextMethods = useFormContext();
    const methods = providedMethods || contextMethods;

    if (!methods) {
        throw new Error("useVisitorAutoFill must be used within a FormProvider or provided with methods");
    }

    const { watch, getValues, reset } = methods;

    const watchedPhone = watch(phoneFieldName);

    const { phoneExists, foundVisitor } = useVisitorExistenceCheck(watchedPhone);

    useEffect(() => {
        if (!foundVisitor || !phoneExists) return;

        const currentValues = getValues();
        const currentName = currentValues[nameFieldName];
        const currentPhone = currentValues[phoneFieldName];
        const currentEmail = emailFieldName ? currentValues[emailFieldName] : "";
        const emailEmpty = !currentEmail || String(currentEmail).trim() === "";

        const next: Record<string, unknown> = { ...currentValues };
        let changed = false;

        if (!currentName && foundVisitor.name) {
            next[nameFieldName] = foundVisitor.name;
            changed = true;
        }
        if (!currentPhone && foundVisitor.phone) {
            next[phoneFieldName] = foundVisitor.phone;
            changed = true;
        }
        if (emailFieldName && emailEmpty && foundVisitor.email) {
            next[emailFieldName] = foundVisitor.email;
            changed = true;
        }

        if (changed) {
            reset(next as any);
            if (!silent) {
                showSuccessToast("Visitor details found and auto-filled!");
            }
        }
    }, [foundVisitor, phoneExists, reset, getValues, phoneFieldName, nameFieldName, emailFieldName, silent]);

    return { phoneExists, foundVisitor };
}
