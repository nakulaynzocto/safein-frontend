"use client";

import { useState, ReactNode, useEffect } from "react";
import { User, CreditCard, Phone, Mail, Bell, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useRouter, usePathname } from "next/navigation";
import { routes } from "@/utils/routes";
import Link from "next/link";
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi";

type TabType = "profile" | "subscription" | "whatsapp" | "smtp" | "sms" | "voice" | "controls";

interface ProfileLayoutProps {
    children: (activeTab: TabType) => ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const { data: subscriptionData } = useGetUserActiveSubscriptionQuery(user?.id as string, { skip: !user?.id });
    const modules = subscriptionData?.data?.modules;

    // Sync active tab with pathname for external pages
    useEffect(() => {
        if (pathname === routes.privateroute.SETTINGS_WHATSAPP) {
            setActiveTab("whatsapp");
        } else if (pathname === routes.privateroute.SETTINGS_SMTP) {
            setActiveTab("smtp");
        } else if (pathname === routes.privateroute.SETTINGS_SMS) {
            setActiveTab("sms");
        } else if (pathname === routes.privateroute.PROFILE) {
            setActiveTab("profile");
        } else if (pathname === routes.privateroute.SETTINGS_SUBSCRIPTION) {
            setActiveTab("subscription");
        } else if (pathname === routes.privateroute.SETTINGS_VOICE) {
            setActiveTab("voice");
        } else if (pathname === routes.privateroute.SETTINGS_CONTROLS) {
            setActiveTab("controls");
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
            label: "Billing & Plans",
            icon: CreditCard,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_SUBSCRIPTION,
        },
        {
            id: "whatsapp" as const,
            label: "WhatsApp",
            icon: Phone,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_WHATSAPP,
            requiredModule: "enableWhatsApp",
        },
        {
            id: "smtp" as const,
            label: "Email Server",
            icon: Mail,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_SMTP,
            requiredModule: "enableEmail",
        },
        {
            id: "sms" as const,
            label: "SMS outreach",
            icon: MessageSquare,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_SMS,
            requiredModule: "enableSms",
        },
        {
            id: "voice" as const,
            label: "Voice Call Alerts",
            icon: Phone,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_VOICE,
            requiredModule: "enableVoice",
        },
        {
            id: "controls" as const,
            label: "Organization Settings",
            icon: ShieldCheck,
            roles: ["admin"],
            href: routes.privateroute.SETTINGS_CONTROLS,
        },
    ];

    // Filter tabs based on user role and subscription modules
    const userRoles = user?.roles || (user?.role ? [user.role] : ['admin']);
    const tabs = baseTabs.filter(tab => {
        // Check if any of the user's roles match the tab's allowed roles
        const hasRequiredRole = tab.roles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) return false;

        // Check Subscription Module
        if ((tab as any).requiredModule && modules) {
            if (!(modules as any)[(tab as any).requiredModule]) return false;
        }

        return true;
    });

    const handleTabClick = (tabId: TabType, href?: string) => {
        if (tabId === "profile") {
            setActiveTab(tabId);
            if (pathname !== routes.privateroute.PROFILE) {
                router.push(routes.privateroute.PROFILE);
            }
        } else if (href) {
            router.push(href);
        }
    };

    return (
        <div className="w-full">
            <div className="w-full">
                {children(activeTab)}
            </div>
        </div>
    );
}
