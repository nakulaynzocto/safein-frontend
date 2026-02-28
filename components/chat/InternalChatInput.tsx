import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading?: boolean;
    isAdmin?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isAdmin }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [message]);

    const handleSend = () => {
        if (!message.trim() || isLoading) return;
        onSendMessage(message);
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl px-3 py-2 sm:px-6 sm:py-3 z-30 transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-3 max-w-6xl mx-auto w-full group">
                {/* Floating Input Container */}
                <div className="relative flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-lg focus-within:shadow-[#074463]/5 focus-within:border-[#074463]/30 dark:focus-within:border-blue-500/30 overflow-hidden min-h-[42px] flex items-center">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isAdmin ? "Compose..." : "Type a message..."}
                        className={cn(
                            "w-full min-h-[42px] max-h-[150px] resize-none py-[10px] px-4 transition-all duration-200",
                            "bg-transparent border-none outline-none ring-0",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-gray-500 dark:placeholder:text-gray-400 text-[14px] sm:text-[15px] font-medium leading-tight font-sans",
                            "scrollbar-none"
                        )}
                        rows={1}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    />
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    size="icon"
                    className={cn(
                        "h-[42px] w-[42px] rounded-xl transition-all duration-500 shrink-0 relative overflow-hidden group/btn disabled:opacity-50",
                        message.trim()
                            ? "bg-[#074463] hover:bg-[#0a5a82] text-white shadow-md shadow-[#074463]/20 active:scale-90"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 grayscale cursor-not-allowed"
                    )}
                >
                    <Send className={cn(
                        "h-[18px] w-[18px] transition-all duration-500 z-10",
                        message.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-[-5deg] scale-110" : "scale-100"
                    )} />
                </Button>
            </div>
        </div>
    );
}

