import { useState, useCallback } from "react";

export function useSubscriptionActions() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const openUpgradeModal = useCallback(() => setShowUpgradeModal(true), []);
    const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

    return {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
    };
}
