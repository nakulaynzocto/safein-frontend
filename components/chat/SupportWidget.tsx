"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageSquareText, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { supportSocketService } from "@/lib/support-socket";
import { useLazyGetTicketHistoryQuery, useCreateTicketMutation, useSendMessageMutation } from "@/store/api/supportApi";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAssistantOpen } from '@/store/slices/uiSlice';

// Project color scheme - matching your existing brand
const GRADIENT_PRIMARY = "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)";
const GRADIENT_ACCENT = "linear-gradient(135deg, var(--accent) 0%, var(--primary-light) 100%)";
const COLOR_PRIMARY = "var(--primary)";
const COLOR_ACCENT = "var(--accent)";

export default function SupportWidget() {
    const dispatch = useAppDispatch();
    const { isAssistantOpen: isOpen } = useAppSelector((state) => state.ui);
    const setIsOpen = (val: boolean) => dispatch(setAssistantOpen(val));
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    // Authentication State
    // "employee" | "public_pending" | "public_verified" | "none"
    const [userMode, setUserMode] = useState<string>("none");
    const [googleToken, setGoogleToken] = useState<string | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const { user, token, isAuthenticated, isCurrentRoutePrivate } = useAuthSubscription(); // Get employee session if logged in
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const isOpenRef = useRef(isOpen);

    // RTK Query hooks
    const [fetchHistory] = useLazyGetTicketHistoryQuery();
    const [restCreateTicket] = useCreateTicketMutation();
    const [restSendMessage] = useSendMessageMutation();

    // --- Effects ---

    // Fix Hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Keep ref in sync with isOpen state
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // 1. Check Initial Auth Status
    // Unified Socket Effect
    useEffect(() => {
        if (!mounted) return;

        let socket: any = null;

        const savedGoogleToken = localStorage.getItem("safein_support_g_token");
        // Hard check to ensure it's not a string "undefined" or empty
        if (savedGoogleToken && savedGoogleToken !== "undefined" && savedGoogleToken !== "null") {
            setGoogleToken(savedGoogleToken);
            setUserMode("public_verified");
            socket = supportSocketService.connect(undefined, savedGoogleToken);
            socketRef.current = socket;
        } else {
            if (savedGoogleToken) localStorage.removeItem("safein_support_g_token");
            setUserMode("none");
            return;
        }

        if (!socket) return;

        const onConnect = () => {
            setIsConnected(true);
            setIsLoading(false);
            syncTicketAndHistory(socket);
        };

        const onReceiveMessage = (msg: any) => {
            setMessages((prev) => {
                if (msg._id && prev.some(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });

            // Increment unread count if widget is closed and message is from agent/support
            if (!isOpenRef.current && msg.sender === "agent") {
                setUnreadCount((prev) => prev + 1);
            }
        };

        const onConnectError = (err: any) => {
            setIsLoading(false);
            // Handle both "Authentication error" and "Authentication failed" messages
            if (err.message && (err.message.includes("Authentication error") || err.message.includes("Authentication failed"))) {
                console.warn("[Support Chat] Auth failed, reverting to guest mode...");
                localStorage.removeItem("safein_support_g_token");
                setGoogleToken(null);
                setUserMode("none");
                // Stop the socket from constantly retrying with a bad token
                if (socket) socket.disconnect();
            } else {
                console.error("[Support Chat] Connection error:", err.message);
            }
        };

        const onDisconnect = () => setIsConnected(false);

        if (socket.connected) {
            onConnect();
        } else {
            setIsLoading(true);
        }

        socket.on("connect", onConnect);
        socket.on("receive_message", onReceiveMessage);
        socket.on("connect_error", onConnectError);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("receive_message", onReceiveMessage);
            socket.off("connect_error", onConnectError);
            socket.off("disconnect", onDisconnect);
        };
    }, [mounted, googleToken]);

    // 2. Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // 3. Reset unread count when widget is opened
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // --- Handlers ---

    const syncTicketAndHistory = (socket: any) => {
        const savedTicket = localStorage.getItem("safein_support_ticket_id");
        if (!savedTicket) return;

        setTicketId(savedTicket);
        socket.emit("join_ticket", savedTicket);

        fetchHistory(savedTicket).unwrap().then((data) => {
            if (data?.messages) {
                setMessages(data.messages);
            }
        }).catch(err => {
            if (err.status === 404) {
                localStorage.removeItem("safein_support_ticket_id");
                setTicketId(null);
                setMessages([]);
            }
            if (err.status === 401 || err.status === 403) {
                if (userMode === "public_verified") {
                    localStorage.removeItem("safein_support_g_token");
                    localStorage.removeItem("safein_support_ticket_id");
                    setGoogleToken(null);
                    setUserMode("none");
                    setTicketId(null);
                }
            }
        });
    };

    const loginWithGoogle = useGoogleLogin({
        scope: "email profile",
        onSuccess: async (tokenResponse) => {
            const gToken = tokenResponse.access_token;
            localStorage.setItem("safein_support_g_token", gToken);
            setGoogleToken(gToken);
            setUserMode("public_verified");
        },
        onError: () => {
            toast.error("Google Login Failed");
        }
    });

    const refreshHistory = () => {
        if (socketRef.current) {
            syncTicketAndHistory(socketRef.current);
            toast.success("Refreshing history...");
        } else {
            toast.error("Not connected");
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const msgContent = input;
        setInput("");
        setIsSending(true);

        // Use Socket if connected, otherwise fallback to REST
        if (socketRef.current && isConnected) {
            if (!ticketId) {
                // Create ticket via socket
                socketRef.current.emit("create_ticket", { subject: "Support Chat", message: msgContent }, (response: any) => {
                    setIsSending(false);
                    if (response.status === "ok") {
                        const newTicketId = response.ticket.ticketId;
                        setTicketId(newTicketId);
                        localStorage.setItem("safein_support_ticket_id", newTicketId);

                        // Force a history sync to get the auto-reply message from server immediately
                        syncTicketAndHistory(socketRef.current);
                    } else {
                        setInput(msgContent);
                        toast.error(response.message || "Failed to start chat");
                    }
                });
            } else {
                // Send message via socket
                socketRef.current.emit("send_message", { ticketId, content: msgContent }, (response: any) => {
                    setIsSending(false);
                    if (response.status === "ok") {
                        setMessages(prev => {
                            if (prev.some(m => m._id === response.message._id)) return prev;
                            return [...prev, response.message];
                        });
                    } else {
                        setInput(msgContent);
                        toast.error(response.message || "Failed to send message");
                    }
                });
            }
            return;
        }

        // Fallback to REST API if socket not connected
        try {
            if (!ticketId) {
                const response: any = await restCreateTicket({ subject: "Support Chat", message: msgContent }).unwrap();
                setIsSending(false);
                if (response.success) {
                    setTicketId(response.data.ticket.ticketId);
                    localStorage.setItem("safein_support_ticket_id", response.data.ticket.ticketId);
                    setMessages(prev => {
                        if (prev.some(m => m._id === response.data.message._id)) return prev;
                        return [...prev, response.data.message];
                    });
                }
            } else {
                const response: any = await restSendMessage({ ticketId, content: msgContent }).unwrap();
                setIsSending(false);
                if (response.success) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === response.data._id)) return prev;
                        return [...prev, response.data];
                    });
                }
            }
        } catch (error: any) {
            setIsSending(false);
            setInput(msgContent);
            toast.error(error.data?.message || "Connection error. Please try again.");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // --- Render ---

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-end justify-end p-4 sm:p-6 font-sans">
            {/* 1. Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out border border-gray-100 dark:border-slate-800 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500",
                        isExpanded
                            ? "fixed inset-0 sm:inset-10 w-full h-full sm:w-auto sm:h-auto rounded-none sm:rounded-3xl"
                            : "w-full sm:w-[400px] h-[500px] sm:h-[650px] max-h-[calc(100dvh-100px)] rounded-3xl mb-4"
                    )}
                >
                    {/* A. Header */}
                    <ChatHeader
                        refreshHistory={refreshHistory}
                        toggleExpand={() => setIsExpanded(!isExpanded)}
                        closeChat={() => setIsOpen(false)}
                        isExpanded={isExpanded}
                        isConnected={isConnected}
                    />

                    {/* Content Area */}
                    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col min-h-0">
                        {/* A. If not Logged In (Public) */}
                        {userMode === "none" && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 relative">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <div className="absolute top-10 left-10 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
                                    <div className="absolute bottom-10 right-10 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl"></div>
                                </div>

                                <div className="relative">
                                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-in zoom-in duration-500" style={{ background: GRADIENT_PRIMARY }}>
                                        <MessageSquare className="w-10 h-10 text-white" />
                                    </div>

                                </div>

                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-xl">Welcome! 👋</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] leading-relaxed">
                                        Get instant support from our team. Sign in with Google to start chatting.
                                    </p>
                                </div>

                                <Button
                                    onClick={() => loginWithGoogle()}
                                    className="w-full bg-white dark:bg-slate-800 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-slate-700 hover:border-accent dark:hover:border-accent hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 h-12 rounded-xl font-semibold group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Continue with Google
                                </Button>

                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 animate-in fade-in duration-700 delay-500">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Secure & encrypted • We'll notify you via email
                                </p>
                            </div>
                        )}

                        {/* B. Chat Area (Verified Public) */}
                        {userMode === "public_verified" && (
                            <>
                                <ChatMessages
                                    messages={messages}
                                    user={user}
                                    isTyping={isTyping}
                                    isLoading={isLoading}
                                    scrollRef={scrollRef}
                                />

                                <ChatInput
                                    input={input}
                                    setInput={setInput}
                                    handleSendMessage={handleSendMessage}
                                    handleKeyPress={handleKeyPress}
                                    isLoading={isLoading}
                                    isSending={isSending}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 2. Launcher Button (Hide on dashboard/private routes if authenticated) */}
            {(!isCurrentRoutePrivate || !isAuthenticated) && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden pointer-events-auto shrink-0"
                    style={{ background: GRADIENT_PRIMARY }}
                >
                    <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20"></div>

                    <div className="relative z-10">
                        {isOpen ? (
                            <X size={28} className="text-white transform transition-transform duration-300 group-hover:rotate-90" />
                        ) : (
                            <>
                                <MessageSquareText size={28} className="text-white transform transition-transform duration-300 group-hover:scale-110" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 items-center justify-center text-white text-[10px] font-bold shadow-lg" style={{ background: GRADIENT_ACCENT }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </button>
            )}
        </div>
    );
}
