"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageSquareText, X, Loader2, Shield } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { supportSocketService } from "@/lib/support-socket";
import { useLazyGetTicketHistoryQuery, useCreateTicketMutation, useSendMessageMutation } from "@/store/api/supportApi";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAssistantOpen, setAssistantMessage } from '@/store/slices/uiSlice';
import { useGoogleLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { isPublicActionRoute } from '@/utils/routes';

// Project color scheme - matching your existing brand
const GRADIENT_PRIMARY = "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)";
const GRADIENT_ACCENT = "linear-gradient(135deg, var(--accent) 0%, var(--primary-light) 100%)";
const COLOR_PRIMARY = "var(--primary)";
const COLOR_ACCENT = "var(--accent)";

// Types
interface Message {
    _id?: string;
    sender: "user" | "agent";
    senderId?: string;
    content: string;
    createdAt: Date;
    type?: string;
    attachments?: Array<{ url: string; name: string; type: string }>;
}

export default function SupportWidget() {
    const dispatch = useAppDispatch();
    const { isAssistantOpen: isOpen } = useAppSelector((state) => state.ui);
    const setIsOpen = (val: boolean) => dispatch(setAssistantOpen(val));
    const [messages, setMessages] = useState<Message[]>([]);
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
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { user, token, isAuthenticated, isCurrentRoutePrivate, pathname } = useAuthSubscription(); // Get employee session if logged in
    const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const isOpenRef = useRef(isOpen);

    // RTK Query hooks
    const [fetchHistory] = useLazyGetTicketHistoryQuery();
    const [restCreateTicket] = useCreateTicketMutation();
    const [restSendMessage] = useSendMessageMutation();
    const [googleLogin] = useGoogleLoginMutation();

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

        // Priority 1: Main App Session (Employee/Admin)
        if (token && isAuthenticated) {
            setUserMode("public_verified");
            // Pass both tokens if available, backend will prioritize appropriately
            socket = supportSocketService.connect(token, savedGoogleToken || undefined);
            socketRef.current = socket;
        }
        // Priority 2: Saved Google Session (Public User / Guest)
        else if (savedGoogleToken && savedGoogleToken !== "undefined" && savedGoogleToken !== "null") {
            setGoogleToken(savedGoogleToken);
            setUserMode("public_verified");
            socket = supportSocketService.connect(undefined, savedGoogleToken);
            socketRef.current = socket;
        } else {
            // Handle Logout or No Session
            // We use a small timeout to prevent flicker during fast auth transitions (like Google -> Main App)
            const timeout = setTimeout(() => {
                if (!isAuthenticating && !googleToken && !token) {
                    if (savedGoogleToken) localStorage.removeItem("safein_support_g_token");
                    setUserMode("none");
                    setMessages([]);
                    setTicketId(null);
                    localStorage.removeItem("safein_support_ticket_id");
                }
            }, 500);
            return () => clearTimeout(timeout);
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
                // If we are logged in via main app, don't revert to "none" mode immediately
                // Only revert if we were explicitly using Priority 2 (googleToken only)
                if (!token || !isAuthenticated) {
                    localStorage.removeItem("safein_support_g_token");
                    setGoogleToken(null);
                    setUserMode("none");
                } else {
                    console.warn("[Support Chat] Support socket auth failed for main app session.");
                    // Keep userMode as "public_verified" so they see the chat window loading or error state
                    // rather than being kicked back to login button
                }
                if (socket) socket.disconnect();
            } else {
                console.warn("[Support Chat] Real-time server unreachable. Falling back to REST API.", err.message);
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
    }, [mounted, googleToken, token, isAuthenticated]);

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

    // 4. Handle auto-filled message from Redux
    const { initialAssistantMessage } = useAppSelector((state) => state.ui);

    useEffect(() => {
        if (isOpen && initialAssistantMessage) {
            // Pre-fill the input
            setInput(initialAssistantMessage);
            
            // Clear the message in Redux so it doesn't keep persistent
            dispatch(setAssistantMessage(""));
            
            // Focus input if possible (this might need next tick or higher level component handle)
            // But just setting input is what was requested (auto enter / auto print)
        }
    }, [isOpen, initialAssistantMessage, dispatch, setAssistantMessage]);

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

            // ALSO log them into the main app so they are "really" logged in
            try {
                setIsAuthenticating(true);
                const result = await googleLogin({ token: gToken }).unwrap();
                if (result.token && result.user) {
                    dispatch(setCredentials(result));
                }
            } catch (err) {
                console.error("Failed to sync main app auth with support google login:", err);
            } finally {
                setIsAuthenticating(false);
            }
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
        if (!input.trim() && !uploadedFile) return;

        const msgContent = input;
        const msgAttachments = uploadedFile ? [uploadedFile] : undefined;
        
        setInput("");
        setUploadedFile(null);
        setIsSending(true);

        const eventData: any = { ticketId, content: msgContent };
        if (msgAttachments) {
            eventData.attachments = msgAttachments;
            eventData.type = "image";
        }

        // Use Socket if connected, otherwise fallback to REST
        if (socketRef.current && isConnected) {
            if (!ticketId) {
                // Create ticket via socket
                socketRef.current.emit("create_ticket", { subject: "Support Chat", message: msgContent, attachments: msgAttachments }, (response: any) => {
                    setIsSending(false);
                    if (response.status === "ok") {
                        const newTicketId = response.ticket.ticketId;
                        setTicketId(newTicketId);
                        localStorage.setItem("safein_support_ticket_id", newTicketId);

                        // Force a history sync to get the auto-reply message from server immediately
                        syncTicketAndHistory(socketRef.current);
                    } else {
                        setInput(msgContent);
                        setUploadedFile(msgAttachments?.[0] || null);
                        toast.error(response.message || "Failed to start chat");
                    }
                });
            } else {
                // Send message via socket
                socketRef.current.emit("send_message", eventData, (response: any) => {
                    setIsSending(false);
                    if (response.status === "ok") {
                        setMessages(prev => {
                            if (prev.some(m => m._id === response.message._id)) return prev;
                            return [...prev, response.message];
                        });
                    } else {
                        setInput(msgContent);
                        setUploadedFile(msgAttachments?.[0] || null);
                        toast.error(response.message || "Failed to send message");
                    }
                });
            }
            return;
        }

        // Fallback to REST API if socket not connected
        try {
            if (!ticketId) {
                const response: any = await restCreateTicket({ 
                    subject: "Support Chat", 
                    message: msgContent,
                    attachments: msgAttachments 
                }).unwrap();
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
                const response: any = await restSendMessage({ 
                    ticketId, 
                    content: msgContent,
                    attachments: msgAttachments,
                    type: msgAttachments ? "image" : "text"
                }).unwrap();
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
            setUploadedFile(msgAttachments?.[0] || null);
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

    // 5. Hide on public action routes (visitor form, email actions, etc.)
    const isPublicAction = useMemo(() => isPublicActionRoute(pathname), [pathname]);

    if (!mounted || isPublicAction) return null;

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

                                {isLoading || isAuthenticating ? (
                                    <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                                            <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-bold text-gray-900 dark:text-white">Authenticating...</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we secure your connection</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8">

                                        <div className="space-y-6 text-center mb-10">
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    SafeIn <span className="text-[#3882a5]">Support</span>
                                                </h4>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                                                        Agents Online
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
                                                Experience enterprise-grade support. Sign in to start a secure conversation with our team.
                                            </p>
                                        </div>

                                        <div className="w-full space-y-4">
                                            <Button
                                                onClick={() => loginWithGoogle()}
                                                className="w-full bg-[#074463] text-white hover:bg-[#05334a] h-14 rounded-2xl font-black text-lg shadow-xl shadow-[#074463]/20 transition-all duration-300 flex items-center justify-center gap-3 group active:scale-95"
                                            >
                                                <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 brightness-0 invert" />
                                                Continue with Google
                                            </Button>

                                            <div className="pt-4 flex flex-col items-center gap-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    <Shield size={12} className="text-[#3882a5]" />
                                                    Secure Support Channel
                                                </div>
                                                
                                                <div className="h-px w-12 bg-slate-100 dark:bg-slate-800"></div>

                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Support</p>
                                                    <a href="tel:+918699966076" className="text-slate-900 dark:text-white font-black hover:text-primary transition-colors">
                                                        +91 86999 66076
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </>
                                )}
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
                                    uploadedFile={uploadedFile}
                                    setUploadedFile={setUploadedFile}
                                    isSupportChat={true}
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
