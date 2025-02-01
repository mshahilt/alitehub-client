import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register } from "../../../services/api/auth/authApi";
import axiosInstance from "../../../services/api/instance";
import axios from "axios";

export interface AuthState {
    user: {
        name: string;
        username: string;
        email: string;
        password: string;
    };
    loading: boolean;
    error: string | null;
    isUsernameAvailable: {
        status: boolean | null;
        loading: boolean;
    };
}


const initialState: AuthState = {
    user: {
        name: "",
        username: "",
        email: "",
        password: "",
    },
    loading: false,
    error: null,
    isUsernameAvailable: {
        status: null,
        loading: false
    },
};

const usernameCheck = createAsyncThunk(
    "auth/usernameCheck", 
    async (username: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/user/checkUsernameAvailability?username=${username}`);
            return response.data; 
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setFormData: (state, action: PayloadAction<{ stateType: keyof AuthState; name: keyof AuthState['user']; value: any }>) => {
            const { stateType, name, value } = action.payload;
            if (stateType === "user") {
                state.user[name] = value;
            } else if (stateType === "isUsernameAvailable") {
                state.isUsernameAvailable = value;
            } else if (stateType === "loading") {
                state.loading = value;
            } else if (stateType === "error") {
                state.error = value;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action: PayloadAction<AuthState['user']>) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Login failed";
        });
        builder.addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action: PayloadAction<AuthState['user']>) => {
            state.loading = false;
            console.log("from builder",action.payload)
            state.user = action.payload;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Registration failed";
        });
        builder.addCase(usernameCheck.pending, (state) => {
            state.isUsernameAvailable.loading = true;
            state.error = null;
        });
        builder.addCase(usernameCheck.fulfilled, (state, action) => {
            state.isUsernameAvailable.loading = false;
            state.isUsernameAvailable.status = action.payload.data;
        });
        builder.addCase(usernameCheck.rejected, (state, action) => {
            state.isUsernameAvailable.loading = false;
            state.error = typeof action.payload === 'string' ? action.payload : "Username check failed";
            state.isUsernameAvailable.status = false; 
        });
    }
});

export const { setFormData } = authSlice.actions;
export { usernameCheck };
export default authSlice.reducer;
