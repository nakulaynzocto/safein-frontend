import React from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Constants
const GRADIENT_PRIMARY = "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)";

interface ChatHeaderProps {
    refreshHistory: () => void;
    toggleExpand: () => void;
    closeChat: () => void;
    isExpanded: boolean;
    isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    refreshHistory,
    toggleExpand,
    closeChat,
    isExpanded,
    isConnected
}) => {
    return (
        <div className="relative p-5 flex justify-between items-center shadow-md z-10 overflow-hidden shrink-0">
            {/* Background with Gradient */}
            <div className="absolute inset-0 opacity-95 transition-all duration-500" style={{ background: GRADIENT_PRIMARY }}></div>

            {/* Animated Patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-3xl -translate-y-10 translate-x-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-primary-light/20 blur-2xl translate-y-8 -translate-x-8"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col">
                <h3 className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
                    Start Conversation
                    <span className="flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    </span>
                </h3>
                <p className="text-blue-100/90 text-xs font-medium">We typically reply in few minutes</p>
            </div>

            <div className="relative z-10 flex items-center gap-1.5">
                <Button onClick={toggleExpand} size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </Button>
                <Button onClick={closeChat} size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:rotate-90">
                    <X size={18} />
                </Button>
            </div>
        </div>
    );
};
