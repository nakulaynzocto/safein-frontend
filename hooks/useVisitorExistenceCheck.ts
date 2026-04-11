import { useState, useEffect, useRef } from "react";
import { useLazyGetVisitorsQuery, Visitor } from "@/store/api/visitorApi";

const cleanDigits = (val: string) => val?.replace(/\D/g, "") || "";

const isPhoneMatch = (v: Visitor, searchDigits: string) => {
    if (!v.phone || !searchDigits) return false;
    const vDigits = v.phone.replace(/\D/g, "");
    if (vDigits === searchDigits) return true;
    
    // Fallback to last 10 digits match for international/local variations
    if (vDigits.length >= 10 && searchDigits.length >= 10) {
        return vDigits.slice(-10) === searchDigits.slice(-10);
    }
    return false;
};

export function useVisitorExistenceCheck(watchedPhone: string | undefined, visitorId?: string) {
    const [phoneExists, setPhoneExists] = useState(false);
    const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
    const [triggerSearch] = useLazyGetVisitorsQuery();
    
    const lastCheckedPhone = useRef("");

    useEffect(() => {
        const digits = cleanDigits(watchedPhone || "");

        if (digits.length < 10) {
            setPhoneExists(false);
            setFoundVisitor(null);
            lastCheckedPhone.current = "";
            return;
        }

        if (digits === lastCheckedPhone.current) return;

        const timer = setTimeout(async () => {
            try {
                lastCheckedPhone.current = digits;
                const searchParam = digits.slice(-10);
                const response = await triggerSearch({ search: searchParam }).unwrap();
                const visitors = response.visitors || [];

                const match = visitors.find((v) => isPhoneMatch(v, digits) && v._id !== visitorId);

                if (match) {
                    setPhoneExists(true);
                    setFoundVisitor(match);
                } else {
                    setPhoneExists(false);
                    setFoundVisitor(null);
                }
            } catch (err) {
                // Background check failure
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedPhone, triggerSearch, visitorId]);

    return { phoneExists, foundVisitor };
}
