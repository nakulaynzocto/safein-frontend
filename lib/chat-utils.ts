export interface FormattedChatUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    lastSeen?: string | Date;
}

/**
 * Safely extracts the user ID from a User object or auth payload
 */
export const getCurrentUserId = (user: any): string => {
    if (!user) return "";
    return String(user.id || user._id || "");
};

/**
 * Finds the other participant in a chat given the current user ID
 */
export const getChatPartner = (participants: any[], currentUserId: string): any => {
    if (!participants || participants.length === 0) return null;

    const partner = participants.find(p => String(p._id) !== currentUserId);
    return partner || participants[0]; // Fallback to first if match fails
};

/**
 * Formats a user object into a standardized structure for UI
 */
export const formatChatUser = (user: any): FormattedChatUser => {
    if (!user) {
        return {
            id: "",
            name: "Unknown User",
            email: "",
            avatar: "",
            role: "user"
        };
    }

    const name = user.name || user.email || "Unknown User";

    // Determine Role
    let role = "user";
    if (user.role) {
        role = user.role.toLowerCase();
    } else if (user.roles && Array.isArray(user.roles)) {
        if (user.roles.includes('admin') || user.roles.includes('super_admin')) role = 'admin';
        else if (user.roles.includes('employee')) role = 'employee';
    }

    return {
        id: String(user._id || user.id),
        name: name,
        email: user.email || "",
        avatar: user.profilePicture || "",
        role: role,
        lastSeen: user.lastLoginAt || user.updatedAt
    };
};

/**
 * Helper to determine if a chat should be visible to the current user type
 */
export const shouldShowChat = (chatUser: any, isAdmin: boolean): boolean => {
    if (isAdmin) return true;

    // Show Group chats
    if (chatUser.isGroup || chatUser.role === 'group') return true;

    // Show Admins
    if (chatUser.role === 'admin' || chatUser.role === 'super_admin') return true;

    // Hide other Employees
    return chatUser.role !== 'employee';
};

/**
 * Gets display name and avatar for a chat (handles Group vs 1-to-1)
 */
export const getChatDisplayData = (chat: any, currentUserId: string) => {
    // Robust detection: More than 2 participants or explicit flag/name
    const isGroup = chat.isGroup || chat.groupName || (chat.participants && chat.participants.length > 2);

    if (isGroup) {
        return {
            id: chat._id,
            name: chat.groupName || "Group Chat",
            avatar: chat.groupPicture || "",
            role: "group",
            isOnline: false,
            email: `${chat.participants?.length || 0} participants`
        };
    }

    const partner = getChatPartner(chat.participants, currentUserId);
    const formatted = formatChatUser(partner);
    return {
        ...formatted,
        isOnline: false // Placeholder, will be handled by onlineUserIds in loop
    };
};

/**
 * Builds a map of user IDs to their details for fast lookup
 */
export const buildParticipantsMap = (
    user: any,
    chats: any[],
    activeChat: any,
    sidebarUsers: any[]
): Map<string, { name: string; avatar: string }> => {
    const map = new Map<string, { name: string; avatar: string }>();

    // Helper to safely add user to map
    const addToMap = (u: any) => {
        if (!u) return;
        const id = String(u._id || u.userId || u.id || "");
        if (!id) return;

        const currentName = u.name || u.username;
        const currentEmail = u.email;

        // Determine best display name
        let displayName = currentName;
        if (!displayName && currentEmail) {
            displayName = currentEmail.split('@')[0]; // Fallback to email username
        }

        if (!displayName || displayName === "Unknown User") return;

        // Add to map (priority to existing full names)
        if (!map.has(id) || (map.get(id)?.name === map.get(id)?.avatar)) {
            map.set(id, {
                name: displayName,
                avatar: u.profilePicture || u.avatar || ""
            });
        }
    };

    // 1. Current User
    addToMap(user);

    // 2. Chat Participants (Global & Active)
    if (activeChat?.participants) {
        activeChat.participants.forEach(addToMap);
    }
    chats?.forEach(chat => {
        chat.participants?.forEach(addToMap);
    });

    // 3. Sidebar Users
    sidebarUsers.forEach(u => {
        if (u.targetUserId) {
            addToMap({ id: u.targetUserId, name: u.name, avatar: u.avatar });
        }
        addToMap(u);
    });

    return map;
};

/**
 * Transforms a raw message into a UI-ready format with resolved sender details
 */
export const transformMessageForDisplay = (
    msg: any,
    participantsMap: Map<string, { name: string; avatar: string }>
) => {
    // Extract Sender ID robustly
    let senderId = "";
    let senderObjName = "";
    let senderObjAvatar = "";

    if (typeof msg.senderId === 'object' && msg.senderId !== null) {
        const s = msg.senderId as any;
        senderId = String(s._id || s.id || "");
        senderObjName = s.name || s.email?.split('@')[0];
        senderObjAvatar = s.profilePicture || s.avatar;
    } else {
        senderId = String(msg.senderId || "");
    }

    // Lookup
    const participant = participantsMap.get(senderId);

    // Final Resolution
    const finalName = participant?.name || senderObjName || "Member";
    const finalAvatar = participant?.avatar || senderObjAvatar;

    return {
        id: msg._id,
        senderId,
        senderName: finalName,
        senderAvatar: finalAvatar,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        read: (msg.readBy?.length || 0) > 1,
        files: msg.files
    };
};
