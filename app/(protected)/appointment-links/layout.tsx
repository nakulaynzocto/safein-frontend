import type { ReactNode } from "react";
import { AppointmentLinksSubNav } from "@/components/layout/AppointmentLinksSubNav";
import { MOBILE_APPOINTMENT_LINKS_SUB_NAV_HEIGHT_PX } from "@/utils/appointmentLinksLayout";

export default function AppointmentLinksLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-1 flex-col">
            <AppointmentLinksSubNav />
            <div className="min-w-0 flex-1">{children}</div>
            {/* Reserve space on mobile so content scrolls above the fixed invite bar (above bottom nav) */}
            <div className="shrink-0 md:hidden" style={{ height: MOBILE_APPOINTMENT_LINKS_SUB_NAV_HEIGHT_PX }} aria-hidden />
        </div>
    );
}
