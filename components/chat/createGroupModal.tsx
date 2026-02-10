"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatName } from "@/utils/helpers";
import { Search } from "lucide-react";

interface User {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
}

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGroup: (participantIds: string[], groupName: string) => Promise<any>;
    employees: User[];
}

export function CreateGroupModal({
    isOpen,
    onClose,
    onCreateGroup,
    employees
}: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!groupName || selectedUserIds.length === 0) return;

        setIsSubmitting(true);
        try {
            await onCreateGroup(selectedUserIds, groupName);
            onClose();
            setGroupName("");
            setSelectedUserIds([]);
        } catch (error) {
            console.error("Failed to create group", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Group Name</label>
                        <Input
                            placeholder="Enter group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Members</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search employees..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-60 rounded-md border p-2">
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    onClick={() => handleToggleUser(emp.id)}
                                >
                                    <Checkbox
                                        checked={selectedUserIds.includes(emp.id)}
                                        onCheckedChange={() => handleToggleUser(emp.id)}
                                    />
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={emp.avatar} />
                                        <AvatarFallback>{formatName(emp.name).charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{formatName(emp.name)}</p>
                                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        disabled={!groupName || selectedUserIds.length === 0 || isSubmitting}
                        onClick={handleCreate}
                    >
                        {isSubmitting ? "Creating..." : "Create Group"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
