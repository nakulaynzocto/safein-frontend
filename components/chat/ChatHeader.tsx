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
        <div className="relative p-5 flex justify-between items-center shadow-sm border-b z-10 overflow-hidden shrink-0 bg-white">
            {/* Animated Patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-3xl -translate-y-10 translate-x-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-accent/5 blur-2xl translate-y-8 -translate-x-8"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-slate-900 font-semibold text-lg tracking-tight">
                        SafeIn Support
                    </h3>
                </div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">We're here to help</p>
            </div>

            <div className="relative z-10 flex items-center gap-1.5">
                <Button onClick={toggleExpand} size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-300">
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </Button>
                <Button onClick={closeChat} size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-300 hover:rotate-90">
                    <X size={18} />
                </Button>
            </div>
        </div>
    );
};
