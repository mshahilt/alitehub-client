import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register, generateOtp, googleLogin } from "../../../../services/api/auth/authApi";
import axiosInstance from "../../../../services/api/userInstance";
import axios from "axios";

export interface User {
    name: string;
    username: string;
    email: string;
}

export interface UserAuthState {
    user: User;
    loading: boolean;
    error: string | null;
    isUsernameAvailable: {
        status: boolean | null;
        loading: boolean;
    };
}

const initialState: UserAuthState = {
    user: { name: "", username: "", email: "" },
    loading: false,
    error: null,
    isUsernameAvailable: { status: null, loading: false },
};

const usernameCheck = createAsyncThunk(
    "auth/usernameCheck",
    async (username: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/auth/user/checkUsernameAvailability?username=${username}`);
            return response.data; 
        } catch (error) {
            return rejectWithValue(axios.isAxiosError(error) ? error.response?.data : error);
        }
    }
);

export const fetchUserProfile = createAsyncThunk<User, string>(
    "user/fetchProfile",
    async (username, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/${username}`);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
        }
    }
);

export const getMe = createAsyncThunk<User>(
    "user/getMe",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/getMe`);
            console.log("get me",response.data.user)
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
        }
    }
);

const userAuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUserFormData: (
            state,
            action: PayloadAction<{ stateType: keyof UserAuthState; name: keyof User; value: any }>
        ) => {
            const { stateType, name, value } = action.payload;
            if (stateType === "user") {
                state.user[name] = value;
            } else if (stateType === "isUsernameAvailable") {
                state.isUsernameAvailable.status = value.status;
                state.isUsernameAvailable.loading = value.loading;
            } else if (stateType === "loading") {
                state.loading = value;
            } else if (stateType === "error") {
                state.error = value;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Login failed";
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
                getMe()
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Registration failed";
            })
            .addCase(usernameCheck.pending, (state) => {
                state.isUsernameAvailable.loading = true;
                state.error = null;
            })
            .addCase(usernameCheck.fulfilled, (state, action) => {
                state.isUsernameAvailable.loading = false;
                state.isUsernameAvailable.status = action.payload.data;
            })
            .addCase(usernameCheck.rejected, (state, action) => {
                state.isUsernameAvailable.loading = false;
                state.error = typeof action.payload === "string" ? action.payload : "Username check failed";
                state.isUsernameAvailable.status = false;
            })
            .addCase(generateOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(generateOtp.rejected, (state, action) => {
                state.loading = false; 
                state.error = typeof action.payload === "string" ? action.payload : "OTP generation failed";
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Google login failed";
            })
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getMe.rejected, (state) => {
                state.loading = false;
            })
    },
});

export const { setUserFormData } = userAuthSlice.actions;
export { usernameCheck };
export default userAuthSlice.reducer;
