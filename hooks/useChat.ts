import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
    useGetChatsQuery,
    useGetMessagesQuery,
    useMarkChatReadMutation,
    useInitiateChatMutation,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useAddParticipantsMutation,
    useRemoveParticipantMutation,
    useDeleteChatMutation,
    chatApi,
    Chat,
    Message
} from "@/store/api/chatApi";
import { useAppointmentSocket, SocketEvents } from "./useSocket";
import { useAuthSubscription } from "./useAuthSubscription";
import { getCurrentUserId } from "@/lib/chat-utils";

export function useChat() {
    const dispatch = useAppDispatch();
    const { user } = useAuthSubscription();
    const { socket, isConnected } = useAppointmentSocket();

    // State
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [skip, setSkip] = useState(0);
    const LIMIT = 50;

    // Queries
    const { data: chats = [], isLoading: isChatsLoading, refetch: refetchChats } = useGetChatsQuery();

    // Active Chat Messages Query
    const {
        data: messages = [],
        isLoading: isMessagesLoading,
        refetch: refetchMessages,
        isFetching: isFetchingMessages
    } = useGetMessagesQuery(
        { chatId: activeChat?._id || "", limit: LIMIT, skip },
        { skip: !activeChat }
    );

    // Mutations
    const [markRead] = useMarkChatReadMutation();
    const [initiateChat] = useInitiateChatMutation();
    const [createGroupMutation] = useCreateGroupMutation();
    const [updateGroupMutation] = useUpdateGroupMutation();
    const [addParticipantsMutation] = useAddParticipantsMutation();
    const [removeParticipantMutation] = useRemoveParticipantMutation();
    const [deleteChatMutation] = useDeleteChatMutation();

    const currentUserId = getCurrentUserId(user);

    // Handle Socket Events
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Message Handler
        const handleReceiveMessage = (message: Message) => {
            const senderId = (message.senderId as any)?._id || message.senderId;
            const isSelf = String(senderId) === currentUserId;

            // Update Messages Cache if active chat matches
            if (activeChat && message.chatId === activeChat._id) {
                dispatch(
                    chatApi.util.updateQueryData("getMessages", { chatId: activeChat._id, limit: LIMIT, skip: 0 }, (draft) => {
                        const exists = draft.find(m => m._id === message._id);
                        if (!exists) {
                            draft.push(message);
                        }
                    })
                );

                // Mark read immediately if active and not from self
                if (!isSelf) {
                    markRead({ chatId: activeChat._id });
                }
            }

            // Update Chat List Cache (Last Message & Unread Count)
            dispatch(
                chatApi.util.updateQueryData("getChats", undefined, (draft) => {
                    const chatIndex = draft.findIndex((c) => c._id === message.chatId);
                    if (chatIndex !== -1) {
                        const chat = draft[chatIndex];
                        chat.lastMessage = message;
                        chat.updatedAt = message.createdAt;

                        // Increment unread count if not active or minimized
                        if ((!activeChat || activeChat._id !== message.chatId) && !isSelf) {
                            chat.unreadCounts[currentUserId] = (chat.unreadCounts[currentUserId] || 0) + 1;
                        }

                        // Move to top
                        draft.splice(chatIndex, 1);
                        draft.unshift(chat);
                    } else {
                        refetchChats();
                    }
                })
            );
        };

        const handleReadReceipt = (data: { chatId: string, userId: string }) => {
            if (activeChat && data.chatId === activeChat._id && data.userId !== currentUserId) {
                dispatch(
                    chatApi.util.updateQueryData("getMessages", { chatId: activeChat._id, limit: LIMIT, skip: 0 }, (draft) => {
                        draft.forEach(msg => {
                            if (!msg.readBy) msg.readBy = [];
                            if (Array.isArray(msg.readBy) && !msg.readBy.includes(data.userId)) {
                                msg.readBy.push(data.userId);
                            }
                        });
                    })
                );
            }
        };

        const handleUserOnline = (userId: string) => {
            setOnlineUserIds(prev => prev.includes(userId) ? prev : [...prev, userId]);
        };

        const handleUserOffline = (userId: string) => {
            setOnlineUserIds(prev => prev.filter(id => id !== userId));
        };

        const handleGetOnlineUsers = (userIds: string[]) => {
            setOnlineUserIds(userIds);
        };

        socket.on(SocketEvents.RECEIVE_MESSAGE, handleReceiveMessage);
        socket.on(SocketEvents.READ_RECEIPT, handleReadReceipt);
        socket.on(SocketEvents.USER_ONLINE, handleUserOnline);
        socket.on(SocketEvents.USER_OFFLINE, handleUserOffline);
        socket.on(SocketEvents.GET_ONLINE_USERS, handleGetOnlineUsers);

        // Fetch initial online users
        socket.emit(SocketEvents.GET_ONLINE_USERS);

        // Join user room for online status updates
        if (currentUserId) {
            socket.emit(SocketEvents.JOIN_USER_ROOM, currentUserId);
        }

        return () => {
            socket.off(SocketEvents.RECEIVE_MESSAGE, handleReceiveMessage);
            socket.off(SocketEvents.READ_RECEIPT, handleReadReceipt);
            socket.off(SocketEvents.USER_ONLINE, handleUserOnline);
            socket.off(SocketEvents.USER_OFFLINE, handleUserOffline);
            socket.off(SocketEvents.GET_ONLINE_USERS, handleGetOnlineUsers);
        };
    }, [socket, isConnected, activeChat, dispatch, currentUserId, refetchChats, markRead]);

    // Manage Room Joining/Leaving
    useEffect(() => {
        if (!socket || !isConnected || !activeChat) return;

        socket.emit(SocketEvents.JOIN_CHAT_ROOM, activeChat._id);

        // Reset skip when changing chat
        setSkip(0);

        return () => {
            socket.emit(SocketEvents.LEAVE_CHAT_ROOM, activeChat._id);
        };
    }, [activeChat?._id, socket, isConnected]);

    const selectChat = useCallback(async (chatId: string) => {
        const chat = chats.find((c) => c._id === chatId);
        if (chat) {
            setActiveChat(chat);

            // Mark read logic
            if (currentUserId && (chat.unreadCounts?.[currentUserId] || 0) > 0) {
                // Optimistically update list
                dispatch(
                    chatApi.util.updateQueryData("getChats", undefined, (draft) => {
                        const dChat = draft.find(c => c._id === chatId);
                        if (dChat) {
                            dChat.unreadCounts[currentUserId] = 0;
                        }
                    })
                );

                try {
                    await markRead({ chatId });
                } catch (error) {
                    console.error("Failed to mark read", error);
                }
            }
        }
    }, [chats, markRead, dispatch, currentUserId]);

    const sendMessage = useCallback(async (text: string, files: File[] = []) => {
        if (!activeChat || !socket || !isConnected || !currentUserId) return;

        setIsSending(true);
        try {
            const payload = {
                chatId: activeChat._id,
                senderId: currentUserId,
                text,
                files: [] // File upload logic handled separately or assumed pre-processed
            };

            socket.emit(SocketEvents.SEND_MESSAGE, payload);
            setIsSending(false);

        } catch (error) {
            console.error("SendMessage Error", error);
            setIsSending(false);
        }
    }, [activeChat, socket, isConnected, currentUserId]);

    const startChatWithEmployee = useCallback(async (employeeId: string) => {
        try {
            const chat = await initiateChat({ targetUserId: employeeId }).unwrap();
            setActiveChat(chat);
        } catch (error) {
            console.error("Failed to initiate chat", error);
        }
    }, [initiateChat]);

    const createGroup = useCallback(async (participantIds: string[], groupName: string) => {
        try {
            const chat = await createGroupMutation({ participantIds, groupName }).unwrap();
            setActiveChat(chat);
            return chat;
        } catch (error) {
            console.error("Failed to create group", error);
            throw error;
        }
    }, [createGroupMutation]);

    const updateGroup = useCallback(async (chatId: string, data: { groupName?: string; groupPicture?: string }) => {
        try {
            const chat = await updateGroupMutation({ chatId, ...data }).unwrap();
            if (activeChat?._id === chatId) setActiveChat(chat);
            return chat;
        } catch (error) {
            console.error("Failed to update group", error);
            throw error;
        }
    }, [updateGroupMutation, activeChat]);

    const addParticipants = useCallback(async (chatId: string, participantIds: string[]) => {
        try {
            const chat = await addParticipantsMutation({ chatId, participantIds }).unwrap();
            if (activeChat?._id === chatId) setActiveChat(chat);
            return chat;
        } catch (error) {
            console.error("Failed to add participants", error);
            throw error;
        }
    }, [addParticipantsMutation, activeChat]);

    const removeParticipant = useCallback(async (chatId: string, participantId: string) => {
        try {
            const chat = await removeParticipantMutation({ chatId, participantId }).unwrap();
            if (activeChat?._id === chatId) setActiveChat(chat);
            return chat;
        } catch (error) {
            console.error("Failed to remove participant", error);
            throw error;
        }
    }, [removeParticipantMutation, activeChat]);

    const deleteChat = useCallback(async (chatId: string) => {
        try {
            await deleteChatMutation(chatId).unwrap();
            if (activeChat?._id === chatId) setActiveChat(null);
        } catch (error) {
            console.error("Failed to delete chat", error);
            throw error;
        }
    }, [deleteChatMutation, activeChat]);

    const loadMoreMessages = useCallback(() => {
        if (messages.length >= LIMIT) {
            setSkip(prev => prev + LIMIT);
        }
    }, [messages.length]);

    const wasConnected = useRef(false);

    // Refetch on Reconnect to ensure no missed messages
    useEffect(() => {
        if (isConnected && wasConnected.current === false) {
            // Connection established - refetch to sync any missed data
            refetchChats();
            if (activeChat) {
                refetchMessages();
            }
        }
        wasConnected.current = isConnected;
    }, [isConnected, refetchChats, refetchMessages, activeChat?._id]);

    return {
        chats,
        activeChat,
        messages,
        isLoading: isChatsLoading || isMessagesLoading,
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
        hasMoreMessages: messages.length >= LIMIT
    };
}
