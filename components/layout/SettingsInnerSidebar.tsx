"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
    User, 
    Bell, 
    CreditCard, 
    QrCode, 
    MessageSquare, 
    Phone, 
    MessageCircle,
    Mail, 
    Settings, 
    LayoutTemplate,
    ShieldCheck
} from "lucide-react";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";

const settingsNavigation = [
    { name: "Profile", href: "/settings/profile", icon: User },
    { name: "Billing & Plan", href: "/settings/subscription", icon: CreditCard },
    { name: "WhatsApp Config", href: "/settings/whatsapp", icon: MessageCircle },
    { name: "SMTP Delivery", href: "/settings/smtp", icon: Mail },
    { name: "SMS Config", href: "/settings/sms", icon: MessageSquare },
    { name: "Voice Call Config", href: "/settings/voice", icon: Phone },
    { name: "Company Controls", href: "/settings/controls", icon: ShieldCheck },
];

export function SettingsInnerSidebar() {
    const pathname = usePathname();
    const { activeSubscriptionData } = useAuthSubscription();
    const modules = activeSubscriptionData?.modules;

    const filteredNavigation = settingsNavigation.filter((item) => {
        if (item.name === "WhatsApp Config" && modules && !modules.enableWhatsApp) return false;
        if (item.name === "Voice Call Config" && modules && !modules.enableVoice) return false;
        if (item.name === "SMS Config" && modules && !modules.enableSms) return false;
        if (item.name === "SMTP Delivery" && modules && !modules.enableEmail) return false;
        return true;
    });

    return (
        <div className="w-full md:w-[260px] flex-shrink-0 bg-white border-b md:border border-gray-200 md:rounded-2xl flex flex-col h-fit p-2 md:p-3 shadow-sm md:shadow-none">
            <nav className="flex md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-visible no-scrollbar pb-1 md:pb-0">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-xl text-[13px] md:text-[14px] font-semibold transition-all duration-200 whitespace-nowrap",
                                isActive 
                                    ? "text-[#3882a5] bg-[#f0f7fb]" 
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-[#3882a5]" : "text-gray-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
