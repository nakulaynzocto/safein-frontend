"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatName } from "@/utils/helpers";
import { Search, X, UserPlus, Trash2, Settings, Shield, UserMinus, Camera, Loader2 } from "lucide-react";
import { useGetEmployeesQuery } from "@/store/api/employeeApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Chat } from "@/store/api/chatApi";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeChat: Chat;
    currentUserId: string;
    isAdmin: boolean;
    onUpdateGroup: (chatId: string, data: { groupName?: string; groupPicture?: string }) => Promise<any>;
    onAddParticipants: (chatId: string, participantIds: string[]) => Promise<any>;
    onRemoveParticipant: (chatId: string, participantId: string) => Promise<any>;
    onDeleteChat: (chatId: string) => Promise<any>;
}

export function GroupSettingsModal({
    isOpen,
    onClose,
    activeChat: propActiveChat,
    currentUserId,
    isAdmin,
    onUpdateGroup,
    onAddParticipants,
    onRemoveParticipant,
    onDeleteChat
}: GroupSettingsModalProps) {
    // Local buffer for chat data to keep UI stable during refetches
    const [stableChat, setStableChat] = useState<Chat | null>(propActiveChat || null);
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showAddSection, setShowAddSection] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Update stable chat when props change
    useEffect(() => {
        if (propActiveChat) {
            setStableChat(propActiveChat);
        }
    }, [propActiveChat]);

    // Track previous open state
    const wasOpen = useRef(isOpen);

    // Force sync when opening to prevent stale state
    useEffect(() => {
        // Only trigger reset if transitioning from closed to open
        if (isOpen && !wasOpen.current && propActiveChat) {
            setStableChat(propActiveChat);
            setGroupName(propActiveChat.groupName || "");
            setConfirmDeleteGroup(false);
            setConfirmRemoveMember(null);
            setShowAddSection(false); // Reset add section on fresh open
            setIsUpdating(false);
        }
        wasOpen.current = isOpen;
    }, [isOpen, propActiveChat]); // Re-run when opening

    // Confirmation States
    const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);
    const [confirmRemoveMember, setConfirmRemoveMember] = useState(null as string | null);

    const { data: employeeData } = useGetEmployeesQuery({ limit: 1000 });
    const [uploadFile] = useUploadFileMutation();

    const allEmployees = employeeData?.employees || [];

    // Use stableChat for all rendering logic
    const activeChat = stableChat;

    const isGroupAdmin = useMemo(() => {
        if (!activeChat) return false;
        const rawAdmin = activeChat.groupAdmin;
        const adminId = (rawAdmin as any)?._id || (rawAdmin as any)?.id || rawAdmin;
        return String(adminId) === String(currentUserId);
    }, [activeChat, currentUserId]);

    // Filter employees who are NOT already in the group
    const availableEmployees = useMemo(() => {
        if (!activeChat) return [];
        const participantIds = new Set((activeChat?.participants || []).map(p => String(p._id)));
        return allEmployees.filter(emp => !participantIds.has(String(emp._id)));
    }, [allEmployees, activeChat?.participants, activeChat]);

    const filteredEmployees = useMemo(() => {
        return availableEmployees.filter(emp =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [availableEmployees, searchQuery]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeChat) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploaded = await uploadFile({ file }).unwrap();
            await onUpdateGroup(activeChat._id, { groupPicture: uploaded.url });
            toast.success("Group picture updated");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!activeChat || !groupName || groupName === activeChat.groupName) return;
        setIsUpdating(true);
        try {
            await onUpdateGroup(activeChat._id, { groupName });
            toast.success("Group name updated");
            onClose();
        } catch (error) {
            toast.error("Failed to update group name");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddMember = async (employeeId: string) => {
        if (!activeChat) return;
        setIsUpdating(true);
        try {
            await onAddParticipants(activeChat._id, [employeeId]);
            toast.success("Member added");
        } catch (error) {
            toast.error("Failed to add member");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveMember = async (participantId: string) => {
        if (!activeChat) return;
        setIsUpdating(true);
        try {
            await onRemoveParticipant(activeChat._id, participantId);
            toast.success("Member removed");
            setConfirmRemoveMember(null);
        } catch (error) {
            toast.error("Failed to remove member");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!activeChat) return;
        setIsUpdating(true);
        try {
            await onDeleteChat(activeChat._id);
            toast.success("Group deleted");
            setConfirmDeleteGroup(false);
            onClose();
        } catch (error) {
            toast.error("Failed to delete group");
        } finally {
            setIsUpdating(false);
        }
    };

    const participantsCount = activeChat?.participants?.length || 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl flex flex-col max-h-[92vh]">
                <DialogHeader className="bg-white border-b border-gray-100 px-8 py-6 shrink-0 relative">
                    <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                                {isGroupAdmin ? "Manage Group" : "Group Info"}
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <span className={cn("h-1.5 w-1.5 rounded-full", isGroupAdmin ? "bg-blue-500" : "bg-gray-400")} />
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                                    {participantsCount > 0 ? `${participantsCount} Members` : "Group Management"}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="bg-white p-4 sm:p-6 space-y-6 sm:space-y-8">
                        {/* Header with Avatar and Basic Info */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-2">
                            <div className="relative shrink-0">
                                <Avatar className="h-20 w-20 sm:h-28 w-28 border-4 border-gray-50 shadow-2xl transition-transform hover:scale-105 duration-300">
                                    <AvatarImage src={activeChat?.groupPicture} className="object-cover" />
                                    <AvatarFallback className="bg-[#074463] text-white text-2xl sm:text-4xl font-black">
                                        {formatName(activeChat?.groupName || "G").charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {isGroupAdmin && (
                                    <label className="absolute -bottom-1 -right-1 bg-white p-2.5 rounded-full shadow-xl cursor-pointer hover:bg-gray-50 transition-all border border-gray-100 hover:scale-110">
                                        {isUploading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-[#074463]" />
                                        ) : (
                                            <Camera className="h-4 w-4 text-[#074463]" />
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                    </label>
                                )}
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Group Management Name</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            disabled={!isGroupAdmin || isUpdating}
                                            className="bg-gray-50 border-gray-100 focus:ring-[#074463] rounded-2xl h-11 text-sm font-semibold"
                                            placeholder="Enter group name..."
                                        />
                                        {isGroupAdmin && (
                                            <Button
                                                onClick={handleUpdateName}
                                                disabled={isUpdating || !groupName.trim() || groupName === activeChat?.groupName}
                                                size="sm"
                                                className={cn(
                                                    "rounded-xl px-5 h-11 transition-all duration-300",
                                                    (groupName === activeChat?.groupName)
                                                        ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
                                                        : "bg-[#074463] hover:bg-[#0a5a82] text-white shadow-md hover:shadow-lg"
                                                )}
                                            >
                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Participants Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Group Members</h3>
                                {isGroupAdmin && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAddSection(!showAddSection)}
                                        className={cn(
                                            "rounded-xl font-bold flex items-center gap-2 h-9 px-4 transition-all",
                                            showAddSection ? "text-red-500 hover:bg-red-50" : "text-[#074463] hover:bg-blue-50"
                                        )}
                                    >
                                        {showAddSection ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                                        {showAddSection ? "Cancel" : "Add Participant"}
                                    </Button>
                                )}
                            </div>

                            {showAddSection ? (
                                <div className="space-y-4 bg-gray-50/50 p-4 rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-11 bg-white border-none rounded-2xl h-11 shadow-sm text-sm"
                                        />
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto px-1 custom-scrollbar">
                                        <div className="space-y-2">
                                            {filteredEmployees.length === 0 ? (
                                                <div className="text-center py-6">
                                                    <p className="text-gray-400 text-xs font-medium">No results found for "{searchQuery}"</p>
                                                </div>
                                            ) : (
                                                filteredEmployees.map((emp: any) => (
                                                    <div key={emp._id} className="flex items-center justify-between p-2.5 hover:bg-white rounded-2xl transition-all group border border-transparent hover:border-gray-100 hover:shadow-md">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                <AvatarImage src={emp.profilePicture} />
                                                                <AvatarFallback className="bg-[#074463] text-white text-xs font-bold">
                                                                    {formatName(emp.name).charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 leading-none">{formatName(emp.name)}</p>
                                                                <p className="text-[10px] text-gray-400 mt-1">{emp.email}</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddMember(emp._id)}
                                                            disabled={isUpdating}
                                                            className="bg-[#074463] text-white hover:bg-[#0a5a82] rounded-xl h-9 px-4 text-xs font-bold"
                                                        >
                                                            Add
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid gap-3">
                                        {activeChat?.participants?.map((p: any) => (
                                            <div key={p._id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-2xl transition-all border border-transparent hover:border-gray-100 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-11 w-11 border-2 border-white shadow-md">
                                                            <AvatarImage src={p.profilePicture || p.avatar} />
                                                            <AvatarFallback className="bg-gray-100 text-[#074463] font-black text-sm">
                                                                {formatName(p.name).charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {String(activeChat?.groupAdmin) === String(p._id) && (
                                                            <div className="absolute -top-1 -right-1 bg-amber-400 border-2 border-white rounded-full p-1 shadow-sm" title="Admin">
                                                                <Shield className="h-2.5 w-2.5 text-white" fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                                            {formatName(p.name)}
                                                            {String(p._id) === currentUserId && <span className="text-[9px] bg-blue-100 text-[#074463] px-2 py-0.5 rounded-full font-black tracking-tighter uppercase">You</span>}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 font-medium">{p.email}</p>
                                                    </div>
                                                </div>
                                                {isGroupAdmin && String(p._id) !== currentUserId && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isUpdating}
                                                        onClick={() => setConfirmRemoveMember(p._id)}
                                                        className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                                                    >
                                                        <UserMinus className="h-4.5 w-4.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Danger Zone */}
                        {isGroupAdmin && (
                            <div className="pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setConfirmDeleteGroup(true)}
                                    disabled={isUpdating}
                                    className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl gap-3 font-black text-xs uppercase tracking-widest h-12 border border-dashed border-red-100 hover:border-red-200 transition-all duration-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Terminate Group
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 bg-gray-50/50 border-t border-gray-100 shrink-0 sm:justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-2xl px-12 h-11 font-bold text-gray-500 hover:bg-white border border-gray-200 shadow-sm transition-all active:scale-95"
                    >
                        Close Settings
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Remove Member Confirmation */}
            <ConfirmationDialog
                open={!!confirmRemoveMember}
                onOpenChange={(open) => !open && setConfirmRemoveMember(null)}
                title="Remove Member"
                description="Are you sure you want to remove this member from the group?"
                confirmText="Remove"
                variant="destructive"
                onConfirm={() => confirmRemoveMember && handleRemoveMember(confirmRemoveMember)}
            />

            {/* Delete Group Confirmation */}
            <ConfirmationDialog
                open={confirmDeleteGroup}
                onOpenChange={setConfirmDeleteGroup}
                title="Delete Group"
                description="Are you sure you want to delete this group entirely? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDeleteGroup}
            />
        </Dialog>
    );
}
