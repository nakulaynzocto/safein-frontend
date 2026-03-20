import React from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadFileMutation } from "@/store/api";
import { useUploadSupportFileMutation } from "@/store/api/supportApi";
import { showErrorToast } from "@/utils/toast";
import Image from "next/image";

// Constants
const GRADIENT_PRIMARY = "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    isSending: boolean;
    uploadedFile?: { url: string; name: string; type: string } | null;
    setUploadedFile?: (file: { url: string; name: string; type: string } | null) => void;
    isSupportChat?: boolean; // When true, uses the support-specific upload endpoint
}

export const ChatInput: React.FC<ChatInputProps> = ({
    input,
    setInput,
    handleSendMessage,
    handleKeyPress,
    isLoading,
    isSending,
    uploadedFile,
    setUploadedFile,
    isSupportChat = false
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    // Use support-specific upload endpoint for support widget users (supports Google auth)
    // Use the Gatekeeper JWT-protected endpoint for internal chat (logged-in employees)
    const [uploadFileGatekeeper, { isLoading: isUploadingGK }] = useUploadFileMutation();
    const [uploadFileSupport, { isLoading: isUploadingSup }] = useUploadSupportFileMutation();
    const isUploading = isSupportChat ? isUploadingSup : isUploadingGK;

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
            let result: { url: string; name: string; type: string };

            if (isSupportChat) {
                // Support widget: upload to super-admin-backend (/api/support/upload)
                // This endpoint validates both JWT and Google tokens via supportProtect
                const formData = new FormData();
                formData.append('file', file);
                result = await uploadFileSupport(formData).unwrap();
            } else {
                // Internal chat: upload to Gatekeeper (/upload) with JWT
                const res = await uploadFileGatekeeper({ file }).unwrap();
                result = { url: res.url, name: file.name, type: file.type };
            }

            setUploadedFile?.(result);
        } catch (error: any) {
            const msg = error?.data?.message || error?.message || "Failed to upload image";
            showErrorToast(msg);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    return (
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50 flex flex-col gap-2">
            {/* Image Preview */}
            {uploadedFile && uploadedFile.url && (
                <div className="flex px-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border-2 border-[#074463]/20 shadow-sm group/preview">
                        <Image 
                            src={uploadedFile.url} 
                            alt="preview" 
                            fill 
                            className="object-cover"
                        />
                        <button 
                            onClick={() => setUploadedFile?.(null)}
                            className="absolute top-1 right-1 h-5 w-5 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-gray-100 dark:border-slate-700 focus-within:border-[#3882a5] dark:focus-within:border-[#3882a5] focus-within:shadow-lg focus-within:shadow-[#074463]/20 transition-all duration-300">
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
                    disabled={isLoading || isSending || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-[#074463] dark:hover:text-[#3882a5] shrink-0 h-9 w-9 rounded-xl"
                >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
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
                    disabled={(!input.trim() && !uploadedFile) || isLoading || isSending || isUploading}
                >
                    {isSending || isUploading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Send size={18} className={cn((input.trim() || uploadedFile) ? "translate-x-0.5" : "")} />
                    )}
                </Button>
            </div>
        </div>
    );
};
