"use client";

import { useState, useMemo, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/chatSidebar";
import { ChatWindow } from "@/components/chat/chatWindow";
import { GroupSettingsModal } from "@/components/chat/groupSettingsModal";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import {
    getCurrentUserId,
    getChatPartner,
    formatChatUser,
    getChatDisplayData,
    shouldShowChat,
    FormattedChatUser,
    buildParticipantsMap,
    transformMessageForDisplay
} from "@/lib/chat-utils";

export default function MessagesPage() {
    const { user } = useAuthSubscription();
    // Broad Admin Check
    const isAdmin =
        user?.role === "admin" ||
        user?.role === "super_admin" ||
        (Array.isArray(user?.roles) && (user?.roles.includes("admin") || user?.roles.includes("super_admin")));

    const {
        chats,
        activeChat,
        messages,
        isLoading,
        selectChat,
        sendMessage,
        isSending,
        startChatWithEmployee,
        createGroup,
        updateGroup,
        addParticipants,
        removeParticipant,
        deleteChat,
        onlineUserIds,
        loadMoreMessages,
        isFetchingMessages,
        hasMoreMessages
    } = useChat();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
    const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);

    // Transform chats and employees to sidebar users format
    const sidebarUsers = useMemo(() => {
        if (!user) return [];
        const userId = getCurrentUserId(user);

        // 1. Process Chats (which now acts as the single source for sidebar users)
        const rawChats = (chats || []).map((chat) => {
            // Ensure chat object is passed to getChatDisplayData for resilience
            const displayData = getChatDisplayData(chat, userId);
            const isVirtual = (chat as any).isVirtual;

            return {
                id: chat._id, // This is EmployeeID for virtual chats, ChatID for real chats
                targetUserId: displayData.id,
                name: displayData.name,
                email: displayData.email,
                avatar: displayData.avatar,
                lastMessage: chat.lastMessage?.text || (chat.lastMessage?.files?.length ? "Sent a file" : "Start a conversation"),
                lastMessageTime: chat.updatedAt ? new Date(chat.updatedAt) : undefined,
                unreadCount: chat.unreadCounts?.[userId] || 0,
                isOnline: displayData.role === 'group' ? false : onlineUserIds.includes(displayData.id),
                role: displayData.role,
                isChat: !isVirtual,
                isGroup: chat.isGroup === true || displayData.role === 'group' || (Array.isArray(chat.participants) && chat.participants.length > 2)
            };
        });

        // Deduplicate Chats by Target User ID (Only for non-group chats)
        const uniqueChatsMap = new Map<string, typeof rawChats[0]>();
        const groupChats: typeof rawChats = [];

        rawChats.forEach(chatUser => {
            if (chatUser.isGroup) {
                groupChats.push(chatUser);
                return;
            }

            if (!chatUser.targetUserId) return;

            const existing = uniqueChatsMap.get(chatUser.targetUserId);
            if (!existing) {
                uniqueChatsMap.set(chatUser.targetUserId, chatUser);
            } else {
                // Prefer real chats over virtual ones
                if (chatUser.isChat && !existing.isChat) {
                    uniqueChatsMap.set(chatUser.targetUserId, chatUser);
                } else if (chatUser.isChat === existing.isChat) {
                    // If equal status, prefer newer
                    const newTime = chatUser.lastMessageTime ? new Date(chatUser.lastMessageTime).getTime() : 0;
                    const existingTime = existing.lastMessageTime ? new Date(existing.lastMessageTime).getTime() : 0;
                    if (newTime > existingTime) {
                        uniqueChatsMap.set(chatUser.targetUserId, chatUser);
                    }
                }
            }
        });

        const existingChats = [...groupChats, ...Array.from(uniqueChatsMap.values())];

        // Filter based on Exclusion Model
        let chatUsers = existingChats
            .filter(u => shouldShowChat(u, !!isAdmin))
            .sort((a, b) => {
                // 1. Prioritize Chats with active messages (real chats)
                if (a.isChat && !b.isChat) return -1;
                if (!a.isChat && b.isChat) return 1;
                // 2. Sort by Time
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                return timeB - timeA;
            });

        // ADD VIRTUAL ADMIN (Support Team) logic
        if (!isAdmin) {
            const adminId = (user as any)?.createdBy;
            if (adminId && !chatUsers.some(c => c.targetUserId === adminId)) {
                chatUsers.unshift({
                    id: adminId,
                    targetUserId: adminId,
                    name: "Support Team",
                    email: "support@safein.com",
                    avatar: "",
                    lastMessage: "Contact Admin",
                    lastMessageTime: undefined,
                    unreadCount: 0,
                    isOnline: false,
                    role: "admin",
                    isChat: false,
                    isGroup: false
                });
            }
        }

        return chatUsers;
    }, [chats, isAdmin, user, onlineUserIds]);

    const handleSelectUser = async (id: string) => {
        const selectedItem = sidebarUsers.find(u => u.id === id);

        if (selectedItem?.isChat) {
            selectChat(id);
        } else {
            const targetId = selectedItem?.targetUserId;
            if (targetId) {
                await startChatWithEmployee(targetId);
            }
        }
        setIsMobileSidebarOpen(false);
    };

    const handleBackToSidebar = () => {
        setIsMobileSidebarOpen(true);
    };

    // Prepare active user object for ChatWindow header
    const activeChatUser = useMemo(() => {
        if (!activeChat || !user) return undefined;
        const userId = getCurrentUserId(user);
        const displayData = getChatDisplayData(activeChat, userId);

        return {
            id: displayData.id,
            name: displayData.name,
            email: displayData.email,
            avatar: displayData.avatar,
            role: displayData.role,
            lastSeen: (displayData as any).lastSeen,
            isOnline: activeChat.isGroup ? false : onlineUserIds.includes(displayData.id)
        };
    }, [activeChat, user, onlineUserIds]);

    // 1. Memoized Participant Lookup Map for Performance & Accuracy
    const participantsMap = useMemo(() => {
        return buildParticipantsMap(user, chats, activeChat, sidebarUsers);
    }, [chats, sidebarUsers, activeChat, user]);

    // Transform messages for ChatWindow with Optimized Lookup
    const chatWindowMessages = useMemo(() => {
        return messages.map(msg => transformMessageForDisplay(msg, participantsMap));
    }, [messages, participantsMap]);

    // Notification Sound Logic
    useEffect(() => {
        if (messages.length > 0 && activeChat) {
            const lastMsg = messages[messages.length - 1];
            const senderId = String(typeof lastMsg.senderId === 'object' ? lastMsg.senderId._id : lastMsg.senderId);
            const currentId = getCurrentUserId(user);

            if (senderId !== currentId) {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => { }); // Catch browser blocking autoplay
            }
        }
    }, [messages.length, activeChat?._id, user]);

    useEffect(() => {
        // Prevent layout-level scrolling for the messages page to achieve an app-like feel
        const mainContent = document.querySelector('main');
        if (mainContent) {
            const originalStyle = mainContent.style.overflowY;
            mainContent.style.overflowY = 'hidden';
            return () => {
                mainContent.style.overflowY = originalStyle;
            };
        }
    }, []);

    return (
        <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-230px)] w-full relative flex flex-col">
            <div className="flex-1 bg-white md:rounded-3xl shadow-xl md:shadow-lg border-x md:border border-gray-100 overflow-hidden flex relative">
                {/* Sidebar */}
                <div
                    className={cn(
                        "w-full md:w-80 lg:w-96 flex-shrink-0 border-r bg-white transition-all duration-300 absolute md:relative z-30 h-full",
                        isMobileSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100"
                    )}
                >
                    <ChatSidebar
                        users={sidebarUsers}
                        activeUserId={activeChat?._id}
                        onSelectUser={handleSelectUser}
                        onCreateGroup={createGroup}
                        isAdmin={!!isAdmin}
                        className="h-full w-full"
                    />
                </div>

                {/* Chat Window Container */}
                <div
                    className={cn(
                        "flex-1 h-full flex flex-col transition-all duration-300 bg-gray-50 absolute md:relative w-full z-20",
                        !isMobileSidebarOpen ? "translate-x-0 opacity-100" : "translate-x-full md:translate-x-0 opacity-0 md:opacity-100 shadow-2xl md:shadow-none"
                    )}
                >
                    <ChatWindow
                        messages={chatWindowMessages}
                        activeUser={activeChatUser as any}
                        currentUser={{ id: (user as any)?.id || (user as any)?._id || "" }}
                        onSendMessage={sendMessage}
                        onBack={handleBackToSidebar}
                        onSettings={() => setIsGroupSettingsOpen(true)}
                        onLoadMore={loadMoreMessages}
                        hasMore={hasMoreMessages}
                        isFetching={isFetchingMessages}
                        className="h-full w-full"
                    />
                </div>
            </div>

            <GroupSettingsModal
                isOpen={isGroupSettingsOpen}
                onClose={() => setIsGroupSettingsOpen(false)}
                activeChat={activeChat as any}
                currentUserId={String((user as any)?.id || (user as any)?._id || "")}
                isAdmin={isAdmin}
                onUpdateGroup={updateGroup}
                onAddParticipants={addParticipants}
                onRemoveParticipant={removeParticipant}
                onDeleteChat={deleteChat}
            />
        </div>
    );
}
