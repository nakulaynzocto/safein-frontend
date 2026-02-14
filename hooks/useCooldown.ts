import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing cooldowns with automatic countdown timer
 * @param initialCooldowns - Optional initial cooldown state
 * @returns Object with cooldowns state and utility functions
 */
export function useCooldown(initialCooldowns: Record<string, number> = {}) {
    const [cooldowns, setCooldowns] = useState<Record<string, number>>(initialCooldowns);

    // Timer effect for cooldowns
    useEffect(() => {
        const timer = setInterval(() => {
            setCooldowns(prev => {
                const next = { ...prev };
                let hasChanged = false;
                Object.keys(next).forEach(key => {
                    if (next[key] > 0) {
                        next[key] -= 1;
                        hasChanged = true;
                    } else {
                        delete next[key];
                        hasChanged = true;
                    }
                });
                return hasChanged ? next : prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    /**
     * Start cooldown for a specific item
     * @param id - Item ID
     * @param seconds - Cooldown duration in seconds (default: 60)
     */
    const startCooldown = useCallback((id: string, seconds: number = 60) => {
        setCooldowns(prev => ({ ...prev, [id]: seconds }));
    }, []);

    /**
     * Check if an item is on cooldown
     * @param id - Item ID
     * @returns true if item is on cooldown, false otherwise
     */
    const isOnCooldown = useCallback((id: string) => {
        return !!cooldowns[id];
    }, [cooldowns]);

    /**
     * Get remaining cooldown time for an item
     * @param id - Item ID
     * @returns Remaining seconds or 0
     */
    const getCooldown = useCallback((id: string) => {
        return cooldowns[id] || 0;
    }, [cooldowns]);

    /**
     * Clear cooldown for a specific item
     * @param id - Item ID
     */
    const clearCooldown = useCallback((id: string) => {
        setCooldowns(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    /**
     * Clear all cooldowns
     */
    const clearAllCooldowns = useCallback(() => {
        setCooldowns({});
    }, []);

    return {
        cooldowns,
        startCooldown,
        isOnCooldown,
        getCooldown,
        clearCooldown,
        clearAllCooldowns,
    };
}
