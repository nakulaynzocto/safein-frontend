import { ReactNode, ElementType } from "react";
import { Button } from "@/components/ui/button";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { Plus, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { setAssistantOpen, setAssistantMessage } from "@/store/slices/uiSlice";

interface SubscriptionActionButtonsProps {
    isExpired: boolean;
    hasReachedLimit: boolean;
    limitType: 'employee' | 'appointment' | 'spotPass' | 'visitor';
    showUpgradeModal: boolean;
    openUpgradeModal: () => void;
    closeUpgradeModal: () => void;
    upgradeLabel?: string;
    icon?: ElementType;
    children?: ReactNode;
    isEmployee?: boolean;
    className?: string; // Additional classes for the button
}

export function SubscriptionActionButtons({
    isExpired,
    hasReachedLimit,
    limitType,
    showUpgradeModal,
    openUpgradeModal,
    closeUpgradeModal,
    upgradeLabel = "Upgrade Plan",
    icon: Icon = Plus,
    children,
    isEmployee = false,
    className
}: SubscriptionActionButtonsProps) {
    const dispatch = useAppDispatch();

    // If Employee, always show children
    if (isEmployee) return <>{children}</>;

    // Case 1: Subscription Expired
    if (isExpired) {
        return (
            <>
                <Button
                    variant="primary"
                    size="xl"
                    onClick={openUpgradeModal}
                    className={cn("flex items-center gap-2 text-brand-strong px-6 min-w-[150px]", className)}
                >
                    <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-brand-strong" />
                    <span className="whitespace-nowrap font-medium text-brand-strong">{upgradeLabel}</span>
                </Button>

                <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={closeUpgradeModal}
                    limitType={
                        limitType === 'employee' ? 'employees' : 
                        limitType === 'appointment' ? 'appointments' : 
                        limitType === 'spotPass' ? 'spotPasses' : 
                        limitType === 'visitor' ? 'visitors' : null
                    }
                />
            </>
        );
    }

    // Case 2: Limit Reached (but not expired)
    if (hasReachedLimit) {
        const handleSupportChat = () => {
            dispatch(setAssistantMessage(`Hi, I've reached my ${limitType} limit. Please help me upgrade my plan.`));
            dispatch(setAssistantOpen(true));
        };

        return (
            <Button
                variant="primary"
                size="xl"
                onClick={handleSupportChat}
                className={cn("flex items-center gap-2 text-brand-strong px-6 min-w-[150px]", className)}
            >
                <MessageSquareText className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-brand-strong" />
                <span className="whitespace-nowrap font-medium text-brand-strong">Support Chat</span>
            </Button>
        );
    }

    // Otherwise, render the children (default actions)
    return <>{children}</>;
}
