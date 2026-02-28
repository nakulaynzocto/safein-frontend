"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useAppSelector } from "@/store/hooks";
import { useGetChatsQuery } from "@/store/api/chatApi";
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserPlus,
    Settings,
    MessageSquare,
    Link as LinkIcon,
    ClipboardList,
} from "lucide-react";

interface NavItem {
    name: string;
    href: string;
    icon: any;
    roles: string[];
}

const allNavItems: NavItem[] = [
    { name: "Dashboard", href: routes.privateroute.DASHBOARD, icon: LayoutDashboard, roles: ["admin", "employee"] },
    { name: "Employees",  href: routes.privateroute.EMPLOYEELIST, icon: Users, roles: ["admin"] },
    { name: "Visitors",   href: routes.privateroute.VISITORLIST, icon: UserPlus, roles: ["admin"] },
    { name: "Appointments", href: routes.privateroute.APPOINTMENTLIST, icon: Calendar, roles: ["admin", "employee"] },
    { name: "Approvals",  href: routes.privateroute.APPOINTMENT_REQUESTS, icon: ClipboardList, roles: ["employee"] },
    { name: "Invites",    href: routes.privateroute.APPOINTMENT_LINKS, icon: LinkIcon, roles: ["admin", "employee"] },
    { name: "Messages",   href: routes.privateroute.MESSAGES, icon: MessageSquare, roles: ["admin", "employee"] },
    { name: "Settings",   href: routes.privateroute.PROFILE, icon: Settings, roles: ["admin"] },
];

const isActive = (href: string, pathname: string): boolean => {
    if (pathname === href) return true;
    if (href === routes.privateroute.EMPLOYEELIST && pathname?.startsWith("/employee/")) return true;
    if (href === routes.privateroute.APPOINTMENTLIST && pathname?.startsWith("/appointment/") && pathname !== routes.privateroute.APPOINTMENT_REQUESTS) return true;
    if (href === routes.privateroute.VISITORLIST && pathname?.startsWith("/visitor/")) return true;
    if (href === routes.privateroute.APPOINTMENT_LINKS && pathname?.startsWith(routes.privateroute.APPOINTMENT_LINKS)) return true;
    if (href === routes.privateroute.PROFILE && pathname?.startsWith("/settings/")) return true;
    return false;
};

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const { data: chats } = useGetChatsQuery(undefined, { skip: !user });

    const unreadCount = (chats || []).reduce((acc, chat) => {
        const userId = user?.id || (user as any)?._id;
        return acc + (chat.unreadCounts?.[userId] || 0);
    }, 0);

    const userRole = user
        ? checkIsEmployee(user) ? "employee" : (user.role || "admin")
        : "";

    // Filter & cap at 5 for clean bottom bar
    const navItems = allNavItems
        .filter((item) => userRole && item.roles.includes(userRole))
        .slice(0, 5);

    if (!userRole || navItems.length === 0) return null;

    // Hide bottom nav on specific pages for premium app-like feel
    // Specifically hide when in a chat on mobile
    if (pathname === routes.privateroute.MESSAGES) {
        // We could check if a chat is active via redux, but for now let's keep it simple
        // If we want to show it on the sidebar but hide it in a chat, we'd need more state.
        // For a "premium" feel, usually the chat takes the whole bottom area.
        return null;
    }

    return (
        <nav
            className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40",
                "bg-white/95 backdrop-blur-md border-t border-gray-100",
                "shadow-[0_-4px_24px_rgba(56,130,165,0.10)]",
                // Safe area padding for iOS home indicator
                "pb-[env(safe-area-inset-bottom,0px)]"
            )}
        >
            <div className="flex h-16 items-stretch">
                {navItems.map((item) => {
                    const active = isActive(item.href, pathname);
                    const isMessages = item.name === "Messages";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className={cn(
                                "relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200",
                                active ? "text-[#3882a5]" : "text-gray-400 active:text-[#3882a5]/70"
                            )}
                        >
                            {/* Active pill indicator */}
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[#3882a5]" />
                            )}

                            {/* Icon wrapper */}
                            <span className={cn(
                                "relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                                active
                                    ? "bg-[#3882a5]/10 scale-110"
                                    : "scale-100"
                            )}>
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 transition-all duration-200",
                                        active ? "stroke-[2.2]" : "stroke-[1.6]"
                                    )}
                                />
                                {/* Unread badge */}
                                {isMessages && unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white shadow-sm">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </span>

                            {/* Label */}
                            <span className={cn(
                                "text-[9px] font-medium leading-none tracking-tight transition-all duration-200",
                                active ? "opacity-100" : "opacity-60"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
