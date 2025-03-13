import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register, generateOtp, googleLogin } from "../../../../services/api/auth/authApi";
import axiosInstance from "../../../../services/api/userInstance";
import axios from "axios";
import { RootState } from "../../store";

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    contact: {
        phone: string | null;
    };
    profile_picture: string | null;
    resume_url: string | null;
    video_url: string | null;
    job_types: string[];
    industries: string[];
    skills: string[];
    education: Array<{
        institution: string;
        degree: string;
        field: string;
        start_date: string;
        end_date: string;
    }>;
    experience: Array<{
        company: string;
        title: string;
        start_date: string;
        end_date: string;
        description: string;
    }>;
}

export interface UserAuthState {
    user: User;
    loading: boolean;
    error: string | null;
    ownAccount: boolean;
    connectionInfo: {
        id: string;
        userId1: string;
        userId2: string;
        status: string;
        requestedAt: Date;
    };
    isUsernameAvailable: {
        status: boolean | null;
        loading: boolean;
    };
    fetchedProfile: User | null;
    existingUser: User;
}

const initialState: UserAuthState = {
    user: {
        id: "",
        name: "",
        username: "",
        email: "",
        contact: {
            phone: null,
        },
        profile_picture: null,
        resume_url: null,
        video_url: null,
        job_types: [],
        industries: [],
        skills: [],
        education: [],
        experience: [],
    },
    ownAccount: false,
    connectionInfo: {
        id: "",
        userId1: "",
        userId2: "",
        status: "",
        requestedAt: new Date(),
    },
    loading: false,
    error: null,
    isUsernameAvailable: { status: null, loading: false },
    fetchedProfile: null,
    existingUser: {
        id: "",
        name: "",
        username: "",
        email: "",
        contact: {
            phone: null,
        },
        profile_picture: null,
        resume_url: null,
        video_url: null,
        job_types: [],
        industries: [],
        skills: [],
        education: [],
        experience: [],
    },
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

export const fetchUserProfile = createAsyncThunk<
    { user: User; ownAccount: boolean; connectionInfo: any },
    string
>(
    "user/fetchProfile",
    async (username, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/${username}`);
            console.log("inside fetch user profile async thunk", response.data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
        }
    }
);

export const followOrUnfollow = createAsyncThunk<
    { id: string; userId1: string; userId2: string; status: string; requestedAt: Date },
    { userId2: string; connectionStatus: string }
>(
    "user/followOrUnfollow",
    async ({ userId2, connectionStatus }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const connectionInfo = state.userAuth.connectionInfo;

            if (connectionStatus) {
                if (connectionStatus === "accept") {
                    console.log("inside async thunk", connectionInfo);
                    const response = await axiosInstance.put(
                        `/connection/${connectionInfo.id}/accept`,
                        { userId2 }
                    );
                    console.log("Response after accepting follow request:", response);
                    return response.data.data;
                } else if (connectionStatus === "reject") {
                    const response = await axiosInstance.put(
                        `/connection/${connectionInfo.id}/decline`,
                        { userId2 }
                    );
                    console.log("Response after rejecting follow request:", response);
                    return response.data.data;
                } else if (connectionStatus === "disconnect") {
                    const response = await axiosInstance.delete(`/connection/${connectionInfo.id}`);
                    console.log("Response after unfollowing:", response);
                    return response.data.data;
                }
            }

            const response = await axiosInstance.post("/connection/", { userId2 });
            console.log("Response after follow/unfollow:", response);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to follow/unfollow user"
            );
        }
    }
);


export const getMe = createAsyncThunk<User>(
    "user/getMe",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/getMe`);
            console.log("getMe response:", response.data.user);

            if (response.data.user.isBlocked) {
                alert("User blocked by admin");
                localStorage.removeItem("token");
                window.location.href = "/login";
                return rejectWithValue("User is blocked");
            }

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
                state.existingUser = action.payload;
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
                state.loading = false;
                state.existingUser = action.payload;
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
                state.existingUser = action.payload;
                state.user = action.payload;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Google login failed";
            })
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<{ user: User; ownAccount: boolean; connectionInfo: any }>) => {
                state.loading = false;
                console.log("inside fetch user profile reducer", action.payload);
                state.fetchedProfile = action.payload.user;
                state.ownAccount = action.payload.ownAccount;
                state.connectionInfo = action.payload.connectionInfo;
                state.user = action.payload.user;
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
                state.existingUser = action.payload;
            })
            .addCase(getMe.rejected, (state) => {
                state.loading = false;
            })
            .addCase(followOrUnfollow.pending, (state) => {
                state.loading = true;
            })
            .addCase(followOrUnfollow.fulfilled, (state, action) => {
                state.loading = false;
                console.log("inside follow/unfollow reducer", action.payload);
                state.connectionInfo = action.payload;
            })
            .addCase(followOrUnfollow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUserFormData } = userAuthSlice.actions;
export { usernameCheck };
export default userAuthSlice.reducer;