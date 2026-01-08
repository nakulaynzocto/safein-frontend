export const extractIdString = (id: unknown): string => {
    if (!id) return "";
    if (typeof id === "string") return id.trim();
    if (typeof id === "object" && id !== null) {
        const obj = id as any;
        if (obj._id) return String(obj._id).trim();
        if (typeof obj.toString === "function") {
            const str = obj.toString();
            if (str !== "[object Object]" && /^[0-9a-fA-F]{24}$/.test(str)) return str.trim();
        }
    }
    const str = String(id).trim();
    return str !== "[object Object]" && str !== "undefined" && str !== "null" ? str : "";
};

export const isValidId = (id: string): boolean => {
    return !!id && id.length >= 20 && id !== "undefined" && id !== "null" && id !== "[object Object]";
};
