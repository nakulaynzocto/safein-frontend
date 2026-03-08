import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadFileMutation } from "@/store/api";
import { showErrorToast } from "@/utils/toast";
import Image from "next/image";

interface ChatInputProps {
    onSendMessage: (text: string, files?: any[]) => void;
    isLoading?: boolean;
    isAdmin?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isAdmin }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    // Auto-resize textarea logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [message]);

    const handleSend = () => {
        if ((!message.trim() && !uploadedFile) || isLoading || isUploading) return;
        
        const files = uploadedFile ? [uploadedFile] : undefined;
        onSendMessage(message, files);
        
        setMessage("");
        setUploadedFile(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.focus();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showErrorToast("Only image files are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showErrorToast("File size must be less than 5MB");
            return;
        }

        try {
            const result = await uploadFile({ file }).unwrap();
            setUploadedFile({
                url: result.url,
                name: file.name,
                type: file.type
            });
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to upload image");
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-2">
                {/* Image Preview */}
                {uploadedFile && uploadedFile.url && (
                    <div className="flex px-1 animate-in fade-in slide-in-from-bottom-2">
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-[#074463]/20 shadow-sm group/preview">
                            <Image 
                                src={uploadedFile.url} 
                                alt="preview" 
                                fill 
                                className="object-cover"
                            />
                            <button 
                                onClick={() => setUploadedFile(null)}
                                className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 group">
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploading}
                        className="h-[42px] w-[42px] rounded-xl text-gray-400 hover:text-[#074463] hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                    </Button>

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
                    disabled={(!message.trim() && !uploadedFile) || isLoading || isUploading}
                    size="icon"
                    className={cn(
                        "h-[42px] w-[42px] rounded-xl transition-all duration-500 shrink-0 relative overflow-hidden group/btn disabled:opacity-50",
                        (message.trim() || uploadedFile)
                            ? "bg-[#074463] hover:bg-[#0a5a82] text-white shadow-md shadow-[#074463]/20 active:scale-90"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 grayscale cursor-not-allowed"
                    )}
                >
                    <Send className={cn(
                        "h-[18px] w-[18px] transition-all duration-500 z-10",
                        (message.trim() || uploadedFile) ? "translate-x-0.5 -translate-y-0.5 rotate-[-5deg] scale-110" : "scale-100"
                    )} />
                </Button>
            </div>
        </div>
    </div>
);
}

