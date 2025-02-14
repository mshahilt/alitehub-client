import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../userInstance";

export const login = createAsyncThunk(
    "auth/login",
    async (
        credential: { userType: "user" | "company"; email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post(`/auth/${credential.userType}/login`, credential);
            return response.data.response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
    }
);


export const register = createAsyncThunk(
    "auth/register",
    async (
        { userType, ...credential }: { 
            userType: "user" | "company"; 
            username: string; 
            name: string; 
            email: string; 
            password: string; 
        }, 
        { rejectWithValue }
    ) => {
        try {
            console.log(credential, `inside thunk register function for ${userType}`);
            const response = await axiosInstance.post(`/auth/${userType}/register`, credential);
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

export const generateOtp = createAsyncThunk(
    "auth/generateOtp",
    async (email: string, { rejectWithValue }) => {
        try {

            const response = await axiosInstance.post("/auth/user/generateOtp", { email });
            console.log("from generate otp ap",response)

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || "An error occurred");
            } else {
                return rejectWithValue("Something went wrong");
            }
        }
    }
);

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (
      { userType, token }: { userType: "user" | "company"; token: string },
      { rejectWithValue }
    ) => {
      try {
        console.log(`Google login for ${userType}`);
        console.log(`Token: ${token}`);
        
        const response = await axiosInstance.post(`/auth/${userType}/google-login`, { token });
        console.log("jaba jaba jaba jaba",response.data)
        return response.data.response;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Google login failed");
      }
    }
  );
  
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