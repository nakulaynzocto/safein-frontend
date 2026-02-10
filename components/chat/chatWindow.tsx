import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, Check, CheckCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatInput } from "./chatInput";
import { formatName } from "@/utils/helpers";

interface Message {
    id: string;
    senderId: string;
    senderName?: string;
    senderAvatar?: string;
    text: string;
    createdAt: Date;
    read?: boolean;
    files?: { url: string; name: string; type: string }[];
}

interface ChatWindowProps {
    messages: Message[];
    activeUser?: {
        id: string;
        name: string;
        avatar?: string;
        isOnline?: boolean;
        role?: string;
        email?: string;
    };
    currentUser: { id: string };
    onSendMessage: (text: string) => void;
    onBack: () => void;
    onSettings?: () => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isFetching?: boolean;
    className?: string;
}

export function ChatWindow({
    messages,
    activeUser,
    currentUser,
    onSendMessage,
    onBack,
    onSettings,
    onLoadMore,
    hasMore,
    isFetching,
    className,
}: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastScrollHeight = useRef<number>(0);
    const isInitialLoad = useRef<boolean>(true);

    // Auto-scroll logic
    useEffect(() => {
        if (!scrollRef.current) return;

        const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
        const isNearBottom = scrollHeight - clientHeight - scrollTop < 100;

        // If we just loaded MORE messages (pagination), adjust scroll to keep position
        if (lastScrollHeight.current > 0) {
            const newScrollHeight = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop = newScrollHeight - lastScrollHeight.current;
            lastScrollHeight.current = 0;
        }
        // If it's the first time loading the chat OR we are near the bottom
        else if (isInitialLoad.current || isNearBottom) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            isInitialLoad.current = false;
        }
    }, [messages]);

    // Reset initial load flag when active user changes
    useEffect(() => {
        isInitialLoad.current = true;
    }, [activeUser?.id]);

    if (!activeUser) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full bg-gray-50/50", className)}>
                <div className="flex flex-col items-center text-center p-8 max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-blue-50/80 rounded-full flex items-center justify-center mb-6 shadow-xs ring-4 ring-white">
                        <span className="text-4xl filter drop-shadow-sm">💬</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">Welcome to SafeIn Chat</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Select a conversation from the sidebar to start messaging with your team.
                    </p>
                    <Button onClick={onBack} variant="outline" className="md:hidden w-full max-w-xs rounded-full border-blue-200 text-blue-700 hover:bg-blue-50">
                        View Conversations
                    </Button>
                </div>
            </div>
        );
    }

    // Helper to format time
    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight } = e.currentTarget;

        // If scrolled to top and has more messages, load them
        if (scrollTop === 0 && hasMore && onLoadMore && !isFetching) {
            lastScrollHeight.current = scrollHeight;
            onLoadMore();
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-[#f8fafc] overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-2 hover:bg-gray-100 rounded-full"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <AvatarImage src={activeUser.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#074463] to-[#0a5a82] text-white font-bold">
                                {formatName(activeUser.name).charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        {activeUser.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                            {formatName(activeUser.name)}
                        </h2>
                        <span className="text-[11px] text-gray-500 font-medium">
                            {activeUser.role === 'group' || (activeUser as any).isGroup
                                ? activeUser.email // Shows participant count
                                : activeUser.isOnline ? "Online" : "Offline"
                            }
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={onSettings} variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#074463] hover:bg-blue-50/50 rounded-full transition-all">
                        <Info className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200"
            >
                {/* Loader for older messages */}
                {isFetching && (
                    <div className="flex justify-center py-4">
                        <div className="flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                        </div>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4 py-10 opacity-60">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-2">
                            <span className="text-4xl grayscale">👋</span>
                        </div>
                        <div>
                            <p className="text-base font-medium text-gray-500">No messages yet</p>
                            <p className="text-xs text-gray-400">Say hello to start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = msg.senderId === currentUser.id;
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];
                        const isFirstInSequence = prevMsg?.senderId !== msg.senderId;
                        const isLastInSequence = nextMsg?.senderId !== msg.senderId;

                        return (
                            <div key={msg.id} className={cn(
                                "flex w-full gap-2 items-start",
                                isOwn ? "flex-row-reverse" : "flex-row",
                                isFirstInSequence ? "mt-4" : "mt-1"
                            )}>
                                {/* Avatar */}
                                <div className="w-8 shrink-0 flex items-start">
                                    {!isOwn && isFirstInSequence ? (
                                        <div className="pt-1">
                                            <Avatar className="h-8 w-8 border border-white shadow-sm">
                                                <AvatarImage src={msg.senderAvatar} />
                                                <AvatarFallback className="bg-gray-100 text-[#074463] text-[10px] font-bold">
                                                    {formatName(msg.senderName || "U").charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ) : (
                                        <div className="w-8" />
                                    )}
                                </div>

                                <div className={cn(
                                    "flex flex-col max-w-[85%] sm:max-w-[70%]",
                                    isOwn ? "items-end text-right" : "items-start text-left"
                                )}>
                                    <div className={cn(
                                        "px-4 py-2.5 shadow-sm text-[14px] break-words whitespace-pre-wrap relative transition-all duration-200",
                                        isOwn
                                            ? "bg-[#074463] text-white rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#074463] to-[#0a5a82]"
                                            : "bg-white text-gray-800 border border-gray-100/50 rounded-2xl rounded-tl-sm hover:shadow-md"
                                    )}>
                                        {!isOwn && (activeUser?.role === 'group' || (activeUser as any)?.isGroup) && isFirstInSequence && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[12px] font-bold text-[#128c7e] tracking-tight">
                                                    ~ {formatName(msg.senderName || "Unknown")}
                                                </span>
                                            </div>
                                        )}
                                        {msg.text}

                                        <div className={cn(
                                            "text-[10px] mt-1 flex items-center justify-end gap-1 select-none opacity-80",
                                            isOwn ? "text-blue-100" : "text-gray-400"
                                        )}>
                                            <span>{formatTime(msg.createdAt)}</span>
                                            {isOwn && (
                                                msg.read
                                                    ? <CheckCheck className="h-3 w-3 text-blue-500" strokeWidth={2.5} />
                                                    : <Check className="h-3 w-3" strokeWidth={2.5} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div className="h-2" /> {/* Spacer */}
            </div>

            {/* Input Area */}
            <ChatInput onSendMessage={onSendMessage} isAdmin={currentUser.id === "admin"} />
        </div>
    );
}
