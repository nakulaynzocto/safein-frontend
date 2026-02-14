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
        <div className={cn("flex flex-col h-full bg-white border-r w-full md:w-80 lg:w-96", className)}>
            {/* Header */}
            <div className="p-4 border-b space-y-4 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">
                        {isAdmin ? "Messages" : "Support Chat"}
                    </h1>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => setIsGroupModalOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Users className="h-5 w-5 text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar (Only for Admin) */}
                {isAdmin && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search employees..."
                            className="pl-9 h-10 bg-gray-50 border-gray-200 focus-visible:ring-[#3882a5] rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No conversations found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user.id)}
                                className={cn(
                                    "px-4 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors relative group",
                                    activeUserId === user.id && "bg-blue-50/50 hover:bg-blue-50"
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-12 w-12 border border-gray-100">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback
                                            className={cn(
                                                "font-medium bg-gray-100 text-gray-600 flex items-center justify-center leading-none",
                                                activeUserId === user.id && "bg-blue-100 text-blue-600"
                                            )}
                                        >
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className="flex flex-col overflow-hidden mr-2">
                                            <h3 className={cn("font-semibold text-sm truncate", user.unreadCount && user.unreadCount > 0 ? "text-gray-900" : "text-gray-700")}>
                                                {formatName(user.name)}
                                            </h3>
                                            {user.email && (
                                                <span className="text-[11px] text-gray-500 truncate leading-tight">
                                                    {user.email}
                                                </span>
                                            )}
                                        </div>
                                        {user.lastMessageTime && (
                                            <span className={cn(
                                                "text-xs whitespace-nowrap ml-2",
                                                user.unreadCount && user.unreadCount > 0 ? "text-blue-600 font-medium" : "text-gray-400"
                                            )}>
                                                {formatDistanceToNow(user.lastMessageTime, { addSuffix: false }).replace('about ', '')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn(
                                            "text-xs truncate pr-2 w-full",
                                            user.unreadCount && user.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                                        )}>
                                            {user.unreadCount && user.unreadCount > 0 ? (
                                                <span className="flex items-center gap-1">
                                                    {user.lastMessage}
                                                </span>
                                            ) : (
                                                user.lastMessage || "Start a conversation"
                                            )}
                                        </p>
                                        {user.unreadCount && user.unreadCount > 0 ? (
                                            <span className="bg-[#3882a5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
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
