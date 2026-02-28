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

    // Helper to format date groups
    const getDateDivider = (date: Date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return "Today";
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    };

    if (!activeUser) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full bg-[#f8fbff] dark:bg-gray-950 px-6", className)}>
                <div className="flex flex-col items-center text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-28 w-28 bg-white dark:bg-gray-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-100/50 dark:shadow-none border border-blue-50/50 dark:border-gray-800 relative group transition-transform hover:scale-105">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                        <span className="text-5xl filter drop-shadow-md relative z-10 transition-transform group-hover:rotate-12">📨</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight font-sans">Chat Messaging</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed text-[15px] font-medium">
                        Seamlessly connect with your team. Select a conversation to start collaborating in real-time.
                    </p>
                    <Button 
                        onClick={onBack} 
                        className="md:hidden w-full h-12 rounded-2xl bg-[#074463] hover:bg-[#05334a] text-white shadow-lg shadow-blue-900/10 font-bold transition-all active:scale-95"
                    >
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
        <div className={cn("flex flex-col h-full bg-[#f0f2f5] dark:bg-gray-950 relative overflow-hidden", className)}>
            {/* Soft Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[30%] bg-[#074463]/10 blur-[100px] rounded-full"></div>
                {/* Subtle pattern layer */}
                <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay dark:opacity-[0.1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-30 shrink-0 sticky top-0 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-2 h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </Button>
                    <div className="relative group cursor-pointer">
                        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-white dark:border-gray-800 shadow-md ring-1 ring-blue-50 dark:ring-gray-700 group-hover:ring-blue-100 transition-all">
                            <AvatarImage src={activeUser.avatar} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-[#074463] to-[#0a5a82] text-white text-[13px] font-bold">
                                {getInitials(activeUser.name)}
                            </AvatarFallback>
                        </Avatar>
                        {activeUser.isOnline && (
                            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base sm:text-[17px] font-extrabold text-gray-900 dark:text-gray-100 leading-tight tracking-tight truncate max-w-[160px] sm:max-w-none hover:text-[#074463] transition-colors cursor-pointer">
                            {formatName(activeUser.name)}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {activeUser.isOnline && <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                            <span className={cn(
                                "text-[11px] font-semibold uppercase tracking-wider",
                                activeUser.isOnline ? "text-green-600 dark:text-green-400" : "text-gray-400"
                            )}>
                                {activeUser.role === 'group' || (activeUser as any).isGroup
                                    ? activeUser.email // Participant summary
                                    : activeUser.isOnline ? "Active Now" : "Currently Away"
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#074463] hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90">
                        <Phone className="h-[18px] w-[18px]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#074463] hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90">
                        <Video className="h-[18px] w-[18px]" />
                    </Button>
                    {(activeUser?.role === 'group' || (activeUser as any)?.isGroup) && (
                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                    )}
                    {(activeUser?.role === 'group' || (activeUser as any)?.isGroup) && (
                        <Button onClick={onSettings} variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#074463] hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90">
                            <Info className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 space-y-4 z-10 scroll-smooth overscroll-contain no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Loader for older messages */}
                {isFetching && (
                    <div className="flex justify-center mb-6 sticky top-2 z-20">
                        <div className="flex gap-2 items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 text-[11px] font-bold text-[#074463] dark:text-blue-400 animate-in fade-in zoom-in">
                             <div className="h-3 w-3 border-2 border-[#074463] border-t-transparent rounded-full animate-spin"></div>
                             LOADING MESSAGES
                        </div>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-1000">
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-10 rounded-[3rem] border border-white dark:border-gray-800 shadow-xl mb-6 relative">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-[3rem] animate-pulse"></div>
                            <span className="text-6xl filter drop-shadow-sm relative z-10">👋</span>
                        </div>
                        <div className="relative z-10 max-w-xs">
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No conversations yet</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Don't be shy! Break the ice and send your first message to start the magic.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {messages.map((msg, index) => {
                            const isOwn = msg.senderId === currentUser.id;
                            const prevMsg = messages[index - 1];
                            const nextMsg = messages[index + 1];
                            const isFirstInSequence = prevMsg?.senderId !== msg.senderId;
                            const isLastInSequence = nextMsg?.senderId !== msg.senderId;
                            
                            // Date Divider Logic
                            const showDateDivider = !prevMsg || 
                                new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                            return (
                                <div key={msg.id}>
                                    {showDateDivider && (
                                        <div className="flex justify-center my-8 sticky top-0 z-20">
                                            <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                                                {getDateDivider(msg.createdAt)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={cn(
                                        "flex w-full gap-3 items-end group",
                                        isOwn ? "justify-end" : "justify-start",
                                        isFirstInSequence ? "mt-4" : "mt-0.5"
                                    )}>
                                        {/* Avatar Layer */}
                                        {!isOwn && (
                                            <div className="w-8 shrink-0 relative">
                                                {isLastInSequence ? (
                                                    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm transition-transform hover:scale-110">
                                                        <AvatarImage src={msg.senderAvatar} />
                                                        <AvatarFallback className="bg-blue-100 dark:bg-gray-800 text-[#074463] dark:text-blue-400 text-[10px] font-black">
                                                            {getInitials(msg.senderName || "U")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}

                                        <div className={cn(
                                            "flex flex-col max-w-[82%] sm:max-w-[75%]",
                                            isOwn ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-2.5 shadow-sm text-[15px] sm:text-[16px] break-words whitespace-pre-wrap relative transition-all duration-300",
                                                isOwn
                                                    ? "bg-[#074463] text-white rounded-[1.25rem] rounded-tr-[0.25rem] shadow-[#074463]/10"
                                                    : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-[1.25rem] rounded-tl-[0.25rem] border border-gray-100 dark:border-gray-800 shadow-gray-200/40 dark:shadow-none",
                                                !isFirstInSequence && isOwn && "rounded-tr-[1.25rem] mt-0.5",
                                                !isFirstInSequence && !isOwn && "rounded-tl-[1.25rem] mt-0.5",
                                                "group-hover:shadow-lg dark:group-hover:shadow-gray-900/50"
                                            )}>
                                                {!isOwn && (activeUser?.role === 'group' || (activeUser as any)?.isGroup) && isFirstInSequence && (
                                                    <div className="text-[12px] font-bold text-blue-600 dark:text-blue-400 mb-1 leading-none tracking-tight">
                                                         {formatName(msg.senderName || "Unknown")}
                                                    </div>
                                                )}
                                                <div className="leading-relaxed font-medium tracking-tight">
                                                    {msg.text}
                                                </div>

                                                <div className={cn(
                                                    "text-[10px] mt-1.5 flex items-center justify-end gap-1.5 select-none leading-none font-bold",
                                                    isOwn ? "text-blue-100/70" : "text-gray-400 dark:text-gray-500"
                                                )}>
                                                    <span>{formatTime(msg.createdAt)}</span>
                                                    {isOwn && (
                                                        msg.read
                                                            ? <CheckCheck className="h-3.5 w-3.5 text-blue-300" strokeWidth={3} />
                                                            : <Check className="h-3.5 w-3.5 opacity-60" strokeWidth={3} />
                                                    )}
                                                </div>
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

            {/* Input Overlay Shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-200/50 dark:from-gray-950/80 to-transparent pointer-events-none z-20"></div>

            <div className="z-30 shrink-0 relative">
                <ChatInput onSendMessage={onSendMessage} isAdmin={currentUser.id === "admin"} />
            </div>
        </div>
    );
}
