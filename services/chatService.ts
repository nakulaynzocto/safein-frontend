import {
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDoc,
    getDocs,
    Timestamp,
    increment,
    writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// Types
export interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date;
    read: boolean;
    files?: { url: string; name: string; type: string }[];
}

export interface Chat {
    id: string; // adminId_employeeId
    teacherId?: string; // adminId
    studentId?: string; // employeeId
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount?: number; // unread count for the receiver
    // Additional user info for quick display
    employeeName: string;
    employeeAvatar?: string;
    adminName: string;
    adminAvatar?: string;
}

// Collection References
const chatsRef = collection(db, "chats");

/**
 * Creates a unique chat ID based on participant IDs
 */
const getChatId = (adminId: string, employeeId: string) => `${adminId}_${employeeId}`;

/**
 * Ensures a chat document exists between Admin and Employee
 */
export const ensureChatExists = async (
    adminId: string,
    employeeId: string,
    adminDetails: { name: string; avatar?: string },
    employeeDetails: { name: string; avatar?: string }
): Promise<string> => {
    const chatId = getChatId(adminId, employeeId);
    const chatDocRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatDocRef);

    if (!chatSnap.exists()) {
        const newChatData = {
            id: chatId,
            participants: [adminId, employeeId],
            adminId,
            employeeId,
            adminName: adminDetails.name,
            adminAvatar: adminDetails.avatar || "",
            employeeName: employeeDetails.name,
            employeeAvatar: employeeDetails.avatar || "",
            createdAt: serverTimestamp(),
            lastMessage: "Generaed chat",
            lastMessageTime: serverTimestamp(),
            unreadCount: 0,
        };
        await setDoc(chatDocRef, newChatData);
    }
    return chatId;
};

/**
 * Sends a message in a specific chat
 */
export const sendMessage = async (
    chatId: string,
    senderId: string,
    text: string,
    files: File[] = []
) => {
    try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const chatDocRef = doc(db, "chats", chatId);

        // Upload files if any
        const uploadedFiles = [];
        if (files.length > 0) {
            for (const file of files) {
                const storageRef = ref(storage, `chat/${chatId}/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                uploadedFiles.push({
                    url,
                    name: file.name,
                    type: file.type,
                });
            }
        }

        // Add message to subcollection
        await addDoc(messagesRef, {
            text,
            senderId,
            createdAt: serverTimestamp(),
            read: false,
            files: uploadedFiles,
        });

        // Update chat metadata (last message, time, unread count)
        // We need to know who is the receiver to increment THEIR unread count?
        // Actually, shared unread count is tricky. Usually we track unread per user.
        // For simplicity, let's assume `unreadCount` field is general and UI handles logic,
        // OR better: we can store `unreadCount_adminId` and `unreadCount_employeeId`.
        // Let's stick to a simple `unreadCount` and assume it's for the "other" person.
        // Or updated approach: update `lastMessage` and `lastMessageTime`.

        await updateDoc(chatDocRef, {
            lastMessage: text || (files.length > 0 ? "Sent a file" : ""),
            lastMessageTime: serverTimestamp(),
            // Simple increment for now. Real-world apps track read status per user.
            unreadCount: increment(1),
        });

    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

/**
 * Listens to messages in real-time
 */
export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
    const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc"),
        limit(100)
    );

    return onSnapshot(q, (snapshot) => {
        const messages: Message[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(), // Handle Firestore Timestamp
            } as Message;
        });
        callback(messages);
    });
};

/**
 * Listens to list of chats for a user
 */
export const subscribeToUserChats = (userId: string, callback: (chats: any[]) => void) => {
    const q = query(
        chatsRef,
        where("participants", "array-contains", userId),
        orderBy("lastMessageTime", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
            };
        });
        callback(chats);
    });
};

/**
 * Marks messages as read
 */
export const markChatAsRead = async (chatId: string, userId: string) => {
    // Reset unread count on the chat document (assuming user is opening it)
    // AND batch update unread messages?
    // For MVP, just resetting the counter on the main doc is enough if valid.
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
        unreadCount: 0
    });

    // Also mark individual messages as read (optional for UI blue ticks)
    // This requires a query for unread messages received by user.
    // Simplifying for now.
};
