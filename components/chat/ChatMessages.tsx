import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Constants
const GRADIENT_PRIMARY = "linear-gradient(135deg, #074463 0%, #3882a5 100%)";

interface Message {
    sender: string;
    senderId?: string;
    content: string;
    createdAt: Date;
}

interface User {
    id?: string;
    email?: string;
    name?: string;
    profilePicture?: string;
}

interface ChatMessagesProps {
    messages: Message[];
    user: User | null;
    isTyping: boolean;
    isLoading: boolean;
    scrollRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    user,
    isTyping,
    isLoading,
    scrollRef
}) => {
    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4"
        >
            {/* User Identity Info */}
            <div className="flex flex-col items-center mb-6 pt-2 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <Avatar className="w-14 h-14 border-3 border-white shadow-xl ring-2 ring-[#98c7dd]/30 dark:ring-[#074463]/50 mb-3">
                        <AvatarImage src={user?.profilePicture || ""} />
                        <AvatarFallback
                            className="text-white font-bold text-lg"
                            style={{ background: GRADIENT_PRIMARY }}
                        >
                            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {user?.name || user?.email?.split('@')[0] || "Supporter"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "Authenticated"}</p>
            </div>

            {messages.map((msg, i) => {
                // Improved isMe logic: Check sender type and sender id/email
                // Note: Frontend user is 'user'. Backend agent is 'agent'.
                const isMe = msg.sender === "user" ||
                    (user?.id && msg.senderId === user.id) ||
                    (user?.email && msg.senderId === user.email);

                return (
                    <div key={i} className={cn("flex w-full mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[80%] flex flex-col",
                            isMe ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "px-4 py-2.5 text-sm shadow-lg relative group",
                                isMe
                                    ? "text-white rounded-2xl rounded-tr-md"
                                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-md"
                            )}
                                style={isMe ? { background: GRADIENT_PRIMARY } : {}}
                            >
                                <p className="leading-relaxed">{msg.content}</p>
                                <div className={cn(
                                    "text-[9px] mt-1 flex justify-end items-center gap-1.5",
                                    isMe ? "text-blue-100" : "text-gray-400"
                                )}>
                                    {format(new Date(msg.createdAt), "HH:mm")}
                                    {isMe && <CheckCheck className="w-3 h-3" />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Typing Indicator */}
            {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            )}

            {messages.length === 0 && !isLoading && (
                <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-10 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#98c7dd]/20 to-[#3882a5]/20 dark:from-[#074463]/20 dark:to-[#3882a5]/20 flex items-center justify-center mb-3">
                        <MessageSquare className="w-8 h-8 text-[#074463]" />
                    </div>
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-xs">Type your message below to begin</p>
                </div>
            )}
        </div>
    );
};
