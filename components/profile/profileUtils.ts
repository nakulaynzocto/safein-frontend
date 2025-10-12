// ---------- Utils ----------
export const getUserInitials = (name?: string, companyName?: string) =>
  (companyName
    ? companyName.substring(0, 2)
    : name?.substring(0, 2) ?? "U"
  ).toUpperCase()

export const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString() : "Not provided"

export const formatValue = (value?: string) =>
  value?.trim() || "Not provided"
