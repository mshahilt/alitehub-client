import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register } from "../../services/api/auth/authApi";

interface AuthState {
    user: {email: string} | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action: PayloadAction<{email: string}>) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        builder.addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action: PayloadAction<{email: string}>) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;