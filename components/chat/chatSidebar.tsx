"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { CreateGroupModal } from "./createGroupModal";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { formatName, getInitials } from "@/utils/helpers";

interface ChatUser {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount?: number;
    isOnline?: boolean;
    role?: string;
    targetUserId?: string; // Important for distinguishing between Chat ID and User ID
}

interface ChatSidebarProps {
    users: ChatUser[];
    activeUserId?: string;
    onSelectUser: (userId: string) => void;
    isAdmin: boolean;
    className?: string;
    onCreateGroup?: (participantIds: string[], groupName: string) => Promise<any>;
}

export function ChatSidebar({
    users,
    activeUserId,
    onSelectUser,
    isAdmin,
    className,
    onCreateGroup
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    // CRITICAL: Ensure we use targetUserId if available for group selection.
    // If we use 'id' and it's a real chat, it's a chatId, which won't match a User model ID.
    const employeesOnly = users
        .filter(u => u.role === 'employee')
        .map(u => ({
            id: u.targetUserId || u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar
        }));

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={cn("flex flex-col h-full bg-[#f8fbff] dark:bg-gray-950 border-r border-gray-200/50 dark:border-gray-800/50 w-full md:w-80 lg:w-96", className)}>
            {/* Header */}
            <div className="p-5 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 transition-all duration-300 border-b border-gray-100 dark:border-gray-800">
                {!isAdmin ? (
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Messages</h1>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Global Support Center</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight italic">SafeIn</h1>
                            <button
                                onClick={() => setIsGroupModalOpen(true)}
                                className="h-10 w-10 flex items-center justify-center bg-[#074463] text-white hover:bg-[#0a5a82] rounded-2xl transition-all duration-300 shadow-lg shadow-blue-900/10 active:scale-90"
                                title="Create Group"
                            >
                                <Users className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#074463] transition-colors" />
                            <Input
                                placeholder="Search conversations..."
                                className="pl-11 h-12 bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-2 focus-visible:ring-[#074463]/20 focus:bg-white dark:focus:bg-gray-900 rounded-2xl transition-all duration-300 font-medium text-[15px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-16 w-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">No results found</p>
                    </div>
                ) : (
                    <div className="px-3 py-4 space-y-1">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user.id)}
                                className={cn(
                                    "px-4 py-4 flex items-center gap-4 cursor-pointer rounded-[1.25rem] transition-all duration-300 relative group border border-transparent",
                                    activeUserId === user.id 
                                        ? "bg-white dark:bg-gray-900 shadow-xl shadow-blue-900/5 border-gray-100 dark:border-gray-800 scale-[1.02] z-10" 
                                        : "hover:bg-white dark:hover:bg-gray-900/50"
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar className={cn(
                                        "h-12 w-12 border-2 transition-transform duration-500",
                                        activeUserId === user.id ? "border-[#074463] scale-110" : "border-white dark:border-gray-800"
                                    )}>
                                        <AvatarImage src={user.avatar} className="object-cover" />
                                        <AvatarFallback
                                            className={cn(
                                                "font-bold bg-gray-50 dark:bg-gray-800 text-gray-500",
                                                activeUserId === user.id && "bg-blue-50 dark:bg-blue-900/30 text-[#074463] dark:text-blue-400"
                                            )}
                                        >
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={cn(
                                            "font-bold text-[15px] truncate transition-colors",
                                            activeUserId === user.id ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300",
                                            user.unreadCount && user.unreadCount > 0 && "text-gray-900 dark:text-white"
                                        )}>
                                            {formatName(user.name)}
                                        </h3>
                                        {user.lastMessageTime && (
                                            <span className={cn(
                                                "text-[10px] uppercase font-black tracking-wider ml-2",
                                                user.unreadCount && user.unreadCount > 0 ? "text-[#074463] animate-pulse" : "text-gray-400"
                                            )}>
                                                {formatDistanceToNow(user.lastMessageTime, { addSuffix: false }).replace('about ', '').replace('minutes', 'min').replace('hours', 'hr')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn(
                                            "text-xs truncate pr-2 font-medium tracking-tight h-4",
                                            user.unreadCount && user.unreadCount > 0 ? "text-gray-900 dark:text-white font-bold" : "text-gray-500 dark:text-gray-400"
                                        )}>
                                            {user.lastMessage || "Start a conversation"}
                                        </p>
                                        {user.unreadCount && user.unreadCount > 0 ? (
                                            <span className="bg-[#074463] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0 animate-in zoom-in shadow-lg shadow-blue-900/20">
                                                {user.unreadCount}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isAdmin && onCreateGroup && (
                <CreateGroupModal
                    isOpen={isGroupModalOpen}
                    onClose={() => setIsGroupModalOpen(false)}
                    employees={employeesOnly as any}
                    onCreateGroup={onCreateGroup}
                />
            )}
        </div>
    );
}
