import { useEffect } from "react";

/**
 * Custom hook to handle form state persistence in localStorage
 * @param key The unique key for storage
 * @param state The state object to persist
 * @param onRestore Callback when saved state is found
 * @param excludeSteps Steps during which state should not be saved
 * @param clearOnSteps Steps during which state should be cleared
 */
export function useFormPersistence<T extends { step: string }>(
    key: string,
    state: T | null,
    onRestore: (savedState: T) => void,
    excludeSteps: string[] = ["loading", "error", "success"],
    clearOnSteps: string[] = ["success"]
) {
    // Initial restore
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === "object") {
                    onRestore(parsed);
                }
            } catch (e) {
                console.error(`[Persistence] Failed to restore state for key: ${key}`, e);
            }
        }
    }, [key]); // Only run when key changes

    // Auto-save on state change
    useEffect(() => {
        if (typeof window === "undefined" || !state) return;

        if (clearOnSteps.includes(state.step)) {
            localStorage.removeItem(key);
            return;
        }

        if (!excludeSteps.includes(state.step)) {
            localStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state, excludeSteps, clearOnSteps]);
}
