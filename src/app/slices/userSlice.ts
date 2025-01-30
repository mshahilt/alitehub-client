import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUser } from "../../services/api/user/userApi";

interface UserState {
    user: {name: string; email: string} | null;
    users: {name: string; email: string}[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    users: null,
    loading: false,
    error: null,
}


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearUsers(state) {
            state.users = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<{name: string; email: string}>) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(fetchUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
})

export const { clearUsers } = userSlice.actions;
export default userSlice.reducer;