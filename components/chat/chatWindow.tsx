import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, Check, CheckCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatInput } from "./InternalChatInput";
import { formatName, getInitials } from "@/utils/helpers";

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

    // Visual Viewport logic for mobile keyboard
    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            if (scrollRef.current) {
                // When keyboard appears, scroll to bottom
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        };

        window.visualViewport.addEventListener('resize', handleResize);
        return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }, []);

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
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
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
        <div className={cn("flex flex-col h-full bg-[#e5ddd5] dark:bg-gray-950 relative overflow-hidden", className)}>
            {/* Background Pattern Overlay (WhatsApp Style) */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-white border-b shadow-sm z-30 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-1 h-8 w-8 hover:bg-gray-100 rounded-full"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                    <div className="relative">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <AvatarImage src={activeUser.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#074463] to-[#0a5a82] text-white text-xs sm:text-sm font-bold flex items-center justify-center leading-none">
                                {getInitials(activeUser.name)}
                            </AvatarFallback>
                        </Avatar>
                        {activeUser.isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-none">
                            {formatName(activeUser.name)}
                        </h2>
                        <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                            {activeUser.role === 'group' || (activeUser as any).isGroup
                                ? activeUser.email // Shows participant count
                                : activeUser.isOnline ? "Online" : "Offline"
                            }
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    {(activeUser?.role === 'group' || (activeUser as any)?.isGroup) && (
                        <Button onClick={onSettings} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#074463] hover:bg-blue-50/50 rounded-full">
                            <Info className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 space-y-1 z-10 scrollbar-none overscroll-contain"
            >
                {/* Loader for older messages */}
                {isFetching && (
                    <div className="flex justify-center py-4">
                        <div className="flex gap-1.5 items-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-[10px] font-medium text-gray-500">
                             Loading older messages...
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
                    <div className="flex flex-col gap-1">
                        {messages.map((msg, index) => {
                            const isOwn = msg.senderId === currentUser.id;
                            const prevMsg = messages[index - 1];
                            const nextMsg = messages[index + 1];
                            const isFirstInSequence = prevMsg?.senderId !== msg.senderId;
                            const isLastInSequence = nextMsg?.senderId !== msg.senderId;

                            return (
                                <div key={msg.id} className={cn(
                                    "flex w-full gap-2 items-end mb-0.5",
                                    isOwn ? "justify-end" : "justify-start",
                                    isFirstInSequence ? "mt-4" : "mt-0"
                                )}>
                                    {/* Avatar - Only show for received messages, last in sequence */}
                                    {!isOwn && (
                                        <div className="w-8 shrink-0">
                                            {isLastInSequence ? (
                                                <Avatar className="h-8 w-8 border border-white shadow-sm ring-1 ring-gray-100">
                                                    <AvatarImage src={msg.senderAvatar} />
                                                    <AvatarFallback className="bg-gray-200 text-[#074463] text-[10px] font-bold">
                                                        {getInitials(msg.senderName || "U")}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : <div className="w-8" />}
                                        </div>
                                    )}

                                    <div className={cn(
                                        "flex flex-col max-w-[85%] sm:max-w-[70%]",
                                        isOwn ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-3 py-1.5 shadow-sm text-sm sm:text-[15px] break-words whitespace-pre-wrap relative",
                                            isOwn
                                                ? "bg-[#dcf8c6] text-gray-800 rounded-lg rounded-tr-none"
                                                : "bg-white text-gray-800 rounded-lg rounded-tl-none border border-gray-100",
                                            !isLastInSequence && isOwn && "rounded-tr-lg",
                                            !isLastInSequence && !isOwn && "rounded-tl-lg",
                                            "hover:shadow-md transition-shadow duration-200"
                                        )}>
                                            {!isOwn && (activeUser?.role === 'group' || (activeUser as any)?.isGroup) && isFirstInSequence && (
                                                <div className="text-[12px] font-bold text-[#128c7e] mb-0.5">
                                                     {formatName(msg.senderName || "Unknown")}
                                                </div>
                                            )}
                                            {msg.text}

                                            <div className={cn(
                                                "text-[9px] mt-1 flex items-center justify-end gap-1 select-none opacity-60 leading-none",
                                                isOwn ? "text-gray-600" : "text-gray-400"
                                            )}>
                                                <span>{formatTime(msg.createdAt)}</span>
                                                {isOwn && (
                                                    msg.read
                                                        ? <CheckCheck className="h-3 w-3 text-blue-500" strokeWidth={3} />
                                                        : <Check className="h-3 w-3" strokeWidth={3} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="h-4" /> {/* Spacer */}
            </div>

            <div className="z-30 shrink-0">
                <ChatInput onSendMessage={onSendMessage} isAdmin={currentUser.id === "admin"} />
            </div>
        </div>
    );
}
