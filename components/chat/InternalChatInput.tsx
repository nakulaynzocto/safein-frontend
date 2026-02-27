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
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-2 sm:p-4 flex flex-col gap-2 z-30 pb-safe">
            <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
                <div className="relative flex-1">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        placeholder={isAdmin ? "Type a message..." : "Message..."}
                        className={cn(
                            "min-h-[40px] max-h-[120px] resize-none py-2 px-4 transition-all duration-200",
                            "bg-gray-50 border-gray-200 focus:bg-white focus:border-[#074463] rounded-[24px]",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-gray-400 text-sm sm:text-base leading-normal",
                            "scrollbar-none"
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
                        "h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-200 shrink-0",
                        message.trim()
                            ? "bg-[#074463] hover:bg-[#0a5a82] text-white shadow-md shadow-[#074463]/20"
                            : "bg-gray-100 text-gray-400"
                    )}
                >
                    <Send className={cn(
                        "h-4 w-4 sm:h-5 w-5",
                        message.trim() ? "fill-current" : ""
                    )} />
                </Button>
            </div>
        </div>
    );
}

