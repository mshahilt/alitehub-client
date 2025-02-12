import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./slices/user/userAuthSlice";
import companyAuthReducer from "./slices/company/companyAuthSlice"
import userState from "./slices/user/userSlice"

export const store = configureStore({
    reducer: {
        userAuth: userAuthReducer,
        companyAuth: companyAuthReducer,
        userState: userState
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;