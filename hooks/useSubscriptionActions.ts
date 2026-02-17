import { useState, useCallback } from "react";

export function useSubscriptionActions() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);

    const openUpgradeModal = useCallback(() => setShowUpgradeModal(true), []);
    const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);
    const openAddonModal = useCallback(() => setShowAddonModal(true), []);
    const closeAddonModal = useCallback(() => setShowAddonModal(false), []);

    return {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
        showAddonModal,
        openAddonModal,
        closeAddonModal
    };
}
