"use client";

import { SettingsInnerSidebar } from "@/components/layout/SettingsInnerSidebar";
import { type ReactNode } from "react";

interface SettingsLayoutProps {
    children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-[#f9fafb]">
            <div className="md:py-6 md:pl-6 md:pr-4 w-full md:w-auto flex-shrink-0 z-10 sticky top-0 md:static">
                <SettingsInnerSidebar />
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-[1200px] p-4 md:py-6 md:pr-6 md:pl-2 pb-32">
                    {children}
                </div>
            </div>
        </div>
    );
}
