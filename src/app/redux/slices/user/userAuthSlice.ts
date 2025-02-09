import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register, generateOtp, googleLogin } from "../../../../services/api/auth/authApi";
import axiosInstance from "../../../../services/api/userInstance";
import axios from "axios";

export interface UserAuthState {
    user: {
        accessToken: string;
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


const initialState: UserAuthState = {
    user: {
        name: "",
        username: "",
        email: "",
        password: "",
        accessToken: ""
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
            const response = await axiosInstance.get(`/auth/user/checkUsernameAvailability?username=${username}`);
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

const userAuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUserFormData: (state, action: PayloadAction<{ stateType: keyof UserAuthState; name: keyof UserAuthState['user']; value: any }>) => {
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
        builder.addCase(login.fulfilled, (state, action: PayloadAction<UserAuthState['user']>) => {
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
        builder.addCase(register.fulfilled, (state, action: PayloadAction<UserAuthState['user']>) => {
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
        builder.addCase(generateOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(generateOtp.fulfilled, (state) => {
            state.loading = false;
            state.error = null;
        })
        builder.addCase(generateOtp.rejected, (state, action) => {
            state.loading = true;
            state.error = typeof action.payload === 'string' ? action.payload : "otp genartion failed";
        })
        builder.addCase(googleLogin.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(googleLogin.fulfilled, (state, action: PayloadAction<UserAuthState['user']>) => {
            state.loading = false;
            console.log("inside add case of google login full filled", action.payload)
            localStorage.setItem('token', action.payload.accessToken)
            state.user = action.payload;
        });
        builder.addCase(googleLogin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Google login failed";
        });

    }
});

export const { setUserFormData } = userAuthSlice.actions;
export { usernameCheck };
export default userAuthSlice.reducer;
