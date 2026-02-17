import { ReactNode, ElementType } from "react";
import { Button } from "@/components/ui/button";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { AddonPurchaseModal } from "@/components/common/AddonPurchaseModal";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionActionButtonsProps {
    isExpired: boolean;
    hasReachedLimit: boolean;
    limitType: 'employee' | 'appointment' | 'spotPass';
    showUpgradeModal: boolean;
    openUpgradeModal: () => void;
    closeUpgradeModal: () => void;
    showAddonModal: boolean;
    openAddonModal: () => void;
    closeAddonModal: () => void;
    upgradeLabel?: string;
    buyExtraLabel?: string;
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
    showAddonModal,
    openAddonModal,
    closeAddonModal,
    upgradeLabel = "Upgrade Plan",
    buyExtraLabel = "Buy Extra Limits",
    icon: Icon = Plus,
    children,
    isEmployee = false,
    className
}: SubscriptionActionButtonsProps) {

    // If limits reached/expired AND not Employee, show subscription actions
    if (!isEmployee && (isExpired || hasReachedLimit)) {
        return (
            <>
                {isExpired ? (
                    <Button
                        variant="primary"
                        size="xl"
                        onClick={openUpgradeModal}
                        className={cn("flex items-center gap-2 text-white px-6 min-w-[150px]", className)}
                    >
                        <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                        <span className="whitespace-nowrap">{upgradeLabel}</span>
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="xl"
                        onClick={openAddonModal}
                        className={cn("flex items-center gap-2 text-white px-6 min-w-[150px]", className)}
                    >
                        <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                        <span className="whitespace-nowrap">{buyExtraLabel}</span>
                    </Button>
                )}

                <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={closeUpgradeModal}
                />
                <AddonPurchaseModal
                    isOpen={showAddonModal}
                    onClose={closeAddonModal}
                    type={limitType}
                />
            </>
        );
    }

    // Otherwise, render the children (default actions)
    return <>{children}</>;
}
