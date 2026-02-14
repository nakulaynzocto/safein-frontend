import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageBubbleProps {
    isSender: boolean;
    message: string;
    timestamp: Date;
    status: "sent" | "delivered" | "read";
}

export function MessageBubble({ isSender, message, timestamp, status }: MessageBubbleProps) {
    return (
        <div className={cn("flex w-full mb-4", isSender ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm relative",
                    isSender
                        ? "bg-[#3882a5] text-white rounded-br-none"
                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap breakdown-words">{message}</p>
                <div
                    className={cn(
                        "flex items-center justify-end gap-1 mt-1 text-[10px]",
                        isSender ? "text-blue-100" : "text-gray-400"
                    )}
                >
                    <span>{format(timestamp, "h:mm a")}</span>
                    {isSender && (
                        <span>
                            {status === "sent" && "✓"}
                            {status === "delivered" && "✓✓"}
                            {status === "read" && <span className="text-blue-300">✓✓</span>}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
