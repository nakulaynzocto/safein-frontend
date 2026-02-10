import { baseApi } from "./baseApi";

export interface ChatUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    updatedAt?: string;
    lastLoginAt?: string;
}

export interface Message {
    _id: string;
    chatId: string;
    senderId: ChatUser;
    text: string;
    files: { url: string; name: string; type: string }[];
    readBy: string[];
    createdAt: string;
}

export interface Chat {
    _id: string;
    participants: ChatUser[];
    lastMessage?: Message;
    unreadCounts: Record<string, number>;
    isGroup: boolean;
    groupName?: string;
    groupPicture?: string;
    groupAdmin?: string;
    updatedAt: string;
}

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChats: builder.query<Chat[], void>({
            query: () => "/chats",
            providesTags: ["Chat"],
            transformResponse: (response: any) => response.data || [],
        }),
        getMessages: builder.query<Message[], { chatId: string; limit?: number; skip?: number }>({
            query: ({ chatId, limit = 50, skip = 0 }) =>
                `/chats/${chatId}/messages?limit=${limit}&skip=${skip}`,
            providesTags: (result, error, { chatId }) => [{ type: "Chat", id: `MSG_${chatId}` }],
            transformResponse: (response: any) => response.data || [],
        }),
        initiateChat: builder.mutation<Chat, { targetUserId: string }>({
            query: (body) => ({
                url: "/chats/initiate",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Chat"],
            transformResponse: (response: any) => response.data,
        }),
        createGroup: builder.mutation<Chat, { participantIds: string[]; groupName: string; groupPicture?: string }>({
            query: (body) => ({
                url: "/chats/groups",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Chat"],
            transformResponse: (response: any) => response.data,
        }),
        markChatRead: builder.mutation<void, { chatId: string }>({
            query: ({ chatId }) => ({
                url: `/chats/${chatId}/read`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, { chatId }) => ["Chat"],
        }),
        sendMessageHttp: builder.mutation<Message, { chatId: string; text: string; files?: any[] }>({
            query: ({ chatId, text, files }) => ({
                url: `/chats/${chatId}/message`,
                method: "POST",
                body: { text, files },
            }),
        }),
        updateGroup: builder.mutation<Chat, { chatId: string; groupName?: string; groupPicture?: string }>({
            query: ({ chatId, ...body }) => ({
                url: `/chats/${chatId}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (result, error, { chatId }) => ["Chat"],
            transformResponse: (response: any) => response.data,
        }),
        addParticipants: builder.mutation<Chat, { chatId: string; participantIds: string[] }>({
            query: ({ chatId, participantIds }) => ({
                url: `/chats/${chatId}/participants`,
                method: "POST",
                body: { participantIds },
            }),
            invalidatesTags: (result, error, { chatId }) => ["Chat"],
            transformResponse: (response: any) => response.data,
        }),
        removeParticipant: builder.mutation<Chat, { chatId: string; participantId: string }>({
            query: ({ chatId, participantId }) => ({
                url: `/chats/${chatId}/participants/${participantId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { chatId }) => ["Chat"],
            transformResponse: (response: any) => response.data,
        }),
        deleteChat: builder.mutation<void, string>({
            query: (chatId) => ({
                url: `/chats/${chatId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Chat"],
        }),
    }),
});

export const {
    useGetChatsQuery,
    useGetMessagesQuery,
    useInitiateChatMutation,
    useMarkChatReadMutation,
    useSendMessageHttpMutation,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useAddParticipantsMutation,
    useRemoveParticipantMutation,
    useDeleteChatMutation,
} = chatApi;
