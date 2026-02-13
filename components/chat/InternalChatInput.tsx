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

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleFocus = () => {
        // Scroll input into view on mobile when keyboard appears
        if (textareaRef.current && window.innerWidth < 768) {
            setTimeout(() => {
                textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300); // Delay for keyboard animation
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 z-30 safe-area-bottom">
            <div className="flex items-end gap-2 sm:gap-3 max-w-5xl mx-auto w-full">
                <div className="relative flex-1 group">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        placeholder={isAdmin ? "Compose..." : "Message..."}
                        className={cn(
                            "min-h-[44px] sm:min-h-[52px] max-h-[120px] sm:max-h-[160px] resize-none py-2.5 sm:py-3.5 px-4 sm:px-5 transition-all duration-300",
                            "bg-gray-50/50 border-gray-200/80 rounded-[20px] sm:rounded-[22px]",
                            "focus-visible:ring-[#074463] focus-visible:ring-1 focus-visible:bg-white focus-visible:border-transparent",
                            "placeholder:text-gray-400 placeholder:font-medium text-sm sm:text-[15px] leading-relaxed",
                            "shadow-[0_2px_10px_rgba(0,0,0,0.02)]",
                            "overflow-hidden scrollbar-none"
                        )}
                        rows={1}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    />
                </div>

                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    size="icon"
                    className={cn(
                        "h-[44px] sm:h-[52px] w-[44px] sm:w-[52px] rounded-full transition-all duration-300 shadow-lg shrink-0 border-none",
                        message.trim()
                            ? "bg-[#074463] hover:bg-[#0a5a82] scale-100 shadow-[#074463]/30 text-white"
                            : "bg-gray-100 text-gray-400 scale-95 shadow-none"
                    )}
                >
                    <Send className={cn(
                        "h-4 w-4 sm:h-5 w-5 transition-all duration-300",
                        message.trim()
                            ? "translate-x-0.5 -translate-y-0.5 rotate-0 opacity-100 text-white fill-white/10"
                            : "rotate-12 opacity-40 text-gray-400"
                    )} />
                </Button>
            </div>

        </div>
    );
}

