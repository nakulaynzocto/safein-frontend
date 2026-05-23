import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCheck, Check, ImageIcon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from "next/image";

interface Message {
    sender: string;
    senderId?: string;
    content: string;
    createdAt: Date;
    readAt?: Date;
    attachments?: Array<{ url: string; name: string; type: string }>;
}

interface User {
    id?: string;
    _id?: string;
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
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#e5ddd5] dark:bg-slate-950/50"
            style={{
                backgroundImage: `url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-graphy-patterns-r-v-thumbnail.jpg")`,
                backgroundSize: '400px',
                backgroundBlendMode: 'overlay'
            }}
        >
            {messages.map((msg, i) => {
                // Enhanced isMe logic for frontend (User side)
                const isMe = msg.sender === "user";

                return (
                    <div key={i} className={cn("flex w-full mb-1 animate-in fade-in slide-in-from-bottom-1 duration-300", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[85%] sm:max-w-[75%] flex flex-col relative",
                            isMe ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "px-3 py-2 text-[14px] shadow-sm relative transition-all duration-300",
                                isMe
                                    ? "bg-[#dcf8c6] dark:bg-[#056162] text-gray-800 dark:text-white rounded-lg rounded-tr-none"
                                    : "bg-white dark:bg-[#262d31] text-gray-800 dark:text-white rounded-lg rounded-tl-none"
                            )}>
                                {/* Bubble Tail */}
                                <div className={cn(
                                    "absolute top-0 w-3 h-4",
                                    isMe 
                                        ? "right-[-8px] bg-[#dcf8c6] dark:bg-[#056162]" 
                                        : "left-[-8px] bg-white dark:bg-[#262d31]"
                                )} 
                                style={{
                                    clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)'
                                }}/>

                                {msg.attachments && msg.attachments.filter(f => f.url).length > 0 && (
                                    <div className={cn(
                                        "mb-1.5 space-y-2 rounded-md overflow-hidden",
                                        msg.attachments.filter(f => f.url).length > 1 ? "grid grid-cols-2 gap-1.5 space-y-0" : ""
                                    )}>
                                        {msg.attachments.filter(f => f.url).map((file, i) => (
                                            <div 
                                                key={i} 
                                                className="relative aspect-square min-w-[150px] sm:min-w-[200px] cursor-pointer hover:opacity-95 transition-all"
                                                onClick={() => window.open(file.url, '_blank')}
                                            >
                                                <Image 
                                                    src={file.url} 
                                                    alt={file.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={file.url.endsWith('.gif') || file.url.startsWith('data:')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="relative">
                                    {!isMe && (
                                        <span className="text-xs font-bold text-[#075e54] dark:text-[#25d366] block mb-1">
                                            SafeIn Support
                                        </span>
                                    )}
                                    {msg.content && <p className="text-[14.2px] leading-[1.4] whitespace-pre-wrap pr-14 pb-1">{msg.content}</p>}
                                </div>
                                
                                <div className={cn(
                                    "text-xs mt-1 flex justify-end items-center gap-1 absolute bottom-1 right-2",
                                    isMe ? "text-gray-500 dark:text-gray-300" : "text-gray-400"
                                )}>
                                    {format(new Date(msg.createdAt), "HH:mm")}
                                    {isMe && (
                                        msg.readAt ? (
                                            <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1]" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Typing Indicator */}
            {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-[#262d31] rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            )}

            {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-full mb-4">
                        <MessageSquare className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">End-to-end encrypted</p>
                </div>
            )}
        </div>
    );
};
