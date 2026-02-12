import React from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Constants
const GRADIENT_PRIMARY = "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    isSending: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    input,
    setInput,
    handleSendMessage,
    handleKeyPress,
    isLoading,
    isSending
}) => {
    return (
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-gray-100 dark:border-slate-700 focus-within:border-[#3882a5] dark:focus-within:border-[#3882a5] focus-within:shadow-lg focus-within:shadow-[#074463]/20 transition-all duration-300">
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-[#074463] dark:hover:text-[#3882a5] shrink-0 h-9 w-9 rounded-xl">
                    <Paperclip size={18} />
                </Button>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400 dark:text-white py-2 px-2"
                    disabled={isLoading}
                />
                <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className={cn(
                        "rounded-xl w-10 h-10 shrink-0 transition-all duration-300 shadow-lg",
                        !input.trim()
                            ? "bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed shadow-none"
                            : "hover:scale-105 shadow-[#074463]/30 text-white"
                    )}
                    style={input.trim() ? { background: GRADIENT_PRIMARY } : {}}
                    disabled={!input.trim() || isLoading || isSending}
                >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={cn(input.trim() ? "translate-x-0.5" : "")} />}
                </Button>
            </div>
        </div>
    );
};
