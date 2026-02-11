"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageSquareText, Sparkles, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { supportSocketService } from "@/lib/support-socket";
import { useLazyGetTicketHistoryQuery } from "@/store/api/supportApi";
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

        if (user && token) {
            setUserMode("employee");
            socket = supportSocketService.connect(token, undefined);
            socketRef.current = socket;
        } else {
            const savedGoogleToken = localStorage.getItem("safein_support_g_token");
            if (savedGoogleToken) {
                setGoogleToken(savedGoogleToken);
                setUserMode("public_verified");
                socket = supportSocketService.connect(undefined, savedGoogleToken);
                socketRef.current = socket;
            } else {
                setUserMode("none");
                return;
            }
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
            if (err.message && err.message.includes("Authentication error")) {
                console.error("Auth failed, clearing session...");
                localStorage.removeItem("safein_support_g_token");
                setGoogleToken(null);
                setUserMode("none");
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
    }, [user, token, mounted, googleToken]); // Added googleToken here

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
        // If reconnecting, rejoin ticket room and fetch history
        const savedTicket = localStorage.getItem("safein_support_ticket_id");

        if (!savedTicket) {
            return;
        }


        setTicketId(savedTicket);
        socket.emit("join_ticket", savedTicket);

        // Fetch history via RTK Query
        fetchHistory(savedTicket).unwrap().then((data) => {
            if (data && data.messages) {

                setMessages(data.messages);
            }
        }).catch(err => {
            console.error("[SupportWidget] History fetch failed:", err);
            // If ticket not found (404), clear it so a new one can be created
            if (err.status === 404) {
                console.log("[SupportWidget] Stale ticket ID found, clearing...");
                localStorage.removeItem("safein_support_ticket_id");
                setTicketId(null);
                setMessages([]);
            }

            // If auth failed, clear session
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

    // Google Login Hook
    const loginWithGoogle = useGoogleLogin({
        scope: "email profile", // Explicitly request email and profile
        onSuccess: async (tokenResponse) => {
            // We use the access_token or id_token depending on backend requirement
            // Usually for "Sign In with Google" backend needs ID Token
            // But typical prompt gives Access Token. 
            // Let's assume we fetch user info or exchange.
            // Simplified: We really need ID Token (JWT) from Google.
            // Use 'id_token' flow if configured, but let's try getting profile info then.

            // NOTE: Ideally use `google - auth - library` on backend with ID Token.
            // For now, let's assume we pass the access token to backend and let it verify via introspection API?
            // OR use `response_type: "id_token"` in config.

            // Let's simulate we have a token to identifying user:
            const gToken = tokenResponse.access_token; // Or ID Token

            // IMPORTANT: In production, pass ID Token. Here passing access_token for now.
            localStorage.setItem("safein_support_g_token", gToken);
            setGoogleToken(gToken);
            setUserMode("public_verified");
            // No need to call connectSocket, the useEffect will handle it because googleToken changed
        },
        onError: () => {
            console.error("Google Login Failed");
            toast.error("Login Failed");
        }
    });

    // Helper for refresh
    const refreshHistory = () => {
        if (socketRef.current) {
            syncTicketAndHistory(socketRef.current);
            toast.success("Refreshing history...");
        } else {
            toast.error("Not connected");
        }
    };
    const handleSendMessage = () => {
        if (!input.trim() || !socketRef.current) return;

        const msgContent = input;
        setInput(""); // Optimistic clear
        setIsSending(true);

        if (!ticketId) {
            // First Message -> Create Ticket
            socketRef.current.emit("create_ticket", { subject: "Support Chat", message: msgContent }, (response: any) => {
                setIsSending(false);
                if (response.status === "ok") {
                    setTicketId(response.ticket.ticketId);
                    localStorage.setItem("safein_support_ticket_id", response.ticket.ticketId);
                    setMessages([response.message]);
                } else {
                    alert("Failed to start chat. Please try again.");
                }
            });
        } else {
            // Append Message
            socketRef.current.emit("send_message", { ticketId, content: msgContent }, (response: any) => {
                setIsSending(false);
                if (response.status !== "ok") {
                    alert("Failed to send message");
                }
            });
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out border border-gray-100 dark:border-slate-800",
                        isExpanded
                            ? "fixed inset-0 sm:inset-4 w-full h-full sm:w-auto sm:h-auto rounded-none sm:rounded-3xl"
                            : "fixed bottom-0 right-0 w-full h-[100dvh] sm:absolute sm:bottom-20 sm:right-0 sm:w-[400px] sm:h-[600px] rounded-none sm:rounded-3xl"
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
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ background: GRADIENT_ACCENT }}>
                                        <Sparkles className="w-4 h-4 text-white" />
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

                        {/* B. Chat Area (Employee OR Verified Public) */}
                        {(userMode === "employee" || userMode === "public_verified") && (
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
                    className="group relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
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
