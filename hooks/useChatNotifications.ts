import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppointmentSocket, SocketEvents } from "./useSocket";
import { useAuthSubscription } from "./useAuthSubscription";
import { chatApi, useGetChatsQuery } from "@/store/api/chatApi";
import { useAppDispatch } from "@/store/hooks";
import { Chat } from "@/store/api/chatApi";

export function useChatNotifications() {
    const { socket, isConnected } = useAppointmentSocket();
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAuthSubscription();

    // Ensure chats are fetched and stay updated
    const { data: chats, refetch } = useGetChatsQuery(undefined, { skip: !user });

    // Use ref to access latest chats without re-binding listeners constantly
    const chatsRef = useRef<Chat[] | undefined>(chats);
    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    useEffect(() => {
        if (!socket || !isConnected || !user) return;

        const handleReceiveMessage = (message: any) => {
            // If user is on the messages page, let the localized useChat hook handle it
            if (pathname?.includes("/messages")) return;

            const userId = user.id || (user as any)._id;
            const senderId = (message.senderId as any)?._id || message.senderId;

            // Ignore own messages
            if (String(senderId) === String(userId)) return;

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

            // 2. Show Toast Notification
            toast.info(`New message from ${message.senderId?.name || "User"}`, {
                description: message.text,
                action: {
                    label: "Reply",
                    onClick: () => router.push("/messages")
                },
                duration: 5000,
            });
        };

        socket.on(SocketEvents.RECEIVE_MESSAGE, handleReceiveMessage);

        return () => {
            socket.off(SocketEvents.RECEIVE_MESSAGE, handleReceiveMessage);
        };
    }, [socket, isConnected, user, pathname, dispatch, router, refetch]);
}
