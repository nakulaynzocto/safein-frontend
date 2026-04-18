import { useCallback, useState } from "react";

/** Toggle string section ids for Collapsible open state (settings pages). */
export function useCollapsibleSections(initialOpen: string[] = []) {
    const [expandedSections, setExpandedSections] = useState<string[]>(initialOpen);

    const toggleSection = useCallback((section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
        );
    }, []);

    return { expandedSections, toggleSection, setExpandedSections };
}
