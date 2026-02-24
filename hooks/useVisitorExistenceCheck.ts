import { useState, useEffect } from "react";
import { useLazyGetVisitorsQuery, Visitor } from "@/store/api/visitorApi";

/**
 * UTILS: Simple cleaning and matching
 */
const cleanDigits = (val: string) => val?.replace(/\D/g, "") || "";

const isSameEmail = (v: Visitor, email: string) =>
    v.email?.toLowerCase().trim() === email.toLowerCase().trim();

const isPhoneMatch = (v: Visitor, phoneDigits: string) => {
    if (!v.phone) return false;
    const vDigits = v.phone.replace(/\D/g, "");
    const searchLast10 = phoneDigits.slice(-10);
    const vLast10 = vDigits.slice(-10);

    // If both have at least 10 digits, compare the last 10
    if (vDigits.length >= 10 && phoneDigits.length >= 10) {
        return vLast10 === searchLast10;
    }

    // Fallback to exact match
    return vDigits === phoneDigits;
};

/**
 * HOOK: useVisitorExistenceCheck
 * Efficiently checks if a visitor exists by email or phone.
 */
export function useVisitorExistenceCheck(watchedEmail: string, watchedPhone: string, visitorId?: string) {
    const [emailExists, setEmailExists] = useState(false);
    const [phoneExists, setPhoneExists] = useState(false);
    const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
    const [triggerSearch] = useLazyGetVisitorsQuery();

    // EMAIL CHECK EFFECT
    useEffect(() => {
        const email = watchedEmail?.trim();
        if (!email || email.length < 5 || !email.includes("@")) {
            setEmailExists(false);
            return;
        }

        // Optimization: Check against current foundVisitor
        if (foundVisitor && isSameEmail(foundVisitor, email)) {
            const isDifferentVisitor = !visitorId || foundVisitor._id !== visitorId;
            setEmailExists(isDifferentVisitor);
            if (isDifferentVisitor) return;
        }

        const timer = setTimeout(async () => {
            try {
                const { visitors } = await triggerSearch({ search: email }).unwrap();
                const match = visitors?.find(v => isSameEmail(v, email) && v._id !== visitorId);

                setEmailExists(!!match);
                if (match) setFoundVisitor(match);
            } catch (err) {
                console.error("Email check error:", err);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [watchedEmail, triggerSearch, visitorId, foundVisitor]);

    // PHONE CHECK EFFECT
    useEffect(() => {
        const digits = cleanDigits(watchedPhone);

        // Only search if we have at least 10 digits (Standard mobile length)
        if (digits.length < 10) {
            setPhoneExists(false);
            return;
        }

        // Optimization: Check against current foundVisitor
        if (foundVisitor && isPhoneMatch(foundVisitor, digits)) {
            const isDifferentVisitor = !visitorId || foundVisitor._id !== visitorId;
            setPhoneExists(isDifferentVisitor);
            if (isDifferentVisitor) return;
        }

        const timer = setTimeout(async () => {
            try {
                // Search for the last 10 digits
                const searchParam = digits.slice(-10);
                const { visitors } = await triggerSearch({ search: searchParam }).unwrap();

                // Validate match locally
                const match = visitors?.find(v => isPhoneMatch(v, digits) && v._id !== visitorId);

                setPhoneExists(!!match);
                if (match) setFoundVisitor(match);
            } catch (err) {
                console.error("Phone check error:", err);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedPhone, triggerSearch, visitorId, foundVisitor]);

    // CLEANUP EFFECT
    useEffect(() => {
        const hasEmail = watchedEmail?.length >= 5;
        const hasPhone = cleanDigits(watchedPhone).length >= 10;

        if (!hasEmail && !hasPhone) {
            setFoundVisitor(null);
            setEmailExists(false);
            setPhoneExists(false);
        }
    }, [watchedEmail, watchedPhone]);

    return { emailExists, phoneExists, foundVisitor };
}
