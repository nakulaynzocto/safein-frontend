/**
 * useUserCountry
 * Returns the user's saved country ISO code (e.g. "IN", "US", "GB")
 * from the Redux auth state — used as defaultCountry for PhoneInputField
 * across all forms so the flag/dial code matches their profile country.
 */
import { useAppSelector } from "@/store/hooks";

export function useUserCountry(): string {
    const user = useAppSelector((state) => state.auth.user);
    // user.address.country stores the ISO code (e.g. "IN", "US")
    const country = user?.address?.country;
    if (country && typeof country === "string" && country.length >= 2) {
        return country.toUpperCase();
    }
    return "IN"; // fallback
}
