/**
 * Helper functions for creating select options
 */

export interface OptionItem {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    status?: "Active" | "Inactive" | string;
    department?: string;
    designation?: string;
    photo?: string;
}

export interface CreateOptionsParams<T extends OptionItem> {
    items: T[];
    selectedId: string | undefined;
    selectedItem: T | undefined;
    formatLabel: (item: T) => string;
    formatSearchKeywords: (item: T) => string;
    filterFn?: (item: T) => boolean;
}

/**
 * Common function to create select options for employees or visitors
 * Includes selected item even if not in current search results
 */
export const createSelectOptions = <T extends OptionItem>({
    items,
    selectedId,
    selectedItem,
    formatLabel,
    formatSearchKeywords,
    filterFn,
}: CreateOptionsParams<T>) => {
    // Apply filter if provided (e.g., filter active employees)
    const filteredItems = filterFn ? items.filter(filterFn) : items;

    // Create options from filtered items
    const options = filteredItems.map((item) => ({
        value: item._id,
        label: formatLabel(item),
        searchKeywords: formatSearchKeywords(item),
        image: item.photo,
    }));

    // Include selected item if not in current options
    if (selectedId && !options.find((opt) => opt.value === selectedId)) {
        let foundItem = items.find((item) => item._id === selectedId);
        if (!foundItem && selectedItem) {
            foundItem = selectedItem;
        }

        if (foundItem) {
            options.unshift({
                value: foundItem._id,
                label: formatLabel(foundItem),
                searchKeywords: formatSearchKeywords(foundItem),
                image: foundItem.photo,
            });
        }
    }

    return options;
};
