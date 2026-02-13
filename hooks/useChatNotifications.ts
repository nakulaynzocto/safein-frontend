import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSocket, SocketEvents } from "./useSocket";
import { useAuthSubscription } from "./useAuthSubscription";
import { chatApi, useGetChatsQuery } from "@/store/api/chatApi";
import { useAppDispatch } from "@/store/hooks";
import { Chat } from "@/store/api/chatApi";

export function useChatNotifications() {
    // Disable toasts here to prevent duplicates (handled in ProtectedLayout)
    const { socket, isConnected } = useSocket({ showToasts: false });
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAuthSubscription();

    // Ensure chats are fetched and stay updated
    const { data: chats, refetch } = useGetChatsQuery(undefined, { skip: !user });

    // Use ref to deduplicate messages (backend emits to both chat and user rooms)
    const processedMessagesRef = useRef<Set<string>>(new Set());
    const chatsRef = useRef<Chat[] | undefined>(chats);

    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    useEffect(() => {
        if (!socket || !isConnected || !user) return;

        const handleReceiveMessage = (message: any) => {
            const messageId = message._id || message.id;
            if (!messageId || processedMessagesRef.current.has(messageId)) return;

            // Mark as processed and keep set small
            processedMessagesRef.current.add(messageId);
            if (processedMessagesRef.current.size > 50) {
                const oldest = Array.from(processedMessagesRef.current)[0];
                processedMessagesRef.current.delete(oldest);
            }

            const userId = user.id || (user as any)._id;
            const senderId = (message.senderId as any)?._id || message.senderId;

            // Ignore own messages
            if (String(senderId) === String(userId)) return;

            const isMessagesPage = pathname?.includes("/messages");

            // Check if chat exists in current loaded list
            const existingChat = chatsRef.current?.find((c) => c._id === message.chatId);

            if (existingChat) {
                // 1. Update Redux Cache for Badge Count
                dispatch(
                    chatApi.util.updateQueryData("getChats", undefined, (draft) => {
                        const chatIndex = draft.findIndex((c) => c._id === message.chatId);
                        if (chatIndex !== -1) {
                            const chat = draft[chatIndex];
                            chat.lastMessage = message;
                            chat.updatedAt = message.createdAt;

                            // Increment unread count
                            chat.unreadCounts = chat.unreadCounts || {};
                            chat.unreadCounts[userId] = (chat.unreadCounts[userId] || 0) + 1;

                            // Move chat to top of list
                            draft.splice(chatIndex, 1);
                            draft.unshift(chat);
                        }
                    })
                );
            } else {
                // If chat not in list (new chat), fetch latest list
                refetch();
            }

            // 2. Voice Alert & Toast - ONLY if NOT on messages page
            if (!isMessagesPage) {
                try {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance("SafeIn");
                        utterance.rate = 1.0;
                        utterance.pitch = 1.0;
                        utterance.volume = 0.9;
                        window.speechSynthesis.speak(utterance);
                    }
                } catch (e) {
                    // Silently handle error
                }

                toast.info(`New message from ${message.senderId?.name || "User"}`, {
                    description: message.text || (message.files?.length ? "Sent a attachment" : ""),
                    action: {
                        label: "Reply",
                        onClick: () => router.push("/messages")
                    },
                    duration: 5000,
                });
            }
        };

        socket.on(SocketEvents.RECEIVE_MESSAGE, handleReceiveMessage);

        return () => {
            socket.off(SocketEvents.RECEIVE_MESSAGE, handleReceiveMessage);
        };
    }, [socket, isConnected, user, pathname, dispatch, router, refetch]);
}
