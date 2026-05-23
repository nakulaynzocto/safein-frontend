import { useState, useEffect, useRef } from "react";
import { useLazyCheckVisitorByPhoneQuery, Visitor } from "@/store/api/visitorApi";

const cleanDigits = (val: string) => val?.replace(/\D/g, "") || "";

export function useVisitorExistenceCheck(watchedPhone: string | undefined, visitorId?: string) {
    const [phoneExists, setPhoneExists] = useState(false);
    const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
    const [triggerCheck] = useLazyCheckVisitorByPhoneQuery();
    
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
                // We send the raw digits, backend handles formatting/normalization
                const response = await triggerCheck(digits).unwrap();
                
                if (response.exists && response.visitor && response.visitor._id !== visitorId) {
                    setPhoneExists(true);
                    setFoundVisitor(response.visitor);
                } else {
                    setPhoneExists(false);
                    setFoundVisitor(null);
                }
            } catch (err) {
                // Background check failure
                setPhoneExists(false);
                setFoundVisitor(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedPhone, triggerCheck, visitorId]);

    return { phoneExists, foundVisitor };
}
