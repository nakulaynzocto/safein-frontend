import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { User } from "../api/authApi";
import { clearAuthData } from "@/utils/helpers";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            clearAuthData();
        },
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            if (!action.payload.token || action.payload.token === "undefined" || action.payload.token.length < 10) {
                return;
            }

            if (!action.payload.user) {
                return;
            }

            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            if (typeof window !== "undefined") {
                localStorage.setItem("token", action.payload.token);
                localStorage.setItem("user", JSON.stringify(action.payload.user));
                const expires = new Date();
                expires.setDate(expires.getDate() + 7);
                document.cookie = `safein_auth_token=${action.payload.token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            }
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(action.payload));
            }
        },
        initializeAuth: (state) => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("token");
                const userStr = localStorage.getItem("user");

                if (token && token !== "undefined" && token.length > 10) {
                    state.token = token;
                    state.isAuthenticated = true;

                    if (userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            if (user && user.id && user.email) {
                                state.user = user;
                            }
                        } catch (e) {
                            localStorage.removeItem("user");
                        }
                    }

                    const expires = new Date();
                    expires.setDate(expires.getDate() + 7);
                    document.cookie = `safein_auth_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
                } else {
                    clearAuthData();
                }
            }
        },
    },
});

export const { logout, setCredentials, setUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
