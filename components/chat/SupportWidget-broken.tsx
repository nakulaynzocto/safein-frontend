"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { useGoogleLogin } from "@react-oauth/google";
import { supportSocketService } from "@/lib/support-socket";
import { cn } from "@/lib/utils";
import { useLazyGetTicketHistoryQuery } from "@/store/api/supportApi";
import { format } from "date-fns";

const COMPANY_COLOR = "#074463";

export default function SupportWidget() {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [userMode, setUserMode] = useState<string>("none");
    const [googleToken, setGoogleToken] = useState<string | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { user, token } = useAuthSubscription();
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const [fetchHistory] = useLazyGetTicketHistoryQuery();

    useEffect(() => {
        setMounted(true);
    }, []);

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

        if (socket.connected) {
            onConnect();
        } else {
            setIsLoading(true);
        }

        socket.on("connect", onConnect);
        socket.on("receive_message", onReceiveMessage);
        socket.on("connect_error", onConnectError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("receive_message", onReceiveMessage);
            socket.off("connect_error", onConnectError);
        };
    }, [user, token, mounted, googleToken]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const syncTicketAndHistory = (socket: any) => {
        const savedTicket = localStorage.getItem("safein_support_ticket_id");

        if (!savedTicket) {
            console.log('[Support Widget] No saved ticket found, skipping history sync');
            return;
        }

        console.log('[Support Widget] Syncing ticket:', savedTicket);
        setTicketId(savedTicket);
        socket.emit("join_ticket", savedTicket);

        fetchHistory(savedTicket).unwrap().then((data) => {
            if (data && data.messages) {
                console.log('[Support Widget] History loaded:', data.messages.length, 'messages');
                setMessages(data.messages);
            }
        }).catch(err => {
            console.error("Failed to fetch history:", err);
            if (userMode === "public_verified") {
                console.warn("Stale public session detected, clearing...");
                localStorage.removeItem("safein_support_g_token");
                localStorage.removeItem("safein_support_ticket_id");
                setGoogleToken(null);
                setUserMode("none");
                setTicketId(null);
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
            console.error("Google Login Failed");
        }
    });

    const handleSendMessage = () => {
        if (!input.trim() || !socketRef.current) return;

        const msgContent = input;
        setInput("");
        setIsSending(true);

        const tempMsg = {
            _id: `temp-${Date.now()}`,
            content: msgContent,
            sender: "user",
            createdAt: new Date().toISOString()
        };

        setMessages((prev) => [...prev, tempMsg]);

        socketRef.current.emit("send_message", {
            ticketId: ticketId || undefined,
            content: msgContent
        }, (response: any) => {
            setIsSending(false);
            if (response?.ticketId && !ticketId) {
                setTicketId(response.ticketId);
                localStorage.setItem("safein_support_ticket_id", response.ticketId);
                socketRef.current.emit("join_ticket", response.ticketId);
            }
            handleSendMessage();
        });
    };

    if (!mounted) return null;

    return (
        <>
            {/* Modern Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#074463] via-[#0a5a7a] to-[#0d6d91] text-white rounded-full shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(7,68,99,0.6)] hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group relative overflow-hidden"
                >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce shadow-lg">!</span>
                </button>
            )}

            {/* Premium Chat Widget */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200/50 animate-in slide-in-from-bottom-5 duration-300">

                    {/* Gradient Header */}
                    <div className="relative h-20 bg-gradient-to-r from-[#074463] via-[#0a5a7a] to-[#0d6d91] p-4 flex items-center justify-between overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                        </div>

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base tracking-tight">SafeIn Support</h3>
                                <p className="text-white/80 text-xs font-medium">Usually replies in minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 relative z-10 group"
                        >
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-gradient-to-b from-gray-50 to-white relative flex flex-col min-h-0">

                        {/* Login Screen */}
                        {userMode === "none" && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#074463]/10 to-[#0d6d91]/20 rounded-full flex items-center justify-center mb-2">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#074463] to-[#0d6d91] rounded-full flex items-center justify-center shadow-lg">
                                            <MessageSquare className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 text-3xl animate-bounce">👋</div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800 text-xl">Hello there!</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                                        Have a question? Sign in with Google to start chatting with our team.
                                    </p>
                                </div>

                                <Button
                                    onClick={() => loginWithGoogle()}
                                    className="w-full bg-white text-gray-700 border-2 border-gray-200 hover:border-[#074463] hover:bg-gray-50 hover:text-gray-900 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 h-12 rounded-xl font-semibold group"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Continue with Google
                                </Button>

                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    We use your email to notify you of replies
                                </p>
                            </div>
                        )}

                        {/* Chat Area */}
                        {(userMode === "employee" || userMode === "public_verified") && (
                            <>
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

                                    {/* User Profile Card */}
                                    <div className="flex flex-col items-center mb-6 pt-2 animate-in fade-in zoom-in duration-500">
                                        <div className="relative mb-3">
                                            <Avatar className="w-14 h-14 border-3 border-white shadow-xl ring-2 ring-[#074463]/20">
                                                <AvatarImage src={user?.profilePicture || ""} />
                                                <AvatarFallback className="bg-gradient-to-br from-[#074463] to-[#0d6d91] text-white text-lg font-bold">
                                                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-base">
                                            {user?.name || user?.email?.split('@')[0] || "Supporter"}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{user?.email || "Authenticated"}</p>
                                    </div>

                                    {/* Messages */}
                                    {messages.map((msg, i) => {
                                        const isMe = msg.sender === "user" || (user?.id && msg.senderId === user.id) || (user?.email && msg.senderId === user.email);

                                        return (
                                            <div key={i} className={cn("flex w-full mb-2 animate-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
                                                <div className={cn("max-w-[80%] flex flex-col", isMe ? "items-end" : "items-start")}>
                                                    <div className={cn(
                                                        "px-4 py-2.5 text-sm shadow-md relative backdrop-blur-sm",
                                                        isMe ? "bg-gradient-to-br from-[#074463] to-[#0d6d91] text-white rounded-2xl rounded-br-md" : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md"
                                                    )}>
                                                        <p className="leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                        {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {isLoading && (
                                        <div className="flex justify-center py-4">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-[#074463] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-[#074463] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-[#074463] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modern Input */}
                                <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative group">
                                            <Input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                                placeholder="Type a message..."
                                                className="pr-10 h-11 rounded-xl border-2 border-gray-200 focus:border-[#074463] transition-all duration-200 bg-white shadow-sm"
                                                disabled={isSending}
                                            />
                                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Paperclip size={18} />
                                            </button>
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!input.trim() || isSending}
                                            className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#074463] to-[#0d6d91] hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Loading State */}
                        {userMode === "public_pending" && (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#074463] rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#0d6d91] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">Connecting...</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="h-6 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center border-t border-gray-200">
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="text-yellow-500">⚡</span>
                            Powered by SafeIn
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
