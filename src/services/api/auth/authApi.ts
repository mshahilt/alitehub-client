import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../instance";

export const login = createAsyncThunk(
    "auth/login",
    async (credential: { email: string; password: string }, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.post("/auth/login", credential);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
})


export const register = createAsyncThunk(
    "auth/register",
    async (credential: {username: string, name:string, email: string; password: string }, {rejectWithValue}) => {
        try {
            console.log(credential,"inside thunk register fun")
            const response = await axiosInstance.post("/user/register", credential);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
})

// export const usernameCheck = createAsyncThunk(
//     "user/usernameCheck",
//     async(payload: {username:string}, {rejectWithValue}) =>{
//         try {
//             const response = await axiosInstance.post("/user/checkUsernameAvailability", payload.username);
//             console.log(response);
//         } catch (error) {
//             if (axios.isAxiosError(error) && error.response) {
//                 return rejectWithValue(error.response.data);
//             } else {
//                 return rejectWithValue(error);
//             }
//         }
//     }
// )