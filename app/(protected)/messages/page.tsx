"use client";

import { useState, useMemo, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/chatSidebar";
import { ChatWindow } from "@/components/chat/chatWindow";
import { GroupSettingsModal } from "@/components/chat/groupSettingsModal";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { useChat } from "@/hooks/useChat";
import { MessageSquare, ShieldAlert } from "lucide-react";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";
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
    const { user, subscriptionLimits, isLoading: isAuthLoading } = useAuthSubscription();

    // Check module access
    // If limits are loaded, check boolean. If loading, wait.
    const canAccessMessages = subscriptionLimits?.modules?.message;

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

        // Deduplicate Chats by Target User ID AND Email (Robust Merge)
        const uniqueChatsMap = new Map<string, typeof rawChats[0]>();
        const emailMap = new Map<string, string>(); // Email -> targetUserId of the stored chat
        const groupChats: typeof rawChats = [];

        rawChats.forEach(chatUser => {
            if (chatUser.isGroup) {
                groupChats.push(chatUser);
                return;
            }

            if (!chatUser.targetUserId) return;

            // Find existing entry by ID or Email
            let existingId: string | undefined;
            const userEmail = chatUser.email ? chatUser.email.toLowerCase() : "";

            if (uniqueChatsMap.has(chatUser.targetUserId)) {
                existingId = chatUser.targetUserId;
            } else if (userEmail && emailMap.has(userEmail)) {
                existingId = emailMap.get(userEmail);
            }

            if (existingId) {
                const existing = uniqueChatsMap.get(existingId);
                if (!existing) return; // Should not happen

                // Merge Logic: Determine which one to keep as the "Base"
                // 1. Prefer Real Chat
                let keepNew = false;
                if (chatUser.isChat && !existing.isChat) {
                    keepNew = true;
                } else if (!chatUser.isChat && existing.isChat) {
                    keepNew = false;
                } else {
                    // 2. Tie-breaker: Newer message wins
                    const timeNew = chatUser.lastMessageTime ? new Date(chatUser.lastMessageTime).getTime() : 0;
                    const timeOld = existing.lastMessageTime ? new Date(existing.lastMessageTime).getTime() : 0;
                    keepNew = timeNew > timeOld;
                }

                const winner = keepNew ? chatUser : existing;
                const loser = keepNew ? existing : chatUser;

                // Merge Data (Take best attributes)
                // 1. Online Status: If ANY is online, the merged user is online
                winner.isOnline = winner.isOnline || loser.isOnline;

                // 2. Name: Prefer Real Name over Email/Unknown
                // Often the Virtual Employee has the correct name, while the User has "email@..." or "Unknown"
                // Or vice versa. We want the one that looks like a real name.
                const winnerNameBad = !winner.name || winner.name === winner.email || winner.name === "Unknown User";
                const loserNameGood = loser.name && loser.name !== loser.email && loser.name !== "Unknown User";

                if (winnerNameBad && loserNameGood) {
                    winner.name = loser.name;
                }

                // 3. Avatar: Prefer existing/better avatar
                if (!winner.avatar && loser.avatar) {
                    winner.avatar = loser.avatar;
                }

                // Update Maps
                if (keepNew) {
                    // Remove old reference, add new
                    uniqueChatsMap.delete(existingId);
                    uniqueChatsMap.set(winner.targetUserId, winner);

                    // Update email mapping to point to the new winner ID
                    if (userEmail) emailMap.set(userEmail, winner.targetUserId);
                } else {
                    // Existing won. It's already in uniqueChatsMap. properties updated in-place.
                    // Ensure email map points to it (if not already)
                    if (userEmail) emailMap.set(userEmail, winner.targetUserId);
                }

            } else {
                // New Entry
                uniqueChatsMap.set(chatUser.targetUserId, chatUser);
                if (userEmail) emailMap.set(userEmail, chatUser.targetUserId);
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
                    name: (user as any).companyName || "Support Team",
                    email: (user as any).email || "support@safein.com",
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


    useEffect(() => {
        // Find the scrollable container in ProtectedLayout
        const scrollableContainer = document.querySelector('.overflow-y-auto');
        if (scrollableContainer instanceof HTMLElement) {
            const originalOverflow = scrollableContainer.style.overflowY;
            const originalHeight = scrollableContainer.style.height;
            
            scrollableContainer.style.overflowY = 'hidden';
            scrollableContainer.style.height = '100%'; 
            
            return () => {
                scrollableContainer.style.overflowY = originalOverflow;
                scrollableContainer.style.height = originalHeight;
            };
        }
    }, [activeChat]); // Re-run when chat changes to ensure state

    if (isAuthLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (canAccessMessages === false) {
        return (
            <ModuleAccessDenied
                title="Messaging Not Available"
                description="Your current subscription plan does not include the Messaging module. Please upgrade your plan to access this feature."
                containerHeight="h-[60vh]"
            />
        );
    }

    return (
        <div className="flex-1 h-full max-h-full w-full relative flex flex-col overflow-hidden">
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
