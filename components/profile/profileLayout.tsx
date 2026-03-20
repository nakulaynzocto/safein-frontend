"use client";

import { useState, ReactNode, useEffect } from "react";
import { User, CreditCard, Calendar, Phone, Mail, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useRouter, usePathname } from "next/navigation";
import { routes } from "@/utils/routes";
import Link from "next/link";

type TabType = "profile" | "notification" | "subscription" | "whatsapp" | "smtp";

interface ProfileLayoutProps {
    children: (activeTab: TabType) => ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<TabType>("profile");

    // Sync active tab with pathname for external pages
    useEffect(() => {
        if (pathname === routes.privateroute.SETTINGS_WHATSAPP) {
            setActiveTab("whatsapp");
        } else if (pathname === routes.privateroute.SETTINGS_SMTP) {
            setActiveTab("smtp");
        } else if (pathname === routes.privateroute.SETTINGS_NOTIFICATION) {
            setActiveTab("notification");
        } else if (pathname === routes.privateroute.PROFILE) {
            setActiveTab("profile");
        }
    }, [pathname]);

    const baseTabs = [
        {
            id: "profile" as const,
            label: "Profile Details",
            icon: User,
            roles: ["admin", "employee"],
            href: routes.privateroute.PROFILE,
        },
        {
            id: "subscription" as const,
            label: "Subscription",
            icon: CreditCard,
            roles: ["admin"],
            href: routes.privateroute.PROFILE, // Subscription is currently a tab in Profile
        },
        {
            id: "notification" as const,
            label: "Notifications",
            icon: Bell,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_NOTIFICATION,
        },
        {
            id: "whatsapp" as const,
            label: "WhatsApp",
            icon: Phone,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_WHATSAPP,
        },
        {
            id: "smtp" as const,
            label: "Email Server",
            icon: Mail,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_SMTP,
        },
    ];

    // Filter tabs based on user role
    const tabs = baseTabs.filter(tab => tab.roles.includes(user?.role || 'admin'));

    const handleTabClick = (tabId: TabType, href?: string) => {
        if (tabId === "profile" || tabId === "subscription") {
            setActiveTab(tabId);
            if (pathname !== routes.privateroute.PROFILE) {
                router.push(routes.privateroute.PROFILE);
            }
        } else if (href) {
            router.push(href);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-3">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-[170px] flex-shrink-0 md:sticky md:top-6 md:self-start">
                <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible bg-white/50 p-1.5 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id, tab.href)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap w-full",
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
