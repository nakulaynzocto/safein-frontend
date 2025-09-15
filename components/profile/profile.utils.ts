// ---------- Utils ----------
export const getUserInitials = (firstName?: string, lastName?: string) =>
  (firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : firstName?.[0] ?? "U"
  ).toUpperCase()

export const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString() : "Not provided"

export const formatValue = (value?: string) =>
  value?.trim() || "Not provided"

export const formatGender = (gender?: string) =>
  gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "Not provided"
