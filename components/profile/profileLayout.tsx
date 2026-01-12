"use client";

import { useState, ReactNode } from "react";
import { User, CreditCard, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "profile" | "notification" | "subscription";

interface ProfileLayoutProps {
    children: (activeTab: TabType) => ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
    const [activeTab, setActiveTab] = useState<TabType>("profile");

    const tabs = [
        {
            id: "profile" as const,
            label: "Profile Details",
            icon: User,
        },
        {
            id: "notification" as const,
            label: "Notification",
            icon: Calendar,
        },
        {
            id: "subscription" as const,
            label: "Subscription",
            icon: CreditCard,
        },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-3">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-[150px] flex-shrink-0 md:sticky md:top-6 md:self-start">
                <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible bg-white/50 p-1.5 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-white text-[#3882a5] shadow-sm border border-gray-100"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                )}
                            >
                                <Icon size={18} className={cn("flex-shrink-0", isActive ? "text-[#3882a5]" : "text-gray-400")} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {children(activeTab)}
            </div>
        </div>
    );
}
